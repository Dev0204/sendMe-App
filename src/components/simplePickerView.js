import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PointPropType, Platform } from 'react-native';

import { WheelPicker } from 'react-native-wheel-picker-android'

import Theme from "../theme/theme"

export default class SimplePickerView extends Component {

    static propTypes = {
        attrName: PropTypes.string,
        title: PropTypes.string,
        arrData: PropTypes.array,
        selectedIndex: PropTypes.number,
    };
    constructor(props) {
        super(props);
        this.state = {
            selectedIndx: props.selectedIndex
        }
    }

    onItemSelected = selectedItem => {
        console.log(selectedItem)
        this.setState({
            selectedIndx: selectedItem
        })
    }

    btnDoneClicked() {
        this.props.onDoneClicked(this.state.selectedIndx, this.props.attrName)
    }

    render() {
        return (
            <View style={[styles.keyboardContainer, { borderRadius: 10 }]}>
                <Text allowFontScaling={false} style={{ fontFamily: Theme.fontFamily.medium, marginBottom: Platform.OS === 'ios' ? 10 : 40, color: Theme.colors.nappBlue, fontSize: Theme.fontSize.regularX }}>{this.props.title}</Text>
                <WheelPicker
                    style={{ width: 350, height: 170, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
                    hideIndicator={true}
                    selectedItem={this.state.selectedIndx}
                    data={this.props.arrData}
                    selectedItemTextColor={Theme.colors.nappBlue}
                    selectedItemTextSize={30}
                    itemTextFontFamily={Theme.fontFamily.medium}
                    selectedItemTextFontFamily={Theme.fontFamily.medium}
                    onItemSelected={this.onItemSelected} />
                <TouchableOpacity
                    onPress={() => this.btnDoneClicked()}
                    activeOpacity={0.7}
                    style={{ borderRadius: 20, marginTop: 30, marginBottom: 20, height: 40, width: '90%', backgroundColor: Theme.colors.nappBlue, justifyContent: 'center', alignItems: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: 'white', fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>Done</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});