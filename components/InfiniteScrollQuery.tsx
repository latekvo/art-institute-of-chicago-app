import React, {createRef, memo, useEffect, useState} from "react";
import {
	Dimensions,
	FlatList,
	Image, NativeScrollEvent, Pressable,
	ScrollView,
	StyleProp,
	StyleSheet,
	Text,
	View, ViewStyle
} from "react-native";
import GlobalStyles from "../constants/GlobalStyles";
import {useDisplayedArtIdContext} from "../contexts/DisplayedArtIdContext";
import {useCurrentModeContext} from "../contexts/CurrentModeContext";
import ViewModes from "../constants/ViewModes";
import SaveButton from "./SaveButton";

type ArtPositionProps = {id: number, title: string, imageId: string, thumbnail: { width: number | null | undefined, height: number | null | undefined }};

const ArtPosition = memo((data: ArtPositionProps) => {
	// set appropriate contexts, data, view
	const { artId, setArtId } = useDisplayedArtIdContext();
	const { currentMode, setCurrentMode } = useCurrentModeContext();

	const imageUrl = `https://www.artic.edu/iiif/2/${data.imageId}/full/843,/0/default.jpg`;

	const hwRatio = (data.thumbnail.height && data.thumbnail.width) ? (data.thumbnail.height / data.thumbnail.width) : null;
	let finalHeight = hwRatio != null ? 200 * hwRatio : null;
	const isImageWide = !!(hwRatio && hwRatio < 0.7);
	// FIXME: for now the max width is an approximation, this should be dynamically checked
	if (hwRatio && isImageWide)
		finalHeight = 415 * hwRatio;

	const displayArtInfo = () => {
		setArtId(data.id);
		setCurrentMode(ViewModes.details);
	}

	// don't render pictureless positions
	if (!data.imageId) {
		return <View/>
	}

	return (
		<Pressable onPress={() => displayArtInfo()} style={[styles.artPosition, isImageWide ? styles.artPositionWide : {}, GlobalStyles.lightBorders]}>
			<Image source={{uri: imageUrl}} style={[styles.artPositionImage, isImageWide ? styles.artPositionImageWide : {}, hwRatio != null ? {height: finalHeight} : {height: '100%'}]}/>
			<Text style={styles.artPositionTitle}>{data.title}</Text>
			<SaveButton entryId={data.id} style={{margin: 2}}/>
		</Pressable>
	)
});

const fetchDataByPage = (page: number, searchTerm: string) => {
	// THIS NUMBER HAS TO BE KEPT AT 10 OR LOWER, above 10 render commands are VERY likely to be dropped, causing the rendering to run at 8fps, and JS having to resend everything
	const pageSize = 10;
	const requestUrl = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&page=${page}&limit=${pageSize}&query[term][is_public_domain]=true&fields=id,image_id,title,thumbnail`;
	//console.log('used url:', requestUrl);
	return fetch(requestUrl).then((res) => res.json());
};

const getDataByPage = (page: number, searchTerm: string): ArtPositionProps[] => {
	const [pageData, setPageData] = useState([]);

	// console.log('Getting new data for page:', page, 'and term:', searchTerm);

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
	}, [page, searchTerm]);

	return pageData;
};

const fetchDataByIds = (pageIndex: number, idList: number[]) => {
	const startingIdx = pageIndex * 10 - 10; // to slice 0-9 starting index has to be 0
	const endingIdx = pageIndex * 10; // to slice 0-9 endingIdx has to be set to 10
	const queryData = idList.slice(startingIdx, endingIdx).toString();
	const queryUrl = `https://api.artic.edu/api/v1/artworks?ids=${queryData}&fields=id,title,image_id,thumbnail`;
	return fetch(queryUrl).then(res => res.json());
};

const getDataByIdList = (page: number, dataList: number[]) => {
	const [pageData, setPageData] = useState([]);

	useEffect(() => {
		fetchDataByIds(page, dataList).then(res => {
			setPageData(
				res.data.map((item: any) => ({
						id: item['id'],
						imageId: item['image_id'],
						title: item['title'],
						thumbnail: {
							height: item['thumbnail'] ? item['thumbnail']['height'] : null,
							width: item['thumbnail'] ? item['thumbnail']['width'] : null,
						},
					} as ArtPositionProps
				))
			);
		});
	}, [page, dataList]);

	return pageData;
};

