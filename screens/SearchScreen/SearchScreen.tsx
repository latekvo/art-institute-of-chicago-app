import {ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {memo, useEffect, useState} from "react";
import Colors from "../../constants/Colors";
import {useAnimatedStyle, withTiming} from "react-native-reanimated";
import {useSearchInfoContext} from "../../contexts/SearchInfoContext";
import GlobalStyles from "../../constants/GlobalStyles";

type ArtPositionProps = {id: number, title: string, imageId: string, thumbnail: { width: number | null | undefined, height: number | null | undefined }};

const ArtPosition = (data: ArtPositionProps) => {
	const imageUrl = `https://www.artic.edu/iiif/2/${data.imageId}/full/843,/0/default.jpg`;
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	const imageAnimation = useAnimatedStyle(() => {
		return {
			opacity: withTiming(isImageLoaded ? 1 : 0, { duration: 500 }),
		};
	});

	const hwRatio = (data.thumbnail.height && data.thumbnail.width) ? (data.thumbnail.height / data.thumbnail.width) : null;
	let finalHeight = hwRatio != null ? 200 * hwRatio : null;
	const isImageWide = !!(hwRatio && hwRatio < 0.7);
	// FIXME: for now the max width is an approximation, this should be dynamically checked
	if (isImageWide)
		finalHeight = 415 * hwRatio;

	return (
		<View style={[styles.artPosition, isImageWide ? styles.artPositionWide : {}, GlobalStyles.lightBorders]}>
			{isImageLoaded ? (
				<ActivityIndicator size='large' color={Colors.primaryAccent} style={styles.artPositionImage}/>
			) : (
				<Image source={{uri: imageUrl}} style={[styles.artPositionImage, isImageWide ? styles.artPositionImageWide : {}, {height: finalHeight}]}/>
			)}
			<Text style={styles.artPositionTitle}>{data.title}</Text>
		</View>
	)
};

const fetchDataByPage = (page: number, searchTerm: string) => {
	// THIS NUMBER HAS TO BE KEPT AT 10 OR LOWER, above 10 render commands are VERY likely to be dropped, causing the rendering to run at 8fps, and JS having to resend everything
	const pageSize = 10;
	const requestUrl = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&page=${page}&limit=${pageSize}&query[term][is_public_domain]=true&fields=id,image_id,title,thumbnail`;
	console.log('used url:', requestUrl);
	return fetch(requestUrl).then((res) => res.json());
};

const getDataByPage = (page: number, searchTerm: string): ArtPositionProps[] => {
	const [pageData, setPageData] = useState([]);

	useEffect(() => {
		fetchDataByPage(page, searchTerm).then((res) => {
			setPageData(res.data.map((item: any) => ({
					id: item['id'],
					imageId: item['image_id'],
					title: item['title'],
					thumbnail: {
						height: item['thumbnail'] ? item['thumbnail']['height'] : null,
						width: item['thumbnail'] ? item['thumbnail']['width'] : null,
					},
				} as ArtPositionProps
			)));
		});
	}, [searchTerm]);

	return pageData;
};

type PageViewProps = {
	searchQuery: string,
	pageNumber: number,
};
const PageView = ({searchQuery, pageNumber}: PageViewProps) => {
	console.log('updated page view with:', searchQuery, 'page:', pageNumber);
	// an entire page worth of results, we will use 2 of these to create infinite scroll
	return (
		<FlatList
			style={[GlobalStyles.popoutBorders, styles.onePageList]}
			scrollEnabled={false}
			nestedScrollEnabled={false}
			data={getDataByPage(pageNumber, searchQuery)}
			renderItem={({item}) => (
				<ArtPosition id={item.id} imageId={item.imageId} title={item.title} thumbnail={item.thumbnail}/>
			)}
		/>
	)
};

const SearchScreen = () => {
	const [pageIndex, setPageIndex] = useState(1);
	const {searchInfo, setSearchInfo, setNewQuery} = useSearchInfoContext();
	const [searchTerm, setSearchTerm] = useState(searchInfo.searchTerm);

	console.log('currentSearchInfo:', searchInfo.searchTerm);
	// we will infinitely scroll through ?q={searchTerm}, in order to do that i will place 2 memoized page-components
	// i don't think we need anything else inside this element besides the infinite scroll + searchTerm passing

	return (
		<ScrollView style={styles.searchScreenRoot}>
			<Text>Debug, results for: {searchInfo.searchTerm}</Text>
			<PageView pageNumber={pageIndex} searchQuery={searchInfo.searchTerm}/>
			<PageView pageNumber={pageIndex + 1} searchQuery={searchInfo.searchTerm}/>
		</ScrollView>
	);
}

export default SearchScreen;

const styles = StyleSheet.create({
	searchScreenRoot: {
		width: Dimensions.get('window').width,
		marginBottom: 65,
		flexDirection: 'column',
		padding: 10,
	},
	onePageList: {
		flex: 1,
		flexDirection: 'column',
		borderBottomWidth: 0,
		borderRadius: 4,
	},
	// for art positions, we want to have a default - unloaded state,
	// a layout for height >= width - art on the left, text on the right
	// and a layout for width < height - art on the top, text on the bottom
	artPosition: {
		flex: 1,
		flexDirection: 'row',
		minHeight: 150,
		padding: 10,
		paddingBottom: 4,
		alignItems: 'center',
	},
	artPositionWide: {
		flexDirection: 'column',
	},
	artPositionImage: {
		width: 200,
		height: 100,
	},
	artPositionImageWide: {
		width: '100%',
	},
	artPositionTitle: {
		fontSize: 16,
		fontWeight: '800',
		flex: 1,
		margin: 8,
		flexWrap: 'wrap',
	},
});

