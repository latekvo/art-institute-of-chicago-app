import {ScrollView, View, Text, StyleSheet, Dimensions, Pressable, ImageBackground} from "react-native";
import searchScreen from "../SearchScreen/SearchScreen";
import React, {useState} from "react";
import colors from "../../constants/Colors";
import GlobalStyles from "../../constants/GlobalStyles";
import Colors from "../../constants/Colors";
import * as url from "url";

class Category {
	displayName: string = 'Blank';
	searchTerm: string | undefined = undefined;
	filterData: Object | undefined = undefined;

	constructor(displayName: string, searchTerm: string);
	constructor(displayName: string, filterData: Object);
	constructor(displayName: string, secondArg: string | Object) {
		this.displayName = displayName;
		if (typeof secondArg == 'string')
			this.searchTerm = secondArg;
		if (typeof secondArg == 'object')
			this.filterData = secondArg;
	}

	private collapseFilterData() {
		// todo: complete this function, we have to convert the filterData into a comma separated string.
		return '';
	}

	private fetchThumbnail() {
		let searchTerm = '';

		// depending on what is present, either search by a term, or filter by fields
		if (this.searchTerm !== undefined) {
			searchTerm = `https://api.artic.edu/api/v1/artworks/search?q=${this.searchTerm}&query[term][is_public_domain]=true&limit=1&fields=id,image_id`;
		}
		if (this.filterData !== undefined) {
			searchTerm = `https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&${this.collapseFilterData()}&limit=1&fields=id,image_id`;
		}

		return fetch(searchTerm).then(res => res.json());
	}

	toElement(index: number) {
		const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

		// depending on if the promise is fulfilled, we will load the panel with or without a bg image
		this.fetchThumbnail().then((res) => {
			const imageId = res.data[0]['image_id'];
			setThumbnailUrl(`https://www.artic.edu/iiif/2/${imageId}/full/400,/0/default.jpg`)
		});

		const coreElement = (
			<Text style={[styles.categoryTitle, GlobalStyles.headerFont]}>
				{this.displayName}
			</Text>
		);

		if (thumbnailUrl == '') {
			return (
				<Pressable style={[styles.backgroundContainer, styles.categoryContainer]} key={index}>
					{
						coreElement
					}
				</Pressable>
			);
		}

		return (
			// do not remove the key prop, it is unused but required by react-native
			<ImageBackground style={styles.backgroundContainer} source={{uri: thumbnailUrl}} key={index}>
				<Pressable style={[styles.categoryContainer, {backgroundColor: '#0006'}]}>
					{
						coreElement
					}
				</Pressable>
			</ImageBackground>
		);
	}

	toSearchQuery() {
		`https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=2&fields=id,title,image_id`;
	}
}

const categories = Array<Category>(
	new Category('Most Popular', {
		// already sorted by popularity
		has_not_been_viewed_much: false
	}),
	new Category('Animals', 'animals'),
	new Category('Modern', 'modern'),
	new Category('Sculptures', {
		artwork_type_title: 'Sculpture'
	}),
	new Category('Baroque', 'baroque'),
	new Category('Pop art', 'pop\\ art'),
	new Category('Water', 'water'),
	new Category('Least popular', {
		// todo: reverse the default sorting, this will return least popular art first
		is_boosted: false,
		has_not_been_viewed_much: true,
	}),
	new Category('Impressionism', 'impressionism'),
);

const CategoriesScreen = () => {
	// all categories will scroll infinitely, multi-search will filter by filterData
	// todo: in future these can be automatically generated based on most popular user searches or custom user filters
	return (
		<ScrollView style={styles.categoriesRoot}>
			{
				categories.map((value, index) => (
					value.toElement(index)
				))
			}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	categoriesRoot: {
		flex: 1,
		// because of how ScreenManager works, it's cleaner and simpler to dynamically override the width here
		width: Dimensions.get('window').width,
		flexDirection: 'column',
		marginBottom: 76,
	},
	backgroundContainer: {
		height: 240,
		margin: 12,
		marginBottom: 0,
		borderRadius: 4,
	},
	categoryContainer: {
		// dimensions & positioning
		flex: 1,
		height: 240,
		borderRadius: 4,

		// children
		justifyContent: 'flex-end',
		padding: 12,

		// other & development
		shadow: {
			borderWidth: 1,
			overflow: 'hidden',
			shadowColor: Colors.primaryElement,
			shadowRadius: 10,
			shadowOpacity: 1,
		},
		backgroundColor: Colors.primaryAccent,
	},
	categoryTitle: {
		fontSize: 26,
		color: 'white',
	}
});

export default CategoriesScreen;