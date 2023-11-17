import React, {useEffect, useState} from "react";
import {StyleSheet, View, Text, ActivityIndicator, Dimensions, Image} from "react-native";
import GlobalStyles from "../../../constants/GlobalStyles";
import Colors from "../../../constants/Colors";

// TODO: this one is critical, fast image in none of it's variants works on expo, at least not for me, not even the dedicated expo packages,
//       we need to resolve this ASAP, otherwise the loading times will be unbearable
//import FastImage from 'react-native-fast-image'; // expo-fast-image and expo-react-native-fast-image and react-native-fast-image-expo don't work either, none of the online fixes had worked


const FeaturedArt = () => {
	const requiredFields = [
		'id',
		'title',
		'image_id',
		'description',
		'thumbnail',
	].toString();

	// we randomly pick one of the artworks from the 100k most recently updated
	// important: since this is 'Art of the day', the artwork should stay constant throughout the day, thus we seed by the current date
	const currentDate = new Date();
	const seed = currentDate.getFullYear() * 10000 + (currentDate.getMonth() + 1) * 100 + currentDate.getDate();
	const featuredArtIndex = seed % 1000; // planned: 40k, hard limit: 1k

	const candidateSearchQuery: string = `https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&[is_boosted]=true&limit=1&fields=${requiredFields}&page=${featuredArtIndex}`;

	const removeTagsFromString = (text: string) => {
		// this function removes any html tags from the text
		// reference: https://stackoverflow.com/questions/74669280/removing-html-tags-from-string-in-react
		const regex = /(<([^>]+)>)/gi;
		return text.replace(regex, "");
	}

	type featuredObject = {
		title: string | undefined,
		description: string | undefined,
		imageFileUrl: string | undefined,
		height: number | null | undefined,
	};
	const [featuredDetails, setFeaturedDetails] = useState<featuredObject>({} as featuredObject);
	const [isArtLoaded, setIsArtLoaded] = useState(false);

	// by running the fetch inside this useEffect, i ensure that the fetch only runs once
	useEffect(() => {
		fetch(candidateSearchQuery).then(res => res.json()).then((res) => {
			console.log('fetching');
			const imageId = res.data[0]['image_id'];
			const thumbnailObject = res.data[0]['thumbnail'];
			const altText = thumbnailObject['alt_text'];
			// object may not have a description, in that case, use alt_text
			const hwRatio = thumbnailObject['height'] != null ? thumbnailObject['height'] / thumbnailObject['width'] : null;
			// todo: in case of null hwRatio, we have to extract it from the 'dimensions' string
			setFeaturedDetails({
				title: res.data[0]['title'],
				description: removeTagsFromString(res.data[0]['description'] || altText),
				imageFileUrl: `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`,
				height: hwRatio != null ? Dimensions.get('window').width * hwRatio : null,
			});
			setIsArtLoaded(true);
		});
	}, []);

	// display spinner while the image is loading
	if (!isArtLoaded) {
		return <ActivityIndicator size='large' color={Colors.primaryAccent}/>;
	}

	return (
		<View style={styles.featuredRoot}>
			<Text style={[styles.featuredHeader, GlobalStyles.headerFont]}>Art of the day</Text>
			<View style={styles.featuredPopout}>
				<Image source={{uri: featuredDetails.imageFileUrl}} style={[styles.featuredImage, {height: featuredDetails.height}]}/>
				<Text style={styles.featuredTitle}>
					{featuredDetails.title}
				</Text>
				<Text style={styles.featuredDescription}>
					{featuredDetails.description}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	featuredRoot: {
		flex: 1,
		width: Dimensions.get('window').width,
		height: 'auto',
		padding: 10,
		//marginTop: 20,
	},
	featuredPopout: {
		borderStyle: 'solid',
		borderRadius: 8,
		borderWidth: 2,
		borderColor: Colors.primaryAccent,
		padding: 10,
	},
	featuredHeader: {
		textAlign: 'left',
		fontSize: 34,
		marginBottom: 8,
		marginLeft: 14,
	},
	featuredImage: {
		// default values, should be immediately replaced with the dynamically set ones
		flex: 1,
		height: 250,
		borderRadius: 8,
	},
	featuredTitle: {
		fontSize: 18,
		fontWeight: "800",
		margin: 8,
		marginBottom: 6,
	},
	featuredDescription: {

	}
});

export default FeaturedArt;