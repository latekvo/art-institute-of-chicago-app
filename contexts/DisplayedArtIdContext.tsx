import React, {createContext, useContext, useState} from "react";

interface DisplayedArtDataContextProps {
	artId: number | null;
	setArtId: (newArtId: number) => void;
}

const DisplayedArtIdContext = createContext<DisplayedArtDataContextProps | undefined>(undefined);

export const useDisplayedArtIdContext = () => {
	// everytime we use this context, we have to guard against the undefined value, this should never happen.
	let context = useContext(DisplayedArtIdContext);
	if (!context) {
		throw new Error("Used DisplayedArtIdContext outside of it's provider");
	} else {
		return context;
	}
}

export const DisplayedArtIdProvider = ({ children }: any) => {
	const [artId, setArtDataInternal] = useState<number | null>(null);
	const setArtId = (newArtId: number) => {
		// because we are working with objects, we cannot change it directly
		setArtDataInternal(newArtId);
	}

	const contextValues: DisplayedArtDataContextProps = {
		artId,
		setArtId,
	};

	return (
		<DisplayedArtIdContext.Provider value={contextValues}>
			{ children }
		</DisplayedArtIdContext.Provider>
	);
}

