import ViewModes from "../constants/ViewModes";
import React from "react";
import {useCurrentModeContext} from "../contexts/CurrentModeContext";
import ExploreScreen from "../screens/ExploreScreen/ExploreScreen";
import FavouritesScreen from "../screens/FavouritesScreen/FavouritesScreen";
import CategoriesScreen from "../screens/CategoriesScreen/CategoriesScreen";
import SearchScreen from "../screens/SearchScreen/SearchScreen";

const ScreenManager = () => {
	const { currentMode, setCurrentMode } = useCurrentModeContext();

	let screenTranslationTable = new Map([
		[ViewModes.explore, <ExploreScreen/>],
		[ViewModes.search, <SearchScreen/>],
		[ViewModes.categories, <CategoriesScreen/>],
		[ViewModes.favourites, <FavouritesScreen/>],
	]);

	// in an unexpected case when a screen for the selected mode is not yet implemented, reset the mode and redirect back to the explore screen
	if (!screenTranslationTable.has(currentMode)) {
		new Promise(() => setCurrentMode(ViewModes.explore));
		return screenTranslationTable.get(ViewModes.explore)
	}

	return screenTranslationTable.get(currentMode);
}

export default ScreenManager;