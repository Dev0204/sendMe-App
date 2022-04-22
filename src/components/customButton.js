import React, { Component } from 'react';

import { PropTypes, func, bool } from 'prop-types';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import styContainer from '../styles/commonStyle';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import Theme from '../theme/theme'
import CardView from 'react-native-cardview'

const CustomButton = (props) => {

    function onButtonClicked() {
        if (props.isLoading) {
            return
        }
        props.onButtonClicked()
    }

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onButtonClicked()}>

            <CardView cornerRadius={props.defineBorderRadius ? props.defineBorderRadius : 0}
                cardElevation={Platform.OS == "android" ? 4 : 2}
                style={{
                    opacity: props.isLoading ? 0.6 : (props.defineOpacity ? props.defineOpacity : 1),
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: props.defineWidth ? props.defineWidth : '90%', height: props.defineHeight ? RFValue(props.defineHeight) : RFValue(45),
                    backgroundColor: props.bgColor ? props.bgColor : Theme.colors.sendMeBlue,
                }}>
                {
                    props.isLoading ? (
                        <View>
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    ) : (
                        <Text style={{
                            color: props.textColor ? props.textColor : 'white',
                            fontSize: props.defineFontSize ? props.defineFontSize : Theme.fontSize.semiRegular,
                            fontFamily: props.defineFontFamily ? props.defineFontFamily : Theme.fontFamily.bold,
                            textAlign: 'center', paddingLeft: 10, paddingRight: 10,
                            letterSpacing: 0.4
                        }}>{props.title}</Text>
                    )
                }

            </CardView>
        </TouchableOpacity >
    )
}


CustomButton.propTypes = {
    title: PropTypes.string,
    bgColor: PropTypes.string,
    textColor: PropTypes.string,
    defineHeight: PropTypes.number,
    defineWidth: PropTypes.number,
    defineFontSize: PropTypes.number,
    defineFontFamily: PropTypes.number,
    defineBorderRadius: PropTypes.number,
    defineOpacity: PropTypes.number,
    isLoading: bool
};

export default CustomButton

