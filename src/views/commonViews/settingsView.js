import React, { useState } from 'react';
import { Dimensions, FlatList, SectionList, ScrollView, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet, TextComponent, Modal } from 'react-native';

import Theme from '../../theme/theme'
import styContainer from '../../styles/commonStyle';
import AppConstants from '../../module/constantVairable'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import Loader from '../../components/loader'
import CardView from 'react-native-cardview';
import CustomTextInputView from '../../components/customTextInputView'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import KeyboardAccessoryView from '../../components/keyboardAccessoryView'
import CustomButton from '../../components/customButton';
import { EmailValidtor, PasswordValidtor } from '../../module/validator'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import * as Animatable from 'react-native-animatable';
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey } from '../../module/cacheData'
import { CALL_API, Reload_API_Alert, getConfigurationData, syncUserWithServer, saveCurrentUserData, getCurrentUserData, UPLOAD_PROFILE } from '../../api/api';
let serverConfig = {}

const settingsView = (props) => {

    serverConfig = getConfigurationData()
    const [missionDetails, setmissionDetails] = useState("")
    const [goalToRise, setgoalToRise] = useState("")
    const [isChangingPassword, setisChangingPassword] = useState(false)
    const [txt_old_password, settxt_old_password] = useState("")
    const [txt_new_password, settxt_new_password] = useState("")
    const [txt_confirm_password, settxt_confirm_password] = useState("")
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [btnShowLoading, setbtnShowLoading] = useState(false)


    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    function btnChangePasswordClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }

        setisBtnSubmitClicked(true)

        if (checkVal(txt_old_password) && checkVal(txt_new_password) && checkVal(txt_confirm_password)) {
            if (!PasswordValidtor(txt_new_password)) {
                Alert.alert(AppConstants.StringLiterals.strPasswordFailMinCharacter)
                return
            }
            if (txt_confirm_password != txt_new_password) {
                Alert.alert(AppConstants.StringLiterals.strPasswordDoesnNotMatch)
                return
            }
        }
        else {
            return
        }

        let param = {
            old_password: txt_old_password,
            new_password: txt_new_password
        }

        setbtnShowLoading(true)
        CALL_API("changePassword", param).then((res) => {
            setbtnShowLoading(false)
            console.log(res)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnChangePasswordClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                Alert.alert("Password has been changed")
                settxt_confirm_password('')
                settxt_old_password('')
                settxt_new_password('')
                setisBtnSubmitClicked(false)
                setisChangingPassword(false)
                saveCurrentUserData(res.data)
                saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData, res.data)
                syncUserWithServer().then((res) => {
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })

    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    const _updateMasterStateOldPassword = (attrName, value) => {
        settxt_old_password(value)
    }

    const _updateMasterStateNewPassword = (attrName, value) => {
        settxt_new_password(value)
    }

    const _updateMasterStateConfirmPassword = (attrName, value) => {
        settxt_confirm_password(value)
    }

    function btnGetReadyClicked() {
        setselectedTab(1)
    }

    function navigateToBankView() {
        props.navigation.navigate("commonWebView", {
            txt_title: "Bank Details",
            url: "https://www.stripe.com"
        })
    }

    function btnChangePasswordViewMoreClicked() {
        // let isChangingPassword = isChangingPassword
        setTimeout(() => {
            settxt_confirm_password('')
            settxt_old_password('')
            settxt_new_password('')
            setisBtnSubmitClicked(false)
            setisChangingPassword(!isChangingPassword)
        }, 50);
    }

    function btnLinkClicked(type) {
        if (type == "toc") {
            props.navigation.navigate("commonWebView", {
                txt_title: type,
                url: serverConfig.terms_condition_url
            })
        }
        else if (type == "Privacy_Policy") {
            props.navigation.navigate("commonWebView", {
                txt_title: type,
                url: serverConfig.privacy_policy_url
            })
        }

    }
    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>
                            <TouchableOpacity activeOpacity={0.7}
                                style={styContainer.sideMenuContainerLeft}
                                onPress={() => btnSideMenuClicked()}
                            >
                                <Image
                                    style={styContainer.sideMenuIcon}
                                    source={Theme.icons.ic_sidemenu}>
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
                <Text style={styContainer.pageTitleText}>Settings</Text>
                <KeyboardAwareScrollView
                    automaticallyAdjustContentInsets={false}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 50, alignItems: 'center' }}
                    keyboardShouldPersistTaps={'handled'}
                    style={{ width: '100%' }}>


                    {/* <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={{ marginTop: 10, width: '100%' }}> */}





                    <CardView cardElevation={2} style={{ marginTop: 10, width: '90%' }}>
                        <View style={{ backgroundColor: 'white', padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.semiSmall, flex: 1 }]}>Privacy Policy</Text>
                                <TouchableOpacity
                                    onPress={() => btnLinkClicked("Privacy_Policy")}
                                    activeOpacity={0.7}
                                    style={{ backgroundColor: Theme.colors.sendMeBlue }}>
                                    <Text style={styContainer.btnViewMore}>View More</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CardView>

                    <CardView cardElevation={2} style={{ marginTop: 10, width: '90%' }}>
                        <View style={{ backgroundColor: 'white', padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.semiSmall, flex: 1 }]}>Terms and Conditions</Text>
                                <TouchableOpacity
                                    onPress={() => btnLinkClicked("toc")}
                                    activeOpacity={0.7}
                                    style={{ backgroundColor: Theme.colors.sendMeBlue }}>
                                    <Text style={styContainer.btnViewMore}>View More</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CardView>

                    <CardView cardElevation={2} style={{ marginTop: 10, width: '90%' }}>
                        <View style={{ backgroundColor: 'white', padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.semiSmall, flex: 1 }]}>Change Password</Text>
                                <TouchableOpacity
                                    onPress={() => btnChangePasswordViewMoreClicked()}
                                    activeOpacity={0.7}
                                    style={{ backgroundColor: Theme.colors.sendMeBlue }}>
                                    <Text style={styContainer.btnViewMore}>{isChangingPassword ? 'Cancel' : 'View More'}</Text>
                                </TouchableOpacity>
                            </View>
                            {
                                isChangingPassword ? (
                                    <Animatable.View animation="fadeIn">

                                        <View style={{ width: '100%', alignItems: 'center' }}>
                                            <CustomTextInputView
                                                attrName='txt_old_password'
                                                title={" "}
                                                value={txt_old_password}
                                                updateMasterState={_updateMasterStateOldPassword}
                                                isErrorRedBorder={(txt_old_password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                otherTextInputProps={{
                                                    placeholder: "Old Password",
                                                    autoCorrect: false,
                                                    secureTextEntry: true,
                                                    autoCapitalize: 'none'
                                                }}
                                            />
                                        </View>


                                        <View style={{ width: '100%', alignItems: 'center' }}>
                                            <CustomTextInputView
                                                attrName='txt_new_password'
                                                title={" "}
                                                value={txt_new_password}
                                                updateMasterState={_updateMasterStateNewPassword}
                                                isErrorRedBorder={(txt_new_password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                otherTextInputProps={{
                                                    placeholder: "New Password",
                                                    autoCorrect: false,
                                                    secureTextEntry: true,
                                                    autoCapitalize: 'none'
                                                }}
                                            />
                                        </View>

                                        <View style={{ width: '100%', alignItems: 'center' }}>
                                            <CustomTextInputView
                                                attrName='txt_confirm_password'
                                                title={" "}
                                                value={txt_confirm_password}
                                                updateMasterState={_updateMasterStateConfirmPassword}
                                                isErrorRedBorder={(txt_confirm_password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                                otherTextInputProps={{
                                                    placeholder: "Confirm Password",
                                                    autoCorrect: false,
                                                    secureTextEntry: true,
                                                    autoCapitalize: 'none'
                                                }}
                                            />
                                        </View>
                                        <View style={{ width: '100%', marginBottom: 5, marginTop: 20 }}>
                                            <CustomButton title={"Change Password"}
                                                isLoading={btnShowLoading}
                                                onButtonClicked={btnChangePasswordClicked} />
                                        </View>

                                    </Animatable.View>
                                ) : (<View></View>)
                            }
                        </View>
                    </CardView>


                </KeyboardAwareScrollView>
                <KeyboardAccessoryView />


                {/* </ScrollView> */}

            </View>
        </SafeAreaView >
    )
}

export default settingsView

settingsView['navigationOptions'] = screenProps => ({
    header: null
})

