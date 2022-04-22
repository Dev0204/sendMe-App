import React, { Component, useEffect, useState } from 'react';
import {
    Dimensions, FlatList, SectionList, ScrollView,
    SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage,
    TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet,
    TextComponent, Modal, ActivityIndicator
} from 'react-native';

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
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import FastImage from 'react-native-fast-image';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, currencyFormat, ISLIVE } from '../../api/api';

const missionarySponsorsView = (props) => {

    const currentUser = getCurrentUserData()
    const serverConfig = getConfigurationData()
    const [arrFeed, setarrFeed] = useState([])
    const [isFeedLoading, setisFeedLoading] = useState(false)
    const [addPostAnimation, setaddPostAnimation] = useState("fadeInDown")
    const [isImagePickerVisible, setisImagePickerVisible] = useState(false)
    const [avatarSource, setavatarSource] = useState("")
    const [isAvatarChanged, setisAvatarChanged] = useState(false)
    const [txtFeedTitle, settxtFeedTitle] = useState("")
    const [txtFeedDesc, settxtFeedDesc] = useState("")
    const [isUploadingFeed, setisUploadingFeed] = useState(false)
    const [isMenuOptionVisible, setisMenuOptionVisible] = useState(false)
    const [optionSelectedItem, setoptionSelectedItem] = useState(false)
    const [isEditingPost, setisEditingPost] = useState(false)
    const [totalDonation, settotalDonation] = useState(0)

    useEffect(() => {
        getAllSponsor()
    }, [])

    function getAllSponsor() {
        setisFeedLoading(true)
        CALL_API("getAllSponsor").then((res) => {
            console.log(res)
            setisFeedLoading(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        getAllSponsor()
                    }
                })
                return
            }
            if (res.status == 1) {
                setarrFeed(res.data)
                settotalDonation(res.total_donation)
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

    function renderFeedItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginTop: 15 }}>
                <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row' }}>

                    <FastImage
                        source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + item.user_profile_photo }}
                        style={{ backgroundColor: 'gray', height: RFValue(70), width: RFValue(70) }}>

                    </FastImage>
                    <View style={{ flex: 1, marginLeft: 10, alignSelf: 'center' }}>
                        <Text style={{ letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>{item.display_name}</Text>
                        <Text style={{
                            color: Theme.colors.sendMeGray, marginTop: 3, letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.semiSmall1
                        }}>{item.email}</Text>
                        <Text style={{
                            color: Theme.colors.sendMeGray, marginTop: 3, letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.semiSmall1
                        }}>{"Total Gift: $" + currencyFormat(item.total_donation)}</Text>
                    </View>
                </View>
            </CardView>
        )
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
                <Text style={styContainer.pageTitleText}>My Sponsors</Text>
                {
                    isFeedLoading ? (
                        <Text style={{
                            marginTop: 10,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.small
                        }}>Loading...</Text>
                    ) : (
                        <View></View>
                    )
                }

                {
                    isFeedLoading ? (
                        <View></View>
                    ) : (
                        <View style={{ width: '90%', marginTop: 15 }}>
                            <Text style={{
                                fontFamily: Theme.fontFamily.medium,
                                fontSize: Theme.fontSize.semiRegular
                            }}>
                                <Text>Current Sponsors: </Text>
                                <Text style={{
                                    fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semiRegular
                                }}>{arrFeed.length}</Text>
                            </Text>

                            <Text style={{
                                fontFamily: Theme.fontFamily.medium,
                                fontSize: Theme.fontSize.semiRegular,
                                marginTop: 5
                            }}>
                                <Text>Total Gifts: </Text>
                                <Text style={{
                                    fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semiRegular
                                }}>{"$" + currencyFormat(totalDonation)}</Text>
                            </Text>
                        </View>
                    )
                }


                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
                    style={{ width: '100%', flex: 1, marginTop: 5 }}
                    data={arrFeed}
                    renderItem={renderFeedItem}
                    keyExtractor={(item, index) => index}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    )
}

export default missionarySponsorsView

missionarySponsorsView['navigationOptions'] = screenProps => ({
    header: null
})

