import { Platform, StyleSheet } from "react-native";

const font = Platform.OS == 'ios'?'Iowan Old Style':'notoserif'

export const text = StyleSheet.create({
    heading1: {
        fontFamily: font,
        fontWeight: 'bold',
        fontSize: 24
    },
    heading2: {
        fontFamily: font,
        fontWeight: 'bold',
        fontSize: 20
    },
    heading3: {
        fontFamily: font,
        fontSize: 20
    },
    body: {
        fontFamily: font,
        fontSize: 16,
    },
    subtitle: {
        fontFamily: font,
        fontSize: 14
    }
  });