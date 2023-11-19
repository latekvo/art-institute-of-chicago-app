import React from "react";
import {SearchInfoProvider} from "./SearchInfoContext";
import {CurrentModeProvider} from "./CurrentModeContext";
import {DisplayedArtIdProvider} from "./DisplayedArtIdContext";

// this solution has to suffice before we move on to redux store
export const GlobalContextProvider = ({ children }: any) => {
	return (
		<CurrentModeProvider>
			<SearchInfoProvider>
				<DisplayedArtIdProvider>
					{ children }
				</DisplayedArtIdProvider>
			</SearchInfoProvider>
		</CurrentModeProvider>
	);
}