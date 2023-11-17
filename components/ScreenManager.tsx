import ViewModes from "../constants/ViewModes";
import React from "react";
import {useCurrentModeContext} from "../contexts/CurrentModeContext";
import ExploreScreen from "../screens/ExploreScreen/ExploreScreen";
import FavouritesScreen from "../screens/FavouritesScreen/FavouritesScreen";
import CategoriesScreen from "../screens/CategoriesScreen/CategoriesScreen";
import SearchScreen from "../screens/SearchScreen/SearchScreen";

const ScreenManager = () => {
	const { currentMode, setCurrentMode } = useCurrentModeContext();

	console.log('ScreenManager executed');

	let screenTranslationTable = new Map([
		[ViewModes.explore, <ExploreScreen/>],
		[ViewModes.search, <SearchScreen/>],
		[ViewModes.categories, <CategoriesScreen/>],
		[ViewModes.favourites, <FavouritesScreen/>],
	]);

	// in an unexpected case when a screen for the selected mode is not yet implemented, reset the mode and redirect back to the explore screen
	if (!screenTranslationTable.has(currentMode)) {
		// any changes to the currentMode context have to be asynchronous (made via a Promise),
		// but that doesn't matter, as in the very worst case scenario we will refresh the explore screen 1 additional time per error
		new Promise(() => setCurrentMode(ViewModes.explore));
		return screenTranslationTable.get(ViewModes.explore)
	}

	return screenTranslationTable.get(currentMode);
}

export default ScreenManager;