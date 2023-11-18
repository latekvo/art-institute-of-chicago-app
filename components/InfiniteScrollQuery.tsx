import React, {createRef, useEffect, useRef, useState} from "react";
import {useAnimatedStyle, withTiming} from "react-native-reanimated";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Image, NativeScrollEvent,
	ScrollView,
	StyleProp,
	StyleSheet,
	Text,
	View, ViewStyle
} from "react-native";
import GlobalStyles from "../constants/GlobalStyles";
import Colors from "../constants/Colors";
import {useSearchInfoContext} from "../contexts/SearchInfoContext";

type ArtPositionProps = {id: number, title: string, imageId: string, thumbnail: { width: number | null | undefined, height: number | null | undefined }};

const ArtPosition = (data: ArtPositionProps) => {
	const imageUrl = `https://www.artic.edu/iiif/2/${data.imageId}/full/843,/0/default.jpg`;

	const hwRatio = (data.thumbnail.height && data.thumbnail.width) ? (data.thumbnail.height / data.thumbnail.width) : null;
	let finalHeight = hwRatio != null ? 200 * hwRatio : null;
	const isImageWide = !!(hwRatio && hwRatio < 0.7);
	// FIXME: for now the max width is an approximation, this should be dynamically checked
	if (isImageWide)
		finalHeight = 415 * hwRatio;

	return (
		<View style={[styles.artPosition, isImageWide ? styles.artPositionWide : {}, GlobalStyles.lightBorders]}>
			<Image source={{uri: imageUrl}} style={[styles.artPositionImage, isImageWide ? styles.artPositionImageWide : {}, {height: finalHeight}]}/>
			<Text style={styles.artPositionTitle}>{data.title}</Text>
		</View>
	)
};

const fetchDataByPage = (page: number, searchTerm: string) => {
	// THIS NUMBER HAS TO BE KEPT AT 10 OR LOWER, above 10 render commands are VERY likely to be dropped, causing the rendering to run at 8fps, and JS having to resend everything
	const pageSize = 10;
	const requestUrl = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&page=${page}&limit=${pageSize}&query[term][is_public_domain]=true&fields=id,image_id,title,thumbnail`;
	//console.log('used url:', requestUrl);
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
	onEndReached?: () => void;
	enablePopoutMode?: boolean
};
const PageView = ({searchQuery, pageNumber, onEndReached, enablePopoutMode = true}: PageViewProps) => {
	if (!onEndReached)
		onEndReached = () => null;

	// an entire page worth of results, we will use 2 of these to create infinite scroll
	return (
		<FlatList
			style={[enablePopoutMode ? [GlobalStyles.popoutBorders] : {}, styles.onePageList]}
			scrollEnabled={false}
			nestedScrollEnabled={false}
			onEndReached={onEndReached}
			onEndReachedThreshold={50}
			data={getDataByPage(pageNumber, searchQuery)}
			renderItem={({item}) => (
				<ArtPosition id={item.id} imageId={item.imageId} title={item.title} thumbnail={item.thumbnail}/>
			)}
		/>
	)
};

type InfiniteScrollProps = {
	searchTerm?: string,
	startingPage?: number,
	style?: StyleProp<ViewStyle>,
	overrideStyle?: StyleProp<ViewStyle>,
	displayHeader?: string | null,
}
const InfiniteScrollQuery = ({searchTerm = '', startingPage = 1, style = {}, overrideStyle = null, displayHeader = null}: InfiniteScrollProps) => {
	const [pageIndex, setPageIndex] = useState(1);
	let scrollViewRef = createRef<ScrollView>();
	// we will infinitely scroll through ?q={searchTerm}, in order to do that i will place 2 memoized page-components
	// i don't think we need anything else inside this element besides the infinite scroll + searchTerm passing

	const actOnScroll = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
		const triggerThreshold = 10; // value in pixels, booleans trigger just before reaching the bottom/top
		const closeToTop = contentOffset.y < triggerThreshold;
		const closeToBottom = layoutMeasurement.height + contentOffset.y > contentSize.height - triggerThreshold;
		console.log('close to top:', closeToTop, 'close to bottom:', closeToBottom);

		// act on triggers, I already tested whether they work or not and they do, I am writing this because i am sure this part will be very buggy
		// in case of jumpiness, I will have to place mutex locks on this code, but it probably won't be necessary otherwise
		if (closeToTop) {
			if (pageIndex == startingPage)
				return;
			// scroll back just enough to not trigger this switch
			scrollViewRef.current?.scrollTo({x: 0, y: triggerThreshold + 10, animated: false})
			setPageIndex(pageIndex - 1);
			console.log(pageIndex);
		}
		if (closeToBottom) {
			if (pageIndex == 1000)
				return
			scrollViewRef.current?.scrollTo({x: 0, y: contentOffset.y / 2, animated: false})
			setPageIndex(pageIndex + 1);
			console.log(pageIndex);
		}
	};

	return (
		<ScrollView ref={scrollViewRef} onScroll={({nativeEvent}) => {actOnScroll(nativeEvent)}} style={overrideStyle ?? [styles.searchScreenRoot, style]}>
			{
				pageIndex == startingPage &&
				<Text style={styles.resultsHeader}>Displaying results for: {searchTerm}</Text>
			}
			<PageView pageNumber={pageIndex} searchQuery={searchTerm}/>
			<PageView pageNumber={pageIndex + 1} searchQuery={searchTerm}/>
		</ScrollView>
	);
}

export default InfiniteScrollQuery;
export {PageView, InfiniteScrollProps};

const styles = StyleSheet.create({
	searchScreenRoot: {
		width: Dimensions.get('window').width,
		marginBottom: 56,
		flexDirection: 'column',
		padding: 10,
		paddingBottom: 0,
	},
	resultsHeader: {
		margin: 8,
		textAlign: 'center',
		fontWeight: '700',
		fontSize: 18,
	},
	onePageList: {
		flex: 1,
		flexDirection: 'column',
		// borderBottomWidth: 0,
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
		alignItems: 'center',
		borderBottomWidth: 0,
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
		flex: 1,
		fontSize: 16,
		fontWeight: '800',
		margin: 8,
		marginBottom: 0,
		flexWrap: 'wrap',
		//overflow: 'hidden'
	},
});
