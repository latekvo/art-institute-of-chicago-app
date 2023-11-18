import {StyleSheet} from "react-native";
import React, {useState} from "react";
import {useSearchInfoContext} from "../../contexts/SearchInfoContext";
import InfiniteScrollQuery from "../../components/InfiniteScrollQuery";

const SearchScreen = () => {
	const {searchInfo, setSearchInfo, setNewQuery} = useSearchInfoContext();

	// we will infinitely scroll through ?q={searchTerm}, in order to do that i will place 2 memoized page-components
	// i don't think we need anything else inside this element besides the infinite scroll + searchTerm passing

	return (
		<InfiniteScrollQuery searchTerm={searchInfo.searchTerm}/>
	);
}

export default SearchScreen;

const styles = StyleSheet.create({

});

