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
import { EventRegister } from 'react-native-event-listeners'
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
var _this = null

const userTypeSelectionView = (props) => {

    const [selectedTab, setselectedTab] = useState(-1)
    const [btnShowLoading, setbtnShowLoading] = useState(false)

    function btnGetReadyClicked() {
        if (selectedTab == -1) {
            return
        }
        let param = {
            user_type: selectedTab == 0 ? 'missionary' : 'sponsor'
        }

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "user_type",
                user_type: selectedTab == 0 ? 'missionary' : 'sponsor'
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        console.log(param)
        setbtnShowLoading(true)
        setTimeout(() => {
            setbtnShowLoading(false)
        }, AppConstants.loaderTimeOutDuration * 1000);
        CALL_API("userTypeSelection", param, "post").then((res) => {
            setTimeout(() => {
                setbtnShowLoading(false)
            }, 1000)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnGetReadyClicked()
                    }
                })
                return
            }
            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    let currentUser = getCurrentUserData()
                    if (currentUser.user_type == "missionary") {
                        props.navigation.navigate("missionaryAccountSetupInfoView")
                    }
                    else if (currentUser.user_type == "sponsor") {
                        props.navigation.navigate("sponsorAccountSetupInfoView")
                    }
                    else {
                        props.navigation.navigate("landingScreen")
                    }
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
            console.log(res)
        })
        //_this.props.navigation.navigate("missionarySelectionListView")
        //_this.props.navigation.navigate("missionaryGoalView")
    }

    function btnTabClicked(idx) {
        setselectedTab(idx)
    }

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>
                            <View>
                            </View>
                            <Image
                                resizeMode="contain"
                                style={{ height: RFValue(90) }}
                                source={Theme.icons.ic_app_logo}>
                            </Image>
                            <View>
                            </View>
                        </View>
                    </View>
                </CardView>

                <View style={{ width: '100%', flex: 1, marginBottom: 5, justifyContent: 'center' }}>
                    <Text style={{
                        fontSize: Theme.fontSize.medium,
                        textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                        marginBottom: 5
                    }}>I am a...</Text>
                    <Text style={{
                        fontSize: Theme.fontSize.large,
                        color: Theme.colors.sendMeBlue,
                        textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                        marginBottom: 5
                    }}>Choose one below</Text>
                    <View style={{ width: '90%', alignSelf: 'center', marginTop: 20 }}>
                        <TouchableOpacity
                            onPress={() => btnTabClicked(0)}
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row' }}
                        >
                            <View>
                                <Image
                                    style={{ height: 30, width: 30 }}
                                    source={selectedTab == 0 ? Theme.icons.ic_radio_checked : Theme.icons.ic_radio_unchecked}
                                ></Image>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={{
                                    fontSize: Theme.fontSize.regular,
                                    fontFamily: Theme.fontFamily.bold,
                                }}>Missionary</Text>
                                <Text style={{
                                    fontSize: Theme.fontSize.regular,
                                    fontFamily: Theme.fontFamily.light,
                                    opacity: 0.7
                                }}>I am looking to raise funds to support my missionary work.</Text>
                            </View>
                        </TouchableOpacity>


                        <TouchableOpacity
                            onPress={() => btnTabClicked(1)}
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row', marginTop: 20 }}
                        >
                            <View>
                                <Image
                                    style={{ height: 30, width: 30 }}
                                    source={selectedTab == 1 ? Theme.icons.ic_radio_checked : Theme.icons.ic_radio_unchecked}
                                ></Image>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={{
                                    fontSize: Theme.fontSize.regular,
                                    fontFamily: Theme.fontFamily.bold,
                                }}>Sponsor</Text>
                                <Text style={{
                                    fontSize: Theme.fontSize.regular,
                                    fontFamily: Theme.fontFamily.light,
                                    opacity: 0.7
                                }}>I am looking to provide funds to support a missionary's work.</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{ height: 40 }}></View>


                    </View>

                    {
                        selectedTab == -1 ? (
                            <View style={{ height: RFValue(45) }}></View>
                        ) : (
                            // <View style={{ marginTop: 20 }}>
                            <CustomButton title="Select"
                                isLoading={btnShowLoading}
                                onButtonClicked={btnGetReadyClicked} />
                            // </View>
                        )
                    }


                </View>

            </View>
        </SafeAreaView >
    )
}

export default userTypeSelectionView

userTypeSelectionView['navigationOptions'] = screenProps => ({
    header: null
})