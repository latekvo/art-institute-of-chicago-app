import {StyleSheet} from "react-native";
import Colors from "./Colors";

const GlobalStyles = StyleSheet.create({
    lightBorders: {
        borderStyle: 'solid',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    headerFont: {
        fontFamily: 'AbrilFatface',
    },
    popoutBorders: {
        borderStyle: 'solid',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.primaryAccent,
    }
});

export default GlobalStyles;