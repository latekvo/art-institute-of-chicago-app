import React, {useState, createContext, useContext} from "react";
import ViewModes from "../constants/ViewModes";
import {useCurrentModeContext} from "./CurrentModeContext";

// todo: replace contexts with Redux store, for now we will have to stack contexts if we need more of them.

type SearchInfoProps = {
	searchTerm: string,
	previousView: ViewModes, // upon exiting, we should be reverted to the previous view along with all the details
	previousViewProps: any,
};

interface SearchInfoContextProps {
	searchInfo: SearchInfoProps;
	setSearchInfo: (newMode: SearchInfoProps) => void;
	setNewQuery: (newQuery: string) => void;
}

export const SearchInfoContext = createContext<SearchInfoContextProps | undefined>(undefined);

export const useSearchInfoContext = () => {
	// everytime we use this context, we have to guard against the undefined value, this should never happen.
	let context = useContext(SearchInfoContext);
	if (!context) {
		throw new Error("Used SearchInfoContext outside of it's provider");
	} else {
		return context;
	}
}

export const SearchInfoProvider = ({ children }: any) => {
	const [searchInfo, setSearchInfoInternal] = useState({} as SearchInfoProps);
	const {currentMode, setCurrentMode} = useCurrentModeContext();

	const setSearchInfo = (newInfo: SearchInfoProps) => {
		// because we are working with objects, we cannot change it directly
		setSearchInfoInternal((oldInfo) => ({...oldInfo, ...newInfo}));
	}

	const setNewQuery = (searchTerm: string) => {
		// here i have to use the setSearchInfo as well as we are modifying a whole object, and in js they are always passed as a reference, not a copy
		setSearchInfoInternal((prevSearchInfo) => {
			const newQuery = { ...prevSearchInfo };
			// if the bar gets empty, revert all view changes, go back to the previous view
			if (searchTerm === '') {
				setCurrentMode(prevSearchInfo.previousView);
				return {} as SearchInfoProps;
			} else {
				newQuery.searchTerm = searchTerm;
				return newQuery;
			}
		});
	};

	const contextValues: SearchInfoContextProps = {
		searchInfo,
		setSearchInfo,
		setNewQuery
	};

	return (
		<SearchInfoContext.Provider value={contextValues}>
			{ children }
		</SearchInfoContext.Provider>
	);
}