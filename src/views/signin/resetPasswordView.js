import React, { useState, useEffect } from 'react';
import { Dimensions, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';

import Theme from '../../theme/theme'
import styContainer from '../../styles/commonStyle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { FloatingTitleTextInputField } from '../floatingTextLib/floating_title_text_input_field';
import { EmailValidtor, PasswordValidtor } from '../../module/validator'
import { CALL_API, Reload_API_Alert } from '../../api/api';
import Loader from '../../components/loader'
import CustomTextInputView from '../../components/customTextInputView'
import CardView from 'react-native-cardview';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import CustomButton from '../../components/customButton';
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey } from '../../module/cacheData'
import KeyboardAccessoryView from '../../components/keyboardAccessoryView'
import AppConstants from '../../module/constantVairable'
import { EventRegister } from 'react-native-event-listeners'
let _this = null

const resetPasswordView = (props) => {

    const [txt_email, settxt_email] = useState("")
    const [txt_code, settxt_code] = useState("")
    const [txt_new_password, settxt_new_password] = useState("")
    const [txt_confirm_password, settxt_confirm_password] = useState("")
    const [isLoading, setisLoading] = useState(false)
    const [isEmailAdded, setisEmailAdded] = useState(false)
    const [kDoRender, setkDoRender] = useState(false)
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [btnShowLoading, setbtnShowLoading] = useState(false)

    useEffect(() => {
        checkUIStatus()
    }, [])

    async function checkUIStatus() {
        let email = await getDataFromCachedWithKey("reset_password_email")
        if (email) {
            setisEmailAdded(true)
            settxt_email(email)
            setkDoRender(true)
        }
        else {
            setkDoRender(true)
            settxt_code("")
            settxt_email("")
            settxt_new_password("")
            settxt_confirm_password("")
            setisEmailAdded(false)
            setisBtnSubmitClicked(false)
        }
    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    function btnSendCodeClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)

        if (checkVal(txt_email)) {
            if (!EmailValidtor(txt_email)) {
                Alert.alert(AppConstants.StringLiterals.strEmailFormatFail)
                return
            }
            setbtnShowLoading(true)
            let param = {
                email: txt_email
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
                    saveDataToCachedWithKey("reset_password_email", txt_email)
                    setisBtnSubmitClicked(false)
                    Alert.alert("Code has been sent to your email address.")
                    setTimeout(() => {
                        checkUIStatus()
                    }, 200);
                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }



            })

        }
    }

    function btnResetPasswordClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)
        if (checkVal(txt_code) && checkVal(txt_new_password) && checkVal(txt_confirm_password)) {
            if (txt_new_password != txt_confirm_password) {
                Alert.alert(AppConstants.StringLiterals.strPasswordDoesnNotMatch)
                return
            }

            let param = {
                code: txt_code,
                new_password: txt_new_password,
                email: txt_email
            }
            setbtnShowLoading(true)
            CALL_API("resetForgotPassword", param).then((res) => {
                setTimeout(() => {
                    setbtnShowLoading(false)
                }, 1000)
                if (res.errMsg != null) {
                    Reload_API_Alert(res.errMsg).then((res) => {
                        if (res) {
                            btnResetPasswordClicked()
                        }
                    })
                    return
                }

                if (res.status == 1) {
                    setisBtnSubmitClicked(false)
                    removeDataFromCachedWithKey("reset_password_email")
                    EventRegister.emit("autoFillEmailAfterResetPasswordListener", { email: txt_email })
                    setTimeout(function () {
                        Alert.alert(
                            "Success",
                            "Your password was successfully reset.",
                            [
                                {
                                    text: 'Login', onPress: () => {
                                        props.navigation.navigate("signInView", {
                                            initSignIn: true
                                        })
                                    }
                                },
                            ],
                            { cancelable: false },
                        );
                    }, 50)

                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }
            })

        }
        return
        if (performValidation()) {

            let param = {
                code: txt_code,
                password: txt_new_password,
            }
            setisLoading(true)
            CALL_API("reset-password", param).then((res) => {
                setisLoading(false)
                setTimeout(() => {
                    setisLoading(false)
                }, 3000);

                console.log(res)
                if (res.errMsg == null) {
                    if (res.message) {
                        setTimeout(function () {
                            Alert.alert(AppConstants.napErrorpAlertDefaultTitle, AppConstants.StringLiterals.strErrorWhileCreatingUser + "\n\n" + res.message)
                        }, 50)
                    }
                    else {
                        setTimeout(function () {
                            Alert.alert(
                                "Success",
                                "Your password was successfully reset. Please head back to the sign in screen and log in.",
                                [
                                    {
                                        text: 'Ok', onPress: () => {
                                            props.navigation.navigate("LoginView")
                                        }
                                    },
                                ],
                                { cancelable: false },
                            );
                        }, 50)

                    }
                }
                else {
                    Reload_API_Alert(res.errMsg).then((res) => {
                        btnResetPasswordClicked()
                    })
                }
            })
        }
    }




    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    const _updateMasterStateEmail = (attrName, value) => {
        settxt_email(value)
    }

    const _updateMasterStateCode = (attrName, value) => {
        settxt_code(value)
    }

    const _updateMasterStateNewPassword = (attrName, value) => {
        settxt_new_password(value)
    }

    const _updateMasterStateConfirmPassword = (attrName, value) => {
        settxt_confirm_password(value)
    }

    function changeEmailClicked() {
        removeDataFromCachedWithKey("reset_password_email")
        checkUIStatus()
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
            <Text style={styContainer.pageTitleText}>Reset Password</Text>

            <KeyboardAwareScrollView
                keyboardShouldPersistTaps={'handled'}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardDismissMode={'interactive'}
                style={{ width: '95%' }}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>


                        <View style={{ marginTop: 20 }}>

                            {
                                kDoRender ? (
                                    <View style={{ width: '100%' }}>
                                        {
                                            isEmailAdded ? (
                                                <View style={{ width: '100%' }}>

                                                    <CustomTextInputView
                                                        attrName='txt_email'
                                                        title={"Email"}
                                                        value={txt_email}
                                                        isErrorRedBorder={(txt_email.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                        updateMasterState={_updateMasterStateEmail}
                                                        keyboardType='email-address'
                                                        otherTextInputProps={{
                                                            placeholder: "Enter Email",
                                                            autoCorrect: false,
                                                            autoCapitalize: 'none',
                                                            editable: false,
                                                            opacity: 0.6
                                                        }}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => changeEmailClicked()}
                                                        activeOpacity={0.7}
                                                        style={{ marginTop: 2 }}>
                                                        <Text style={{
                                                            paddingTop: 5, paddingBottom: 5,
                                                            fontFamily: Theme.fontFamily.regular,
                                                            color: Theme.colors.sendMeBlue
                                                        }}>Change Email</Text>
                                                    </TouchableOpacity>
                                                    <View style={{ height: 20 }}></View>
                                                    <CustomTextInputView
                                                        attrName='txt_code'
                                                        title={"Reset Code"}
                                                        value={txt_code}
                                                        isErrorRedBorder={(txt_code.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                        updateMasterState={_updateMasterStateCode}
                                                        otherTextInputProps={{
                                                            placeholder: "Enter Reset Code",
                                                            autoCorrect: false,
                                                        }}
                                                    />

                                                    <View style={{ height: 20 }}></View>
                                                    <CustomTextInputView
                                                        attrName='txt_new_password'
                                                        title={"New Password"}
                                                        value={txt_new_password}
                                                        isErrorRedBorder={(txt_new_password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                        updateMasterState={_updateMasterStateNewPassword}
                                                        otherTextInputProps={{
                                                            placeholder: "Enter New Password",
                                                            autoCorrect: false,
                                                            secureTextEntry: true,
                                                        }}
                                                    />

                                                    <View style={{ height: 20 }}></View>
                                                    <CustomTextInputView
                                                        attrName='txt_confirm_password'
                                                        title={"Confirm Password"}
                                                        value={txt_confirm_password}
                                                        isErrorRedBorder={(txt_confirm_password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                        updateMasterState={_updateMasterStateConfirmPassword}
                                                        otherTextInputProps={{
                                                            placeholder: "Enter Confirm Password",
                                                            autoCorrect: false,
                                                            secureTextEntry: true,
                                                        }}
                                                    />
                                                </View>
                                            ) : (
                                                <View style={{ width: '100%' }}>
                                                    <CustomTextInputView
                                                        attrName='txt_email'
                                                        title={"Email"}
                                                        value={txt_email}
                                                        isErrorRedBorder={(txt_email.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                        updateMasterState={_updateMasterStateEmail}
                                                        keyboardType='email-address'
                                                        otherTextInputProps={{
                                                            placeholder: "Enter Email",
                                                            autoCorrect: false,
                                                            autoCapitalize: 'none',
                                                            editable: true,
                                                            opacity: 1
                                                        }}
                                                    />
                                                </View>
                                            )
                                        }

                                    </View>
                                ) : (
                                    <View></View>
                                )
                            }
                        </View>

                        <View style={{ height: 25 }}></View>
                        <View style={{ width: '100%', marginBottom: 5 }}>
                            {
                                isEmailAdded ? (
                                    <CustomButton title={"Reset Password"}
                                        isLoading={btnShowLoading}
                                        onButtonClicked={btnResetPasswordClicked} />
                                ) : (
                                    <CustomButton title={"Send Code"}
                                        isLoading={btnShowLoading}
                                        onButtonClicked={btnSendCodeClicked} />
                                )
                            }

                        </View>

                        <View style={{ height: 30 }}></View>

                    </View>
                </View>
            </KeyboardAwareScrollView>

            <KeyboardAccessoryView />
        </SafeAreaView >
    )
}

export default resetPasswordView

resetPasswordView['navigationOptions'] = screenProps => ({
    header: null
})
