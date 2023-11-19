import {
	Dimensions,
	StyleSheet,
	View,
} from "react-native";
import React from "react";
import FeaturedArt from "./components/FeaturedArt";
import PopularArt from "./components/PopularArt";
import InfiniteScrollQuery from "../../components/InfiniteScrollQuery";

const ExploreScreen = () => {
	return (
		<InfiniteScrollQuery startingPage={2} firstPageOverride={(
			<View style={styles.infiniteTileContainer}>
				<FeaturedArt/>
				<PopularArt/>
			</View>
		)}/>
	);
}

export default ExploreScreen;

const styles = StyleSheet.create({
	rootExploreElement: {
		width: Dimensions.get('window').width,
		flex: 1,
		padding: 10,
		marginBottom: 60,
		flexDirection: 'column',
	},
	infiniteTileContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
	},
});