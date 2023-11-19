import React, {useEffect, useState} from 'react';
import {StyleProp, ViewStyle, Pressable, View} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../constants/Colors";

type SaveImageProps = {
	entryId: number,
	style: StyleProp<ViewStyle>,
}



const SaveButton = ({ entryId, style }: SaveImageProps) => {
	//console.log('Loaded SaveButton for:', entryId);
	const [isItemSaved, setIsItemSaved] = useState(false);
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
					//console.log('saved data:', data);

					// check if entryId is already saved
					const entryExists = data.includes(entryId);
					//console.log('entry exists:', entryExists);
					setIsItemSaved(entryExists);
				}
			} catch (err) {
				console.log('error loading data:', err);
			}
		};

		loadSavedData();
	}, [entryId]);

	const saveItem = async () => {
		try {
			const existingData = await AsyncStorage.getItem(objectFilename);
			const existingArray = existingData ? JSON.parse(existingData) : [];
			const newData = [...existingArray, entryId];

			await AsyncStorage.setItem(objectFilename, JSON.stringify(newData));
			setIsItemSaved(true);
		} catch (err) {
			console.log('error saving item:', err);
		}
	};

	const deleteItem = async () => {
		try {
			const existingData = await AsyncStorage.getItem(objectFilename);
			const existingArray = existingData ? JSON.parse(existingData) : [];
			const newData = existingArray.filter((item: number) => item !== entryId);

			await AsyncStorage.setItem(objectFilename, JSON.stringify(newData));
			setIsItemSaved(false);
		} catch (err) {
			console.log('error deleting item:', err);
		}
	};

	const toggleImage = () => {
		// if saved - remove, otherwise - save
		if (isItemSaved) {
			deleteItem();
		} else {
			saveItem();
		}
	};

	// console.log('isItemSaved:', isItemSaved);

	return (
		<Pressable style={style} onPress={toggleImage}>
			<MaterialIcons
				name={isItemSaved ? 'star' : 'star-border'}
				size={32}
				color={isItemSaved ? Colors.primaryAccent : Colors.minorElement}
			/>
		</Pressable>
	);
};

export default SaveButton;
