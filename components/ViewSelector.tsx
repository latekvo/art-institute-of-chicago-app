import React, {useContext, useEffect, useState} from "react";
import {View, StyleSheet, Pressable} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import GlobalStyles from "../constants/GlobalStyles";
import Colors from "../constants/Colors";
import ViewModes from "../constants/ViewModes";
import {useCurrentModeContext} from "../contexts/CurrentModeContext";

const ViewSelector = () => {
    // local state:
    //const [currentMode, setCurrentMode] = useState(ViewModes.explore);
    // global state:
    const {currentMode, setCurrentMode} = useCurrentModeContext();

    //
    useEffect(() => {

    }, [currentMode]);

    // TODO: animate transitions (preferably use 'reanimate')
    let modeToColor = (modeIndex: number) => {
        return currentMode == modeIndex ? Colors.primaryAccent : Colors.minorElement;
    }
    let modeToSize = (modeIndex: number) => {
        return currentMode == modeIndex ? 32 : 26;
    }

    return (
        <View style={styles.viewRoot}>
            <Pressable onPress={() => {setCurrentMode(ViewModes.categories)}} style={[styles.modeSelector, GlobalStyles.lightBorders]}>
                <MaterialIcons name="dashboard" size={modeToSize(ViewModes.categories)} color={modeToColor(ViewModes.categories)}/>
            </Pressable>
            <Pressable onPress={() => {setCurrentMode(ViewModes.explore)}} style={[styles.modeSelector, GlobalStyles.lightBorders]}>
                <MaterialIcons name="explore" size={modeToSize(ViewModes.explore)} color={modeToColor(ViewModes.explore)}/>
            </Pressable>
            <Pressable onPress={() => {setCurrentMode(ViewModes.favourites)}} style={[styles.modeSelector, GlobalStyles.lightBorders]}>
                <MaterialIcons name="star" size={modeToSize(ViewModes.favourites)} color={modeToColor(ViewModes.favourites)}/>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    viewRoot: {
        position: 'absolute',
        flex: 1,
        flexDirection: 'row',
        bottom: 0,
        height: 65,
        width: '100%',
        backgroundColor: '#FFF',
    },
    modeSelector: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default ViewSelector;
