import React, {useEffect, useState} from "react";
import {Image, ScrollView, View, Text, StyleSheet, Dimensions, ActivityIndicator, Pressable, Modal} from "react-native";
import {useCurrentModeContext} from "../../contexts/CurrentModeContext";
import {useDisplayedArtIdContext} from "../../contexts/DisplayedArtIdContext";
import ViewModes from "../../constants/ViewModes";
import Colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";
import ImageViewer from 'react-native-image-zoom-viewer';
import SaveButton from "../../components/SaveButton";
import {MaterialIcons} from "@expo/vector-icons";
import InfiniteScrollQuery from "../../components/InfiniteScrollQuery";

// todo: this can be done semi-automatically, i can either bind these value names to the request's value names, or just give them the same names, then iterate over the .keys(),
//       only nested objects like thumbnail object may be more difficult
type ArtPositionProps = {
	id: number,
	title: string | null,
	imageId: string | null,
	thumbnail?: {
		width: number | null,
		height: number | null,
	},
	description: string | null,
	author: string | null,
	placeOfOrigin: string | null,
	date: number | null,
	artworkType: string | null, // this property refers to the medium: canvas, sculpture, etc.
	dimensions: string | null,
	artistId: number | null,
};

type AuthorPositionProps = {
	id: number,
	authorTitle: string | null,
	description: string | null,
	dateOfBirth: string | null,
	dateOfDeath: number | null,
};

const removeTagsFromString = (text: string) => {
	if (!text)
		return null;
	// this function removes any html tags from the text - duplicated from FeaturedArt.tsx file
	const regex = /(<([^>]+)>)/gi;
	return text.replace(regex, "");
}

const getAuthorDataById = (authorId: number) => {
	const [artistData, setArtistData] = useState({} as AuthorPositionProps);
	const requestUrl =  `https://api.artic.edu/api/v1/agents/${authorId}`;

	useEffect(() => {
		fetch(requestUrl).then((res) => res.json()).then((res) => {
			let item = res.data;
			setArtistData({
					id: item['id'],
					authorTitle: item['title'],
					description: removeTagsFromString(item['description']),
					dateOfBirth: item['birth_date'],
					dateOfDeath: item['death_date'],
				} as AuthorPositionProps
			);
		});
	}, [authorId]);

	//console.log(artData);
	return artistData;
};

const ArtistInfoComponent = ({authorId}: {authorId: number}) => {
	const requestUrl =  `https://api.artic.edu/api/v1/agents/${authorId}`;
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	const artistData: AuthorPositionProps = getAuthorDataById(authorId);

	useEffect(() => {
		if (artistData == ({} as AuthorPositionProps))
			setIsDataLoaded(false);
		else
			setIsDataLoaded(true);
	}, [artistData]);

	// todo: search related artworks by author_title instead of ?q=author_title

	return (
		<ScrollView style={[styles.artRoot, {padding: 6, alignContent: 'center'}]}>
			<Text style={[styles.headerTitle, {textAlign: 'center'}]}>{artistData.authorTitle}</Text>
			<View>
				{
					artistData.description ?
						<Text style={{fontSize: 16, textAlign: 'justify', borderRadius: 4, padding: 4, paddingBottom: 0}}>
							{artistData.description}
						</Text>
						:
						<Text style={{textAlign: 'center', margin: 12}}>
							No description available for this artist
						</Text>
				}
			</View>
			<View style={[styles.infoTextContainer, GlobalStyles.lightBorders]}>
				{
					// automatically converts raw data into a formatted list
					[
						['Author', artistData.authorTitle],
						['Date of birth', artistData.dateOfBirth],
						['Date of death', artistData.dateOfDeath],
					].map((entry, index) => (
						(entry[1]) ?
							<View style={[{padding: 4}, styles.lightSeparator]} key={index}>
								<Text style={{fontWeight: '600'}}>{entry[0]}</Text><Text>{entry[1]}</Text>
							</View>
							:
							<View key={index}/>
					))
				}
			</View>
			<InfiniteScrollQuery searchTerm={artistData.authorTitle ?? ''} style={{width: '99.5%'}}/>
			<View style={{height: 20}}/>
		</ScrollView>
	);
}

const getDataById = (artId: number): ArtPositionProps => {
	const [artData, setArtData] = useState({} as ArtPositionProps);
	const requestUrl = `https://api.artic.edu/api/v1/artworks/${artId}`;

	// console.log('Downloading data for this url:', requestUrl);

	useEffect(() => {
		fetch(requestUrl).then((res) => res.json()).then((res) => {
			let item = res.data;
			let itemThumbnail = item['thumbnail'];
			setArtData({
					id: item['id'],
					imageId: item['image_id'],
					title: item['title'],
					thumbnail: {
						height: item['thumbnail'] ? item['thumbnail']['height'] : null,
						width: item['thumbnail'] ? item['thumbnail']['width'] : null,
					},
					description: removeTagsFromString(item['description']) ?? removeTagsFromString(itemThumbnail['alt_text']) ?? null,
					author: item['artist_title'] ?? item['artist_display'] ?? 'unknown artist',
					placeOfOrigin: item['place_of_origin'] ?? 'unknown place of origin',
					date: item['date_display'] ?? 'unknown year of creation',
					artworkType: item['medium_display'], // this property refers to the medium: canvas, sculpture, etc.
					dimensions: item['dimensions'],
					artistId: item['artist_id']
				} as ArtPositionProps
			);
		});
	}, [artId]);

	//console.log(artData);
	return artData;
};

