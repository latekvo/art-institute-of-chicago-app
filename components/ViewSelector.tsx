import React from "react";
import {View, StyleSheet, Pressable} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import GlobalStyles from "../constants/GlobalStyles";
const ViewSelector = () => {
  return (
    <View style={styles.viewRoot}>
        <Pressable style={[styles.modeSelector, GlobalStyles.lightBorders]}>
            <MaterialIcons name="search" size={24} color="black"/>
        </Pressable>
        <Pressable style={[styles.modeSelector, GlobalStyles.lightBorders]}>
            <MaterialIcons name="search" size={24} color="black"/>
        </Pressable>
        <Pressable style={[styles.modeSelector, GlobalStyles.lightBorders]}>
            <MaterialIcons name="search" size={24} color="black"/>
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
