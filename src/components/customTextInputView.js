import React, { useState, useEffect } from 'react';

import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import styContainer from '../styles/commonStyle';

import Theme from '../theme/theme'
import { string, func, object, number, bool } from 'prop-types';
import CardView from 'react-native-cardview';
import { TextInput } from 'react-native-gesture-handler';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const CustomTextInputView = (props) => {

    const { value } = props;
    const [isFieldActive, setisFieldActive] = useState(false)
    const [iconColor, seticonColor] = useState(props.iconTintColor)

    useEffect(() => {
        if (props.value != "" && props.value !== undefined) {
            setisFieldActive(true)
        }
    }, [])

    function updateActiveState(val) {
        /*this.setState({ isFieldActive: val });
        if (val) {
            Animated.timing(this.position, {
                toValue: 1,
                duration: 150,
            }).start();
        }
        else {
            Animated.timing(this.position, {
                toValue: 0,
                duration: 150,
            }).start();
        }*/
    }

    const _handleFocus = () => {
        if (props.onFocus != undefined) {
            const { attrName } = props;
            props.onFocus(attrName)
        }

        /*if (!this.state.isFieldActive) {
            this.setState({ isFieldActive: true });
            Animated.timing(this.position, {
                toValue: 1,
                duration: 150,
            }).start();
        }*/
    }

    const _handleBlur = () => {

        //const { attrName } = this.props;
        //this.props.onBlur(attrName)

        /*if (this.props.onBlur != undefined) {
            const { attrName } = this.props;
            this.props.onBlur(attrName)
        }

        if (this.state.isFieldActive && !this.props.value) {
            this.setState({ isFieldActive: false });
            Animated.timing(this.position, {
                toValue: 0,
                duration: 150,
            }).start();
        }*/


    }

    const _onChangeText = (updatedValue) => {
        const { attrName, updateMasterState } = props;
        console.log("attrName, updateMasterState==>", attrName, updateMasterState);
        updateMasterState(attrName, updatedValue);
    }

    const _returnAnimatedTitleStyles = () => {
        /*const { isFieldActive } = this.state;
        return {
            top: this.position.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
            }),
            fontSize: isFieldActive ? Theme.fontSize.semiSmall1 : Theme.fontSize.regular,
            fontFamily: Theme.fontFamily.medium,
            color: isFieldActive ? Theme.colors.nappPink : 'darkgray',
        }*/
    }

    return (
        <View style={{ width: '90%' }}>
            <Text style={{
                fontFamily: Theme.fontFamily.regular,
                fontSize: Theme.fontSize.small,
                color: Theme.colors.sendMeBlack,
                marginBottom: 3, letterSpacing: 0.4
            }}>{props.title}</Text>
            <CardView cardElevation={Platform.OS == "android" ? 4 : 2} style={[Styles.container]}>
                <View style={{ flex: 1, borderColor: props.isErrorRedBorder ? 'red' : 'white', borderWidth: props.isErrorRedBorder ? 1 : 0 }}>
                    <TextInput

                        allowFontScaling={false}
                        value={props.value}
                        style={[Styles.textInput, { height: props.isMultiline ? RFValue(70) : (Platform.OS == "android" ? RFValue(55) : RFValue(45)) }]}
                        underlineColorAndroid='transparent'
                        onFocus={_handleFocus}
                        multiline={props.isMultiline ? true : false}
                        onBlur={_handleBlur}
                        onChangeText={_onChangeText}
                        keyboardType={props.keyboardType}

                        {...props.otherTextInputProps}
                    />
                </View>
            </CardView>
        </View>
    )
}


CustomTextInputView.propTypes = {
    attrName: string.isRequired,
    title: string.isRequired,
    iconImage: number.isRequired,
    iconTintColor: string.isRequired,
    value: string.isRequired,
    updateMasterState: func.isRequired,
    keyboardType: string,
    otherTextInputProps: object,
    isModel: bool,
    isMultiline: bool,
    isErrorRedBorder: bool,
}


CustomTextInputView.defaultProps = {
    keyboardType: 'default',
    otherTextInputAttributes: {},
}

export default CustomTextInputView


const Styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: "#E7E7E7",
        borderRadius: 3,
    },
    textInput: {
        fontSize: Theme.fontSize.semiRegular,
        fontFamily: Theme.fontFamily.regular,
        color: '#1A1311',
        height: RFValue(45),
        flex: 1, letterSpacing: 0.4,
        marginLeft: Platform.OS === "ios" ? 10 : 7,
        marginRight: Platform.OS === "ios" ? 10 : 7,
    },
})