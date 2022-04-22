import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, View, Text, TouchableOpacity, ScrollView, StyleSheet, PointPropType, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import Theme from '../theme/theme'
const keyboardAccessoryView = () => {

    const [keyboardShow, setkeyboardShow] = useState(false)
    const [keyboardHeight, setkeyboardHeight] = useState(0)

    useMemo(() => {
        if (Platform.OS == "ios") {
            keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => keyboardDidShow(event));
            keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', (event) => keyboardDidHide(event));
        }
    }, []);

    useEffect(() => {
        return () => {
            if (Platform.OS == "ios") {
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
            }
        }
    }, []);


    const keyboardDidShow = (event) => {
        setkeyboardShow(true)
        setkeyboardHeight(event.endCoordinates.height - (DeviceInfo.hasNotch() ? 34 : 0))
    }

    const keyboardDidHide = (event) => {
        setkeyboardShow(false)
        setkeyboardHeight(0)
    }

    function btnDoneClicked() {
        //this.props.onKeyboardDoneClicked()
        Keyboard.dismiss()
    }

    if (Platform.OS == "android") {
        return (<View></View>)
    }

    return (
        keyboardHeight == 0 ? (
            <View></View>
        ) : (
            <View style={{
                position: "absolute",
                bottom: keyboardHeight, right: 0,
                width: '100%', height: 35, backgroundColor: "#ededed"
            }}>

                <TouchableOpacity
                    onPress={() => btnDoneClicked()}
                    style={{ width: '100%', flexDirection: 'row-reverse' }}>
                    <Text style={{
                        marginRight: 12,
                        marginTop: 3,
                        color: Theme.colors.nappBlue,
                        fontSize: Theme.fontSize.medium,
                        fontFamily: Theme.fontFamily.regular
                    }}>Done</Text>
                </TouchableOpacity>
            </View>
        )
    )
}

export default keyboardAccessoryView

