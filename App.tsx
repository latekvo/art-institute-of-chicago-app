import {StyleSheet, SafeAreaView, ActivityIndicator} from 'react-native';
import SearchBar from "./components/SearchBar";
import ViewSelector from "./components/ViewSelector";
import React from "react";
import Colors from "./constants/Colors";
import {CurrentModeProvider} from "./contexts/CurrentModeContext";
import { useFonts } from 'expo-font';
import ScreenManager from "./components/ScreenManager";
import {SearchInfoProvider} from "./contexts/SearchInfoContext";

export default function App() {
    // import custom fonts
    const [fontsLoaded] = useFonts({
        'AbrilFatface': require('./assets/fonts/AbrilFatface.ttf'),
    });

    /* root website structure is divided into these 3 sections:
    - header, which expands into a search interface (searchbar + filters combo)
    - middle scrolling section, which by default is in it's explore view, it's the main working area
    - footer with section selectors, with these 2 sections: Explore and Saved/Favourite, more sections may be added in the future
    */

    // app crashes without the fonts loaded first, we're halting the application until it is loaded
    if (!fontsLoaded) {
        return <ActivityIndicator size='large' color={Colors.primaryAccent}/>;
    }

    // We're wrapping the entire app with a context provider,
    // this will help us manage global states, and will make transitioning into Redux relatively simple
    return (
        <SafeAreaView style={styles.viewRoot}>
            <CurrentModeProvider>
                <SearchInfoProvider>
                    <SearchBar/>
                    <ScreenManager/>
                </SearchInfoProvider>
                <ViewSelector/>
            </CurrentModeProvider>
        </SafeAreaView>
    );
    // for client-side debugging interface add: <StatusBar style="auto"/>, into the view root
}

const styles = StyleSheet.create({
    viewRoot: {
        flex: 1,
        backgroundColor: Colors.primaryBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        color: Colors.primaryElement,
    },
});
