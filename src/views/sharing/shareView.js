import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, SectionList, ScrollView, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet, TextComponent, Modal, Linking } from 'react-native';

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
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import branch, { BranchEvent } from 'react-native-branch'
import Share from "react-native-share";
import { EventRegister } from 'react-native-event-listeners'
var currentUser = {}
let serverConfig = {}
let isFromSlideMenu = false

const shareView = (props) => {

    isFromSlideMenu = props.navigation.getParam("is_from_menu", false)
    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()

    useEffect(() => {
        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "social_share",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
    }, [])


    function btnGoBackClicked() {
        if (isFromSlideMenu) {
            props.navigation.toggleDrawer()
        }
        else {
            props.navigation.goBack()
        }
    }

    async function generateBranchLink(type) {
        let branchUniversalObject = await branch.createBranchUniversalObject('canonicalIdentifier', {
            locallyIndex: true,
            title: 'SendMe',
            contentDescription: 'Donate round up to missionary',
            contentMetadata: {
                customMetadata: {
                    missionary_id: currentUser.user_id
                }
            }
        })
        let linkProperties = {
            feature: 'share',
            channel: 'RNApp'
        }

        let controlParams = {
            // $desktop_url: 'https://in.yahoo.com/?p=us'
        }

        let { url } = await branchUniversalObject.generateShortUrl(linkProperties, controlParams)
        console.log(url)
        /*let shareOptions = { messageHeader: 'Check this out', messageBody: 'No really, check this out!' }
        let linkProperties = { feature: 'share', channel: 'RNApp' }
        let controlParams = { $desktop_url: 'https://in.yahoo.com/?p=us', $ios_url: 'https://developer.apple.com/' }
        let { channel, completed, error } = await branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams)*/
        let shareText = "Hey, this is " + currentUser.display_name + " raising money for my mission. Any support would be appreciated through the SendMe app"
        if (type == 'text') {
            Platform.OS == 'ios'
            Linking.openURL("sms:" + (Platform.OS == 'ios' ? '&' : '?') + "body=" + shareText + " " + url);
        }
        else {
            let options = {
                message: shareText,
                title: "Please support my mission work via SendMe!",
                subject: "Please support my mission work via SendMe!",
                url: url
            }
            Share.open(options)
                .then((res) => {
                    console.log(res)
                    Alert.alert("You have successfully shared your profile link.")
                })
                .catch((err) => { err && console.log(err); });
        }

    }

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styContainer.sideMenuContainerLeft}
                                onPress={() => btnGoBackClicked()}
                            >
                                <Image
                                    style={styContainer.sideMenuIcon}
                                    source={isFromSlideMenu ? Theme.icons.ic_sidemenu : Theme.icons.ic_go_back}>
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
                <Text style={styContainer.pageTitleText}>Invite Contacts</Text>
                <CardView cardElevation={2} style={{ width: '90%', marginTop: 10 }}>
                    <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => generateBranchLink('text')}
                            activeOpacity={0.7}
                            style={{ padding: 7, flexDirection: 'row', width: '95%', alignItems: 'center' }}>
                            <Image
                                resizeMode="contain"
                                style={{ tintColor: Theme.colors.sendMeGray, height: 22, width: 22 }}
                                source={Theme.icons.ic_share_message}></Image>
                            <Text style={[styContainer.dashboardTabTitle,
                            {
                                fontSize: Theme.fontSize.semiSmall1, marginLeft: 9,
                                fontFamily: Theme.fontFamily.light
                            }]}>Share via Text</Text>
                        </TouchableOpacity>

                        <View style={{ height: 5 }}></View>

                        <TouchableOpacity
                            onPress={() => generateBranchLink('social')}
                            activeOpacity={0.7}
                            style={{ padding: 7, flexDirection: 'row', width: '95%', alignItems: 'center' }}>
                            <Image
                                resizeMode="contain"
                                style={{ tintColor: Theme.colors.sendMeGray, height: 22, width: 22 }}
                                source={Theme.icons.ic_share}></Image>
                            <Text style={[styContainer.dashboardTabTitle,
                            {
                                fontSize: Theme.fontSize.semiSmall1, marginLeft: 9,
                                fontFamily: Theme.fontFamily.light
                            }]}>Share via Social</Text>
                        </TouchableOpacity>

                    </View>
                </CardView>
                {
                    isFromSlideMenu ? (
                        <View></View>
                    ) :
                        (
                            <TouchableOpacity
                                onPress={() => props.navigation.goBack()}
                                activeOpacity={0.7}>
                                <Text style={{
                                    padding: 15, fontSize: Theme.fontSize.semiSmall,
                                    textDecorationLine: 'underline',
                                    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.5
                                }}>Skip and invite later</Text>
                            </TouchableOpacity>
                        )
                }

            </View>
        </SafeAreaView >
    )
}

export default shareView

shareView['navigationOptions'] = screenProps => ({
    header: null
})