const ArtInfoScreen = () => {
	const {artId, setArtId} = useDisplayedArtIdContext();
	const requestUrl =  `https://api.artic.edu/api/v1/artworks/${artId}`;
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [imageFullscreenMode, setImageFullscreenMode] = useState(false);
	const [showAuthorDetails, setShowAuthorDetails] = useState(false);

	const artData = getDataById(artId ?? 20684); // this placeholder should never be used, but it's essential to use a real value here

	useEffect(() => {
		if (artData == ({} as ArtPositionProps))
			setIsDataLoaded(false);
		else
			setIsDataLoaded(true);
	}, [artData]);

	const imageUrl = `https://www.artic.edu/iiif/2/${artData.imageId}/full/1686,/0/default.jpg`;
	const hwRatio = (artData?.thumbnail?.height && artData?.thumbnail?.width) ? (artData.thumbnail.height / artData.thumbnail.width) : null;
	const finalHeight = hwRatio ? ((Dimensions.get('window').width - 20) * hwRatio) : null;

	const renderImageViewer = () => {
		console.log('isImagerFullscreen:', imageFullscreenMode, 'imageUrl:', imageUrl);
		return (
			<Modal visible={true} transparent={true}>
				<ImageViewer
					enableSwipeDown
					imageUrls={[{
						url: imageUrl,
					}]}
					onSwipeDown={() => setImageFullscreenMode(false)}
				/>
			</Modal>
		);
	};

	if (artId == null) {
		// exit this view
		// we are performing this so late because we have to load all constants before returning anything
		// exiting via setCurrentMode isn't an option either, as it would result in the exactly same error
		// either way, now after some fixes this situation SHOULD never happen, but if it does, this is the safeguard for it
		return <View/>;
	}

	if (imageFullscreenMode) {
		return renderImageViewer();
	}

	if (showAuthorDetails && artData.artistId) {
		return (
			<ArtistInfoComponent authorId={artData.artistId}/>
		);
	}

	// The reason why for most elements here i am directly styling, is that since this is a large, mostly formatted text document,
	// it will be much easier correlate changes happening in here, and on the client side this way.
	// There is no point in transferring small, unrepeatable styles to the spreadsheets
	return (
		<ScrollView style={styles.artRoot}>
			<Pressable onPress={() => setImageFullscreenMode(true)}>
				{
					isDataLoaded ?
						<Image source={{uri: imageUrl}} style={[styles.mainImage, hwRatio != null ? {height: finalHeight} : {height: 400}]}/>
					:
						<ActivityIndicator size='large' color={Colors.primaryElement} style={styles.mainImage}/>
				}
			</Pressable>
			<View style={styles.headerContainer}>
				<View style={styles.captionContainer}>
					<Text style={styles.headerTitle}>{artData.title}</Text>
					<Text style={styles.headerAuthor}>{artData.author}, {artData.date}</Text>
				</View>
				<SaveButton entryId={artData.id} style={styles.headerSaveButton}/>
			</View>
			<View>
				{
					artData.description ?
						<Text style={{fontSize: 16, textAlign: 'justify', borderRadius: 4, padding: 4, paddingBottom: 0}}>
							{artData.description}
						</Text>
					:
						<Text style={{textAlign: 'center'}}>
							No description available for this artwork
						</Text>
				}
			</View>
			<View style={[styles.infoTextContainer, GlobalStyles.lightBorders]}>
				<View style={[styles.infoTextElement, styles.lightSeparator]}>
					<View>
						<Text style={{fontWeight: '600'}}>Author</Text><Text>{artData.author}</Text>
					</View>
					<Pressable onPress={() => {setShowAuthorDetails(true)}} style={{backgroundColor: Colors.minorAccent, padding: 4, paddingLeft: 6, borderRadius: 6, marginLeft: 'auto'}}>
						<MaterialIcons name="person-search" size={32} color="black" />
					</Pressable>
				</View>
				{
					// automatically converts raw data into a formatted list
					[
						['Title', artData.title],
						['Place of origin', artData.placeOfOrigin],
						['Date of creation', artData.date],
						['Artwork type', artData.artworkType],
						['Dimensions', artData.dimensions],
					].map((entry, index) => (
						(entry[1]) ?
							<View style={[{padding: 4}, styles.lightSeparator]} key={index}>
								<Text style={{fontWeight: '600'}}>{entry[0]}</Text><Text>{entry[1]}</Text>
							</View>
						:
							<View key={index}/>
					))
				}
			</View>
			<View style={{height: 20}}/>
		</ScrollView>
	);
}

// since this function uses hooks, it cannot be imported into any component, instead the contexts have to be loaded directly inside the component,
// that's ok because I'm only using it in the ArtPosition of InfiniteScrollQuery.tsx
const displayArtInfo = (newArtId: number) => {
	// set appropriate contexts, data, view
	const { artId, setArtId } = useDisplayedArtIdContext();
	const { currentMode, setCurrentMode } = useCurrentModeContext();
	setArtId(newArtId);
	setCurrentMode(ViewModes.details);
}

const styles = StyleSheet.create({
	lightSeparator: {
		borderColor: '#ccc',
		borderBottomWidth: 1,
	},
	artRoot: {
		flex: 1,
		width: Dimensions.get('window').width,
		height: 'auto',
		padding: 10,
		marginBottom: 60,
	},
	mainImage: {
		flex: 1,
		backgroundColor: Colors.minorAccent,
		width: '100%',
		height: 400,
	},
	headerContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	captionContainer: {
		flex: 1,
		padding: 6,
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	headerAuthor: {
		fontWeight: '500',
		fontStyle: 'italic',
	},
	headerSaveButton: {
		marginLeft: 'auto',
		marginRight: 8,
	},
	infoTextContainer: {
		margin: 20,
		marginTop: 5,
		borderBottomWidth: 0,
	},
	infoTextElement: {
		padding: 4,
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default ArtInfoScreen;
export {ArtPositionProps /*, displayArtInfo*/};