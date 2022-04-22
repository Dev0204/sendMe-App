import React, { Component, useState, useEffect } from 'react';
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
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';

var _this = null

const missionaryProfileView = (props) => {

    const [missionDetails, setmissionDetails] = useState("")
    const [missionLocation, setmissionLocation] = useState("")
    const [goalToRise, setgoalToRise] = useState("")
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [isBtnRaisingMoneySubmitClicked, setisBtnRaisingMoneySubmitClicked] = useState(false)
    const [bank_details, setbank_details] = useState("Loading Bank Details...")
    const [stripeDashboardURL, setstripeDashboardURL] = useState("")
    const [isRaisingPaused, setisRaisingPaused] = useState(false)
    let currentUser = getCurrentUserData()
    let serverConfig = getConfigurationData()

    useEffect(() => {
        setmissionDetails(currentUser.missionary_goal.missionary_details)
        setgoalToRise(currentUser.missionary_goal.missionary_goal + '')
        setmissionLocation(currentUser.missionary_goal.missionary_location)
        checkEnabledRaisingStatus()
    }, [])


    function getStripeLoginLink() {
        CALL_API("getMissionaryBankDashboardLink").then((res) => {
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        getStripeLoginLink()
                    }
                })
                return
            }

            if (res.status == 1) {
                setbank_details("Bank Details")
                setstripeDashboardURL(res.data.url)
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    const _updateMasterStateMissionDetails = (attrName, value) => {
        setmissionDetails(value)
    }

    const _updateMasterStateMissionLocation = (attrName, value) => {
        setmissionLocation(value)
    }

    const _updateMasterStateGoalToRaise = (attrName, value) => {
        setgoalToRise(value)
    }


    function btnSubmitClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)
        if (checkVal(goalToRise) && checkVal(missionDetails) && checkVal(missionLocation)) {
            let goal = goalToRise
            if (goal <= 0 || isNaN(goal)) {
                Alert.alert("Please enter valid goal amount!")
                return
            }
            updateGoal()
        }

    }

    function updateGoal() {
        setbtnShowLoading(true)
        let param = {
            missionary_details: missionDetails,
            missionary_goal: goalToRise,
            missionary_location: missionLocation,
        }
        CALL_API("updateMissionaryGoal", param).then((res) => {
            setbtnShowLoading(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        updateGoal()
                    }
                })
                return
            }


            if (res.status == 1) {
                Alert.alert("Goal has been updated.")
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                    }
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

    function navigateToBankView() {
        if (stripeDashboardURL != "") {
            props.navigation.navigate("commonWebView", {
                txt_title: "Bank Details",
                url: stripeDashboardURL
            })
        }
    }

    function checkEnabledRaisingStatus() {
        currentUser = getCurrentUserData()
        if (currentUser.is_rounding_up_paused == 1) {
            setisRaisingPaused(true)
        }
        else {
            setisRaisingPaused(false)
            getStripeLoginLink()
        }
        EventRegister.emit("reloadProfileListener", '')
    }

    function btnPauseRaisingFundClicked() {
        if (isBtnRaisingMoneySubmitClicked) {
            return
        }
        Alert.alert("Are you sure you want to pause raising funds?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        doPauseRaising()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    function btnStartRaisingFundClicked() {
        if (isBtnRaisingMoneySubmitClicked) {
            return
        }
        Alert.alert("Are you sure you are ready to start raising funds again?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        doStartRaising()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }


    function doStartRaising() {
        setisBtnRaisingMoneySubmitClicked(true)
        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "Missionary_Start_Raising_Funds",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        CALL_API("startRaisingFund").then((res) => {
            setisBtnRaisingMoneySubmitClicked(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        doStartRaising()
                    }
                })
                return
            }

            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                        checkEnabledRaisingStatus()
                    }
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })

    }



    function doPauseRaising() {
        setisBtnRaisingMoneySubmitClicked(true)

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "Missionary_Pause_Raising_Funds",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        CALL_API("pauseRaisingFund").then((res) => {
            setisBtnRaisingMoneySubmitClicked(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        doPauseRaising()
                    }
                })
                return
            }

            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                        checkEnabledRaisingStatus()
                    }
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })

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

                <Text style={styContainer.pageTitleText}>My Profile</Text>
                {
                    isRaisingPaused ? (
                        <View style={{
                            width: '100%', marginTop: -50,
                            flex: 1, justifyContent: 'center'
                        }}>
                            <Text style={{
                                padding: 10, textAlign: 'center',
                                fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small
                            }}>
                                {AppConstants.StringLiterals.rasingPausedMessage}
                            </Text>
                            <CustomButton title={"Start Raising Funds"}
                                isLoading={isBtnRaisingMoneySubmitClicked}
                                defineHeight={RFValue(40)}
                                bgColor={"#28bf58"}
                                onButtonClicked={btnStartRaisingFundClicked} />
                        </View>
                    ) : (
                        <KeyboardAwareScrollView
                            automaticallyAdjustContentInsets={false}
                            contentContainerStyle={{ paddingBottom: 70, alignItems: 'center' }}
                            keyboardShouldPersistTaps={'handled'}
                            style={{ width: '100%', flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>

                                    <FastImage
                                        source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.user_profile_photo }}
                                        style={{ borderRadius: RFValue(35), height: RFValue(70), width: RFValue(70), backgroundColor: 'gray' }}>
                                    </FastImage>

                                    <Text style={{
                                        marginLeft: 8, fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
                                        fontSize: Theme.fontSize.small, color: Theme.colors.sendMeBlack
                                    }}>{currentUser.display_name}</Text>
                                </View>
                                <View></View>
                            </View>
                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='missionDetails'
                                title={"Mission Details"}
                                value={missionDetails}
                                isErrorRedBorder={(missionDetails.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterStateMissionDetails}
                                isMultiline={true}
                                otherTextInputProps={{
                                    placeholder: "Details",
                                    autoCorrect: false
                                }}
                            />
                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='missionLocation'
                                title={"Mission Location"}
                                value={missionLocation}
                                updateMasterState={_updateMasterStateMissionLocation}
                                otherTextInputProps={{
                                    placeholder: "Enter Location",
                                    autoCorrect: false
                                }}
                            />
                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='goalToRise'
                                title={"Total Goal to Raise:"}
                                value={goalToRise}
                                isErrorRedBorder={(goalToRise.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterStateGoalToRaise}
                                keyboardType="number-pad"
                                otherTextInputProps={{
                                    placeholder: "Enter Goal",

                                    autoCorrect: false
                                }}
                            />
                            <CardView cardElevation={2} style={{ width: '90%' }}>
                                <TouchableOpacity
                                    onPress={() => navigateToBankView()}
                                    activeOpacity={0.7} style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', width: '100%' }}>
                                    <Text style={{ marginLeft: 10, letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>{bank_details}</Text>
                                    <View>
                                        <Image resizeMode="contain" style={{ height: RFValue(13), width: RFValue(13), marginRight: 10 }} source={Theme.icons.ic_right_arrow}></Image>
                                    </View>
                                </TouchableOpacity>
                            </CardView>

                            <View style={{ width: '100%', marginTop: 25 }}>

                                <CustomButton title={"Pause Raising Funds"}
                                    isLoading={isBtnRaisingMoneySubmitClicked}
                                    defineHeight={RFValue(40)}
                                    bgColor={"#bf3528"}
                                    onButtonClicked={btnPauseRaisingFundClicked} />


                            </View>

                        </KeyboardAwareScrollView>
                    )
                }

                <KeyboardAccessoryView />
                {
                    isRaisingPaused ? (
                        <View></View>
                    ) : (
                        <View style={{ width: '100%', marginBottom: 10 }}>
                            <CustomButton title="Submit"
                                isLoading={btnShowLoading}
                                onButtonClicked={btnSubmitClicked} />
                        </View>
                    )
                }

            </View>
        </SafeAreaView >
    )
}

export default missionaryProfileView

missionaryProfileView['navigationOptions'] = screenProps => ({
    header: null
})


