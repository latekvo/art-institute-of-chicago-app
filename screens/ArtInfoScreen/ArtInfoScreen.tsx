import React from "react";
import {Image, ScrollView, View, Text} from "react-native";

type ArtInfoProps = {
	artId: number,
};
const ArtInfoScreen = ({artId}: ArtInfoProps) => {
	const imageUrl = '';

	return (
		<ScrollView>
			<Image source={{uri: imageUrl}}/>
			<View>

			</View>
			<View>
				<Text></Text>
				<Text></Text>
			</View>
			<View>
				{
					// all other available info, dimensions, stats, etc
				}
			</View>
		</ScrollView>
	);
}

const displayArtInfo = (artId: number) => {
	// set appropriate contexts
}