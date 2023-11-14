import {RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import FeaturedArt from "./components/FeaturedArt";
import PopularArt from "./components/PopularArt";
import React, {useState} from "react";
import ViewModes from "../../constants/ViewModes";
import {useCurrentModeContext} from "../../contexts/CurrentModeContext";

const ExploreScreen = () => {
	const [pageIndex, setPageIndex] = useState(0);
	const pagesLoadedAtOnce = 3;
	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = () => {

	};
	const addRefreshControl = () => (
		<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
	);

	/* Pagination offset:
		0: Featured art section + Popular art section,
		1-∞: Infinitely scrolling art  */
	return (
		<ScrollView refreshControl={addRefreshControl()}>
			{/* Contains Featured and popular art, we treat is as page 0 in pagination */}
			<View>
				<FeaturedArt/>
				<PopularArt/>
			</View>
			{/* vvv Infinite loading via pagination */}
			<View style={styles.infiniteTileContainer}>

			</View>
		</ScrollView>

	);
}

export default ExploreScreen;

const styles = StyleSheet.create({
	infiniteTileContainer: {

	}

});