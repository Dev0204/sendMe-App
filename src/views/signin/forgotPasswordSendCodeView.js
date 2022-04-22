import React, { useState } from 'react';
import { Dimensions, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';

import Theme from '../../theme/theme'
import styContainer from '../../styles/commonStyle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

import { FloatingTitleTextInputField } from '../floatingTextLib/floating_title_text_input_field';
import { EmailValidtor } from '../../module/validator'
import { CALL_API } from '../../api/api';

import Loader from '../../components/loader'
import KeyboardAccessoryView from '../../components/keyboardAccessoryView'
import CustomTextInputView from '../../components/customTextInputView'
import CardView from 'react-native-cardview';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import CustomButton from '../../components/customButton';

let _this = null
const forgotPasswordSendCodeView = (props) => {

    const [email, setemail] = useState("")
    const [isLoading, setisLoading] = useState(false)
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)

    function btnSendCodeClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)
        if (checkVal(email)) {
            if (!EmailValidtor(email)) {
                Alert.alert(AppConstants.StringLiterals.strEmailFormatFail)
                return
            }
            setbtnShowLoading(true)
            let param = {
                email: email
            }
            CALL_API("forgotPassword", param).then((res) => {
                setTimeout(() => {
                    setbtnShowLoading(false)
                }, 1000)
                if (res.errMsg != null) {
                    Reload_API_Alert(res.errMsg).then((res) => {
                        if (res) {
                            btnSendCodeClicked()
                        }
                    })
                    return
                }

                if (res.status == 1) {

                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }
            })

        }

    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    const _updateMasterState = (attrName, value) => {
        setemail(value)
    }


    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <Loader loading={isLoading} refParentView={_this} />
            {/* <KeyboardAccessoryView> */}
            <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                <View style={styContainer.navigationCustomHeaderp}>
                    <View style={styContainer.navigationCustomHeaderq}>
                        <TouchableOpacity activeOpacity={0.7}
                            style={styContainer.sideMenuContainerLeft}
                            onPress={() => btnGoBackClicked()}
                        >
                            <Image
                                style={styContainer.sideMenuIcon}
                                source={Theme.icons.ic_go_back}>
                            </Image>
                        </TouchableOpacity>
                        <Image
                            resizeMode="contain"
                            style={{ height: RFValue(90) }}
                            source={Theme.icons.ic_app_logo}>
                        </Image>
                        <View style={styContainer.sideMenuContainerRight}>
                        </View>
                    </View>
                </View>
            </CardView>
            <Text style={styContainer.pageTitleText}>Forgot Password</Text>
            <KeyboardAwareScrollView
                // contentContainerStyle={{ paddingTop: 10, paddingBottom: 50, alignItems: 'center' }}
                automaticallyAdjustContentInsets={false}
                keyboardShouldPersistTaps={'handled'}
                // keyboardDismissMode={'interactive'}
                style={{ width: '95%' }}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>


                        <View style={{ marginTop: 20 }}>
                            <CustomTextInputView
                                attrName='email'
                                title={"Email"}
                                value={email}
                                isErrorRedBorder={(email.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterState}
                                keyboardType='email-address'
                                otherTextInputProps={{
                                    placeholder: "Email",
                                    autoCorrect: false,
                                }}
                            />

                        </View>
                        <View style={{ height: 25 }}></View>
                        <View style={{ width: '100%', marginBottom: 5 }}>
                            <CustomButton title={"Send Code"}
                                isLoading={btnShowLoading}
                                onButtonClicked={btnSendCodeClicked} />
                        </View>

                        <View style={{ height: 40 }}></View>

                    </View>
                </View>
            </KeyboardAwareScrollView>
            {/* </KeyboardAccessoryView> */}

            <KeyboardAccessoryView />

        </SafeAreaView>
    )
}

export default forgotPasswordSendCodeView

forgotPasswordSendCodeView['navigationOptions'] = screenProps => ({
    header: null
})
