import React, { Component } from 'react';
import { PropTypes, func } from 'prop-types';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import styContainer from '../styles/commonStyle';

import Theme from '../theme/theme'

export default class CustomAlert extends Component {
    static propTypes = {
        title: PropTypes.string,
        message: PropTypes.string,
        arrButtons: PropTypes.array,
        isAlertVisible: PropTypes.bool,
        buttonTintColor: PropTypes.string,
        onButtonClicked: func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: this.props.isAlertVisible
        }
    }


    onButtonClicked(obj) {
        this.props.onButtonClicked(obj)
    }

    onCancelClicked() {
        this.props.onButtonClicked("cancel")
    }

    render() {
        return (
            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}
                visible={this.props.isAlertVisible}
                onRequestClose={() => { this.onCancelClicked() }}>
                <View style={{ flex: 1, backgroundColor: '#00000070', justifyContent: 'center' }}>
                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '80%', alignSelf: 'center' }}>
                        <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.regularX, marginTop: 10, marginBottom: 2.5, marginLeft: 15, marginRight: 15 }}>{this.props.title ? this.props.title : ''}</Text>
                        {
                            this.props.message.trim() == "" ? (
                                <View></View>
                            ) : (
                                    <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.light, fontSize: Theme.fontSize.semiRegular, marginTop: 2.5, marginBottom: 20, marginLeft: 15, marginRight: 15 }}>{this.props.message ? this.props.message : ''}</Text>
                                )
                        }




                        {this.props.arrButtons.map((prop, key) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => this.onButtonClicked(prop)}
                                    activeOpacity={0.7}
                                    style={[styContainer.profilePicturePickerButton, { borderTopWidth: key == 0 ? 0.5 : 0 }]}>
                                    <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText,
                                    {
                                        fontSize: Theme.fontSize.regular,
                                        color: this.props.buttonTintColor,
                                        fontFamily: Theme.fontFamily.black
                                    }]}>{prop.title}</Text>
                                </TouchableOpacity>
                            );
                        })}

                        <TouchableOpacity
                            onPress={() => this.onCancelClicked()}
                            activeOpacity={0.7}
                            style={[styContainer.profilePicturePickerButton]}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontSize: Theme.fontSize.regular, color: this.props.buttonTintColor }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}