import React, {useEffect} from "react";
import {View, Image, StyleSheet, TextInput} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import GlobalStyles from '../constants/GlobalStyles';
import {CurrentModeContext, useCurrentModeContext} from "../contexts/CurrentModeContext";
import ViewModes from "../constants/ViewModes";
import {useSearchInfoContext} from "../contexts/SearchInfoContext";

const SearchBar = () => {
    const { currentMode, setCurrentMode } = useCurrentModeContext();
    const { searchInfo, setSearchInfo, setNewQuery} = useSearchInfoContext();

    const triggerShowSearchView = (text: string) => {
        if (currentMode != ViewModes.search) {
            setSearchInfo({
                searchTerm: text,
                previousView: currentMode,
                previousViewProps: null, // this is useful in case when we are switching from a screen that takes in props, for example 'ArtInfoScreen'
            });
            setCurrentMode(ViewModes.search);
        } else {
            console.log('setting search query:', text);
            setNewQuery(text);
            console.log('confirmation:', searchInfo.searchTerm);
        }
    }

    // currently the image will be the icon of our app, in future we might change it to a link leading to account settings
    // TODO: clicking on aic logo results in the following prompt: 'Are you sure you want to visit Art In....', which in turn opens a WebView to their website
    return (
        <View style={styles.headerRoot}>
            <View style={[styles.searchBar, GlobalStyles.lightBorders]}>
                <TextInput placeholder='Search' style={styles.searchBarInputField} onChangeText={(newText) => triggerShowSearchView(newText)}/>
                <MaterialIcons name="search" size={24} color="black" style={styles.searchBarIcon}/>
            </View>
            <Image source={require('../assets/aic-logo.png')} style={styles.icon}/>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRoot: {
        // positioning
        marginTop: 36,
        height: 60,
        width: '100%',
        // children
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // other
        backgroundColor: '#FFF',
    },
    searchBar: {
        // positioning
        flex: 1,
        marginLeft: 10,
        height: 45,
        // children
        paddingLeft: 14,
        justifyContent: 'space-between',
        flexDirection: 'row',
        // borders
        borderRadius: 2,
    },
    searchBarInputField: {
        flex: 1,
    },
    searchBarIcon: {
        margin: 10,
    },
    icon: {
        height: 45,
        width: 45,
        margin: 10,
    },
});

export default SearchBar;



