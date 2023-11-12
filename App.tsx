import {StyleSheet, Text, SafeAreaView, ScrollView} from 'react-native';
import SearchBar from "./components/SearchBar";
import ViewSelector from "./components/ViewSelector";

export default function App() {
  /* root website structure is divided into these 3 sections:
    - header, which expands into a search interface (searchbar + filters combo)
    - middle scrolling section, which by default is in it's explore view, it's the main working area
    - footer with section selectors, with these 2 sections: Explore and Saved/Favourite, more sections may be added in the future
   */
  return (
    <SafeAreaView style={styles.viewRoot}>
      <SearchBar/>
      <ScrollView>
        <Text style={styles.textContainer}>Open up App.tsx to start working on your app!</Text>
      </ScrollView>
      <ViewSelector/>
    </SafeAreaView>
  );
  // for client-side debugging interface add: <StatusBar style="auto"/>, into the view root
}

const styles = StyleSheet.create({
  viewRoot: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    color: '#f5f5f5',
  }
});
