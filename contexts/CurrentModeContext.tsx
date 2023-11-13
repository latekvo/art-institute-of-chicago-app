import React, {useState, createContext, useContext} from "react";
import ViewModes from "../constants/ViewModes";

// todo: replace contexts with Redux store, for now we will have to stack contexts if we need more of them.

interface CurrentModeContextProps {
    currentMode: number;
    setCurrentMode: (newMode: number) => void;
}

export const CurrentModeContext = createContext<CurrentModeContextProps | undefined>(undefined);

export const useCurrentModeContext = () => {
    // everytime we use this context, we have to guard against the undefined value, this should never happen.
    let context = useContext(CurrentModeContext);
    if (!context) {
        throw new Error("Used CurrentModeContext outside of it's provider");
    } else {
        return context;
    }
}

export const CurrentModeProvider = ({ children }: any) => {
    const [currentMode, setCurrentModeInternal] = useState(ViewModes.explore);
    const setCurrentMode = (newMode: number) => {
        setCurrentModeInternal(newMode);
    }

    const contextValues: CurrentModeContextProps = {
        currentMode,
        setCurrentMode,
    };

    return (
        <CurrentModeContext.Provider value={contextValues}>
            { children }
        </CurrentModeContext.Provider>
    );
}