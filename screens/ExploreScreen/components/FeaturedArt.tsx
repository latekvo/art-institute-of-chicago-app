import React from "react";
import {StyleSheet, View, Text, Image} from "react-native";
import GlobalStyles from "../../../constants/GlobalStyles";

const FeaturedArt = () => {
	// get list of 100 most popular images, randomly choose one (seeded by day)
	let featuredUrl = 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg';
	return (
		<View style={styles.featuredRoot}>
			<Text style={[styles.featuredHeader, GlobalStyles.headerFont]}>Art of the day</Text>
			<Image source={{uri: featuredUrl}} style={styles.featuredImage}/>
		</View>
	);
}

const styles = StyleSheet.create({
	featuredRoot: {
		flex: 1,
		height: 'auto',
		backgroundColor: 'tomato',
	},
	featuredHeader: {
		textAlign: "left",
		fontSize: 34,
	},
	featuredImage: {
		// default values, should be immediately replaced with the dynamically set ones
		width: 400,
		height: 250,
	},
	featuredTitle: {

	},
	featuredDescription: {

	}
});

export default FeaturedArt;