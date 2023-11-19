import {View} from "react-native";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InfiniteScrollQuery from "../../components/InfiniteScrollQuery";

const FavouritesScreen = () => {
	console.log('Loaded FavouritesScreen');
	const [savedList, setSavedList] = useState<number[] | undefined>(undefined);
	const objectFilename = 'savedArtworks.json'; // todo: i have a decent amount of viariables which could be placed into some GlobalConstants.tsx file

	useEffect(() => {
		const loadSavedData = async () => {
			try {
				const file = await AsyncStorage.getItem(objectFilename);
				if (!file) {
					// create file if it doesn't exist
					await AsyncStorage.setItem(objectFilename, JSON.stringify([]));
				} else {
					const data = JSON.parse(file) as number[];
					setSavedList(data);
					console.log('saved data:', data);
				}
			} catch (err) {
				console.log('error loading data:', err);
			}
		};

		loadSavedData();
	}, []);

	// page limit: element# / elementsOnPage
	const pageLimit = Math.floor((savedList?.length || 0) / 10) + 1;
	console.log(pageLimit);

	if (!savedList) {
		return (
			<View/>
		);
	}

	return (
		<InfiniteScrollQuery overrideSourceIdList={savedList} pageLimit={pageLimit} style={{marginBottom: 60}}/>
	);
}

export default FavouritesScreen;