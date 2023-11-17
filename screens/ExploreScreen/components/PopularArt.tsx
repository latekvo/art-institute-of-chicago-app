import React from "react";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import Colors from "../../../constants/Colors";
import GlobalStyles from "../../../constants/GlobalStyles";

const PopularArt = () => {
    const requiredFields = [
        'id',
        'title',
        'image_id',
        'dimensions_detail',
    ].toString();

    // get ~20 first results from general search, only get image and title, use thin border separators

    return (
        <View style={styles.popularRoot}>
            <Text style={[styles.popularHeader, GlobalStyles.headerFont]}>Most Popular</Text>
            <View style={styles.popularPopout}>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    popularRoot: {
        flex: 1,
        width: Dimensions.get('window').width,
        padding: 10,
        marginBottom: 10,
    },
    popularPopout: {
        borderStyle: 'solid',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.primaryAccent,
        padding: 10,
    },
    popularHeader: {
        textAlign: 'left',
        fontSize: 34,
        marginBottom: 8,
        marginLeft: 14,
    },
});

export default PopularArt;