import React, {useEffect, useState} from "react";
import {Image, ScrollView, View, Text, StyleSheet, Dimensions, ActivityIndicator} from "react-native";
import {useCurrentModeContext} from "../../contexts/CurrentModeContext";
import {useDisplayedArtIdContext} from "../../contexts/DisplayedArtIdContext";
import ViewModes from "../../constants/ViewModes";
import Colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";

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

};

const removeTagsFromString = (text: string) => {
	if (!text)
		return null;
	// this function removes any html tags from the text - duplicated from FeaturedArt.tsx file
	const regex = /(<([^>]+)>)/gi;
	return text.replace(regex, "");
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

				} as ArtPositionProps
			);
		});
	}, [artId]);

	console.log(artData);
	return artData;
};

type ArtInfoProps = {
	artId: number | null,
};
const ArtInfoScreen = () => {
	const {artId, setArtId} = useDisplayedArtIdContext();
	const requestUrl =  `https://api.artic.edu/api/v1/artworks/${artId}`;
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	const artData = getDataById(artId ?? 0);

	const imageUrl = `https://www.artic.edu/iiif/2/${artData.imageId}/full/843,/0/default.jpg`;
	const hwRatio = (artData?.thumbnail?.height && artData?.thumbnail?.width) ? (artData.thumbnail.height / artData.thumbnail.width) : null;
	const finalHeight = hwRatio ? ((Dimensions.get('window').width - 20) * hwRatio) : null;

	if (artId == null) {
		// exit this view
		// we are performing this so late because we have to load all constants before returning anything
		// exiting via setCurrentMode isn't an option either, as it would result in the exactly same error
		// either way, now after some fixes this situation SHOULD never happen, but if it does, this is the safeguard for it
		return <View/>;
	}

	if (!artData) {
		return <ActivityIndicator size='large' color={Colors.primaryAccent} style={styles.mainImage}/>;
	}

	// The reason why for most elements here i am directly styling, is that since this is a large, mostly formatted text document,
	// it will be much easier correlate changes happening in here, and on the client side this way.
	// There is no point in transferring small, unrepeatable styles to the spreadsheets
	return (
		<ScrollView style={styles.artRoot}>
			<Image source={{uri: imageUrl}} style={[styles.mainImage, hwRatio != null ? {height: finalHeight} : {height: 400}]}/>
			<View style={styles.headerContainer}>
				<Text style={styles.headerTitle}>{artData.title}</Text>
				<Text style={styles.headerAuthor}>{artData.author}, {artData.date}</Text>
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
				{
					// automatically converts raw data into a formatted list
					[
						['Title', artData.title],
						['Author', artData.author],
						['Place of origin', artData.placeOfOrigin],
						['Date of creation', artData.date],
						['Artwork type', artData.artworkType],
						['Dimensions', artData.dimensions],
					].map((entry, index) => (
						(entry[1]) ?
							<View style={[styles.infoTextElement, styles.lightSeparator]} key={index}>
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
		backgroundColor: 'tomato',
		width: '100%',
		height: 400,
	},
	headerContainer: {
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
	infoTextContainer: {
		margin: 20,
		marginTop: 5,
		borderBottomWidth: 0,
	},
	infoTextElement: {
		padding: 4,
	},
});

export default ArtInfoScreen;
export {ArtPositionProps /*, displayArtInfo*/};