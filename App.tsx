import {StyleSheet, Text, SafeAreaView, ScrollView, View, RefreshControl} from 'react-native';
import SearchBar from "./components/SearchBar";
import ViewSelector from "./components/ViewSelector";
import React, {useState} from "react";
import Colors from "./constants/Colors";
import {CurrentModeProvider} from "./contexts/CurrentModeContext";

export default function App() {
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = () => {

    };
    const addRefreshControl = () => (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
    );
    /* root website structure is divided into these 3 sections:
    - header, which expands into a search interface (searchbar + filters combo)
    - middle scrolling section, which by default is in it's explore view, it's the main working area
    - footer with section selectors, with these 2 sections: Explore and Saved/Favourite, more sections may be added in the future
    */
    // We're wrapping the entire app with a context provider,
    // this will help us manage global states, and will make transitioning into Redux relatively simple
    return (
        <SafeAreaView style={styles.viewRoot}>
            <CurrentModeProvider>
                <SearchBar/>
                {/* Currently the explore view is force, description: 1. Featured art section, 2. Popular art section, 3. Infinitely scrolling art  */}
                <ScrollView refreshControl={addRefreshControl()}>
                    {/* Contains Featured and popular art, we treat is as page 0 in pagination */}
                    <View>
                        <View>

                        </View>
                        <View>

                        </View>
                    </View>
                    {/* vvv Infinite loading via pagination */}
                    <View>

                    </View>
                </ScrollView>
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
  }
});