type PageViewProps = {
	searchQuery: string,
	pageNumber: number,
	onEndReached?: () => any,
	enablePopoutMode?: boolean,
	overrideSourceIdList?: number[],
};
const PageView = memo(({searchQuery, pageNumber, onEndReached, enablePopoutMode = true, overrideSourceIdList}: PageViewProps) => {
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
			data={ overrideSourceIdList ? (
				getDataByIdList(pageNumber, overrideSourceIdList)
			) : (
				getDataByPage(pageNumber, searchQuery)
			)}
			renderItem={({item}) => (
				<ArtPosition id={item.id} imageId={item.imageId} title={item.title} thumbnail={item.thumbnail}/>
			)}
		/>
	)
});

type InfiniteScrollProps = {
	searchTerm?: string,
	startingPage?: number,
	style?: StyleProp<ViewStyle>,
	overrideStyle?: StyleProp<ViewStyle>,
	firstPageOverride?: React.JSX.Element,
	overrideSourceIdList?: number[],
	pageLimit?: number,
}
const InfiniteScrollQuery = ({searchTerm = '', startingPage = 1, style = {}, overrideStyle = null, firstPageOverride, overrideSourceIdList, pageLimit}: InfiniteScrollProps) => {
	const [pageIndex, setPageIndex] = useState(startingPage);
	const [progressionLock, setProgressionLock] = useState(false);

	let scrollViewRef = createRef<ScrollView>();
	// we will infinitely scroll through ?q={searchTerm}, in order to do that i will place 2 memoized page-components
	// i don't think we need anything else inside this element besides the infinite scroll + searchTerm passing

	const actOnScroll = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
		const triggerThreshold = 10; // value in pixels, booleans trigger just before reaching the bottom/top
		const closeToTop = contentOffset.y < triggerThreshold;
		const closeToBottom = layoutMeasurement.height + contentOffset.y > contentSize.height - triggerThreshold;

		// if (closeToTop || closeToBottom)
			// console.log('close to top:', closeToTop, 'close to bottom:', closeToBottom);

		// act on triggers, I already tested whether they work or not and they do, I am writing this because i am sure this part will be very buggy
		// in case of jumpiness, I will have to place mutex locks on this code, but it probably won't be necessary otherwise
		if (closeToTop) {
			if (pageIndex == startingPage)
				return;
			// scroll back just enough to not trigger this switch
			scrollViewRef.current?.scrollTo({x: 0, y: triggerThreshold + 10, animated: false})
			setPageIndex(pageIndex - 1);
		}
		if (closeToBottom) {
			if (pageIndex == 1000)
				return;
			if (pageLimit && pageIndex == pageLimit)
				return;
			// this long calculation converts to: middle of page - half of the device height
			// for better results, we need to get height of the page we are moving up, replace (contentOffset.y / 2) with that value
			scrollViewRef.current?.scrollTo({x: 0, y: contentOffset.y / 2 - layoutMeasurement.height / 2 + triggerThreshold, animated: false})
			setPageIndex(pageIndex + 1);
		}
	};

	return (
		<ScrollView ref={scrollViewRef} onScroll={({nativeEvent}) => {actOnScroll(nativeEvent)}} style={overrideStyle ?? [styles.searchScreenRoot, style]}>
			{
				pageIndex == startingPage && searchTerm != '' &&
				<Text style={styles.resultsHeader}>Displaying results for: {searchTerm}</Text>
			}
			{
				pageIndex == startingPage &&
				firstPageOverride
			}
			<PageView pageNumber={pageIndex} searchQuery={searchTerm} overrideSourceIdList={overrideSourceIdList}/>
			{
				(pageLimit && pageIndex < pageLimit) &&
                <PageView pageNumber={pageIndex + 1} searchQuery={searchTerm} overrideSourceIdList={overrideSourceIdList}/>
			}
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
