import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker'
import Theme from '../theme/theme'
import { View } from 'react-native-animatable';
import moment from 'moment'
import AppConstants from '../module/constantVairable'
import { ShowValidationMessage } from '../module/validator'
var _this= null
export default class DatePickerKeyboardView extends Component {
    static propTypes = {
        title: PropTypes.string,
        pickerMode: PropTypes.string,
        maximumDate: PropTypes.Date,
        minimumDate: PropTypes.Date,
        initialDate: PropTypes.Date,
        minuteInterval: PropTypes.number
    };

    constructor(props) {
        super(props);
        _this = this
        this.state = {
            selectedDate: props.initialDate,
        }
    }



    onDateChangeListner(date) {
        console.log(date)
        this.setState({
            selectedDate: date
        })

        console.log(this.props.title)
        if (Platform.OS == "android" && (this.props.title == AppConstants.StringLiterals.selectDateOfBirth || this.props.title == AppConstants.StringLiterals.selectChildDateOfBirth)) {
            
            let today = moment(new Date()).format("ddd MMMM, Do")
            let selectedDay = moment(date).format("ddd MMMM, Do")
            if (today == selectedDay) {
                ShowValidationMessage("Please change the year first")
            }
        }
        

        /*KeyboardRegistry.onItemSelected('DatePickerKeyboardView', {
            selectedDate: date,
        });*/
    }

    btnDoneClicked() {
        this.props.onDoneClicked(this.state.selectedDate)
    }

    render() {
        return (
            <View style={[styles.keyboardContainer, {}]}>
                {
                    this.props.title.trim() == "" ? (
                        <View></View>
                    ) : (
                            <Text allowFontScaling={false} style={{ fontFamily: Theme.fontFamily.medium, marginBottom: 40, color: Theme.colors.nappBlue, fontSize: Theme.fontSize.regularX }}>{this.props.title}</Text>
                        )
                }

                <DatePicker
                    style={{ minWidth: 320 }}
                    maximumDate={this.props.maximumDate}
                    minimumDate={this.props.minimumDate}
                    mode={this.props.pickerMode}
                    date={this.state.selectedDate}
                    minuteInterval={this.props.minuteInterval}
                    onDateChange={date => _this.onDateChangeListner(date)}
                />

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

//KeyboardRegistry.registerKeyboard('DatePickerKeyboardView', () => DatePickerKeyboardView);