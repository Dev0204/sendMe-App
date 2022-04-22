import React, { Component, PureComponent } from 'react';
import { TouchableOpacity, View, Animated, StyleSheet, TextInput, Image, Platform, Alert, Text } from 'react-native';
import { string, func, object, number, bool } from 'prop-types';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory'

import styContainer from '../../styles/commonStyle';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import Theme from '../../theme/theme'


export class FloatingTitleTextInputField extends PureComponent {
    static propTypes = {
        attrName: string.isRequired,
        title: string.isRequired,
        iconImage: number.isRequired,
        iconTintColor: string.isRequired,
        value: string.isRequired,
        updateMasterState: func.isRequired,
        keyboardType: string,
        otherTextInputProps: object,
        isModel: bool
    }

    static defaultProps = {
        keyboardType: 'default',
        otherTextInputAttributes: {},
    }

    componentDidUpdate() {

    }

    constructor(props) {
        super(props);
        const { value } = this.props;
        //console.log(this.props)
        this.position = new Animated.Value(value ? 1 : 0);
        this.state = {
            isFieldActive: false,
            iconColor: this.props.iconTintColor
        }
    }

    componentDidMount() {
        if (this.props.value != "" && this.props.value !== undefined) {
            this.setState({
                isFieldActive: true
            })
        }
    }

    updateActiveState(val) {
        this.setState({ isFieldActive: val });
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
        }
    }

    _handleFocus = () => {
        if (this.props.onFocus != undefined) {
            const { attrName } = this.props;
            this.props.onFocus(attrName)
        }

        if (!this.state.isFieldActive) {
            this.setState({ isFieldActive: true });
            Animated.timing(this.position, {
                toValue: 1,
                duration: 150,
            }).start();
        }
    }

    _handleBlur = () => {

        //const { attrName } = this.props;
        //this.props.onBlur(attrName)

        if (this.props.onBlur != undefined) {
            const { attrName } = this.props;
            this.props.onBlur(attrName)
        }

        if (this.state.isFieldActive && !this.props.value) {
            this.setState({ isFieldActive: false });
            Animated.timing(this.position, {
                toValue: 0,
                duration: 150,
            }).start();
        }


    }

    _onChangeText = (updatedValue) => {
        const { attrName, updateMasterState } = this.props;
        updateMasterState(attrName, updatedValue);
    }

    _returnAnimatedTitleStyles = () => {
        const { isFieldActive } = this.state;
        return {
            top: this.position.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
            }),
            fontSize: isFieldActive ? Theme.fontSize.semiSmall1 : Theme.fontSize.regular,
            fontFamily: Theme.fontFamily.medium,
            color: isFieldActive ? Theme.colors.nappPink : 'darkgray',
        }
    }

    render() {
        // const { onFocus, onBlur } = this.props
        return (

            <View style={Styles.container}>
                <Image
                    // ref={(img) => { this._imgIcon = img; }}
                    style={[styContainer.defaultIconStyle, { alignSelf: 'center', tintColor: this.props.iconTintColor }]}
                    resizeMode='contain'
                    // tintColor={this.props.iconTintColor}
                    source={this.props.iconImage}></Image>

                <View style={{ width: '90%' }}>
                    <Animated.Text
                        style={[Styles.titleStyles, this._returnAnimatedTitleStyles()]}
                    >
                        {this.props.title}
                    </Animated.Text>

                    <TextInput
                        allowFontScaling={false}
                        value={this.props.value}
                        style={Styles.textInput}
                        underlineColorAndroid='transparent'
                        onFocus={this._handleFocus}

                        onBlur={this._handleBlur}
                        onChangeText={this._onChangeText}
                        keyboardType={this.props.keyboardType}
                        {...this.props.otherTextInputProps}
                    />


                    <View style={[styContainer.bottomLineSeperator]}></View>

                </View>
                {
                    this.props.isModel ? (
                        <TouchableOpacity
                            onPress={this._handleFocus}
                            style={[Styles.textInput, { width: '100%', position: 'absolute' }]}>

                        </TouchableOpacity>
                    ) : (
                            <View></View>
                        )
                }
            </View>

        )
    }
}

const Styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
    },
    textInput: {
        fontSize: 17,
        fontFamily: Theme.fontFamily.medium,
        color: Theme.colors.nappTextBlack,
        height: 60,
        marginLeft: Platform.OS === "ios" ? 10 : 7,
    },
    titleStyles: {
        position: 'absolute',
        fontFamily: Theme.fontFamily.medium,
        left: 10,
    },

})
