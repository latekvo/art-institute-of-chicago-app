import {
	Dimensions,
	FlatList,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
	Text,
	Image,
	ActivityIndicator
} from "react-native";
import FeaturedArt from "./components/FeaturedArt";
import PopularArt from "./components/PopularArt";
import React, {useEffect, useState} from "react";
import Colors from "../../constants/Colors";
import {useAnimatedStyle, withTiming} from 'react-native-reanimated';

const pageSize = 20;

type ItemProps = {id: number, title: string, imageId: string};
const ArtPosition = (data: ItemProps) => {
	const imageUrl = `https://www.artic.edu/iiif/2/${data.imageId}/full/843,/0/default.jpg`;
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	// TODO: apply this animation to the images
	/*
	const imageAnimation = useAnimatedStyle(() => {
		return {
			opacity: withTiming(isImageLoaded ? 1 : 0, { duration: 500 }),
		};
	});

	TODO: apply some loading animation to all images (example vvv)
	{
		isImageLoaded &&
        <ActivityIndicator size='large' color={Colors.primaryAccent}/>
	}
	*/

	return (
		<View style={styles.artPosition}>
			<Image source={{uri: data.imageId}}/>
			<Text>{data.title}</Text>
		</View>
	)
};

const getDataByPage = (page: number) => {
	return new Promise<ItemProps[]>((resolve, reject) => {
		const requestUrl = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}&query[term][is_public_domain]=true&fields=id,image_id,title`;
		fetch(requestUrl).then((res) => res.json()).then((res) => {
			// FIXME: FOUND THE CULPRIT: this fetch is getting executed 501 times (recursive call stopped by react procedure)
			console.log('Fetch results:');
			console.log(res);
			const itemPropData: ItemProps[] = res.data.map((item: any) => (
				{
					id: item['id'],
					imageId: item['image_id'],
					title: item['title']
				} as ItemProps
			));
			resolve(itemPropData);
		});
	});
};

const getFlatList = (pageToRender: number) => {
	// this function has its inner variables blown all over the place, but this is intentional, all constants have to be declared before any return statements,
	// on the other hand, any functions should be executed as late as possible (avoids unnecessary requests). Thus, do not 'fix' this layout.
	const [isPageLoaded, setIsPageLoaded] = useState(false);
	const [dataItemProps, setDataItemProps] = useState([] as ItemProps[]);

	console.log('getFlatList executed');

	if (pageToRender == 0) {
		// we treat these components as page 0 of our infinite scroll
		return (
			<View>
				<FeaturedArt/>
				<PopularArt/>
			</View>
		);
	}

	// IMPORTANT: after narrowing down the potential causes, it is clear that the section responsible for causing recursive re-rendering is the section below this comment

	useEffect(() => {
		getDataByPage(pageToRender).then((dataAsArray) => {
			setDataItemProps(dataAsArray);
			setIsPageLoaded(true);
		});
	}, []);

	if (!isPageLoaded) {
		return <ActivityIndicator size='large' color={Colors.primaryAccent}/>;
	}

	return (
		// in case of problems, flat list may be replaced with plain map, which returns 20 or so elements
		<FlatList
			scrollEnabled={false}
			nestedScrollEnabled={false}
			numColumns={2 as const}
			data={dataItemProps}
			renderItem={({item}) => (
				<ArtPosition id={item.id} imageId={item.imageId} title={item.title}/>
			)}
		/>
	);
};

const ExploreScreen = () => {
	const [currentPageIndex, setCurrentPageIndex] = useState(0);

	console.log('ExploreScreen executed');

	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = () => {
		// if we are using a random seed, reset it here
	};
	const addRefreshControl = () => (
		<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
	);

	/* Pagination offset:
		0: Featured art section + Popular art section,
		1-∞: Infinitely scrolling art  */
	return (
		<ScrollView refreshControl={addRefreshControl()} style={styles.rootExploreElement}>
			<View style={styles.infiniteTileContainer}>
				{getFlatList(currentPageIndex)}
				{getFlatList(currentPageIndex + 1)}
				{getFlatList(currentPageIndex + 2)}
			</View>
		</ScrollView>
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
	artPosition: {
		height: 'auto',
	},
	artPositionImage: {
		height: 300,
	},
	artPositionTitle: {
		fontSize: 16,
	},
});