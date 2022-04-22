import React, { useEffect, useState } from 'react';
import {
    Dimensions, FlatList, SectionList, Linking,
    ScrollView, SafeAreaView, View, Platform, Keyboard, Alert,
    AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity,
    StatusBar, StyleSheet, TextComponent, Modal, ActivityIndicator
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
import moment from 'moment';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { CALL_API, getCurrentUserData, getConfigurationData, Reload_API_Alert, checkPayoutStatus } from '../../api/api';
import FastImage from 'react-native-fast-image';

import { EventRegister } from 'react-native-event-listeners'
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey } from '../../module/cacheData';

var _this = null
var currentUser = {}
var serverConfig = {}

const adminHomeView = (props) => {

    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()
    const [selectedTab, setselectedTab] = useState(0)
    const [objReport, setobjReport] = useState(false)
    const [isGettingEmail, setisGettingEmail] = useState(false)

    useEffect(() => {
        currentUser = getCurrentUserData()
        getReportData()
    }, [])


    function getReportData() {
        CALL_API("admin_GetReports").then((res) => {
            if (res) {
                if (res.status == 1) {
                    setobjReport(res.data)
                }
            }
        })
    }

    function btnAllMissionariesClicked() {
        props.navigation.navigate("adminAllMissionaryListView")
    }

    function btnManageCouponCodeClicked() {
        props.navigation.navigate("couponListView")
    }

    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    function btnEmailExportClicked() {
        setisGettingEmail(true)

        CALL_API("adminGetAllEmail").then((res) => {
            setisGettingEmail(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnEmailExportClicked()
                    }
                })
                return
            }
            if (res.status == 1) {
                console.log(res.data)
                let strEmail = ""
                res.data.forEach(element => {
                    strEmail = strEmail + element.email + "\n"
                });
                setTimeout(() => {
                    let date = moment(new Date()).format("MM/DD/YYYY")
                    date = "sendMe all emails as on date '" + date + "'"
                    Linking.openURL("mailto:?subject=" + date + "&body=" + strEmail)
                }, 50);
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
            <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
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

                <Text style={styContainer.pageTitleText}>Admin Functions</Text>
                <CardView cardElevation={2} style={{ width: '90%' }}>
                    <TouchableOpacity
                        onPress={() => btnAllMissionariesClicked()}
                        activeOpacity={0.7} style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={{ marginLeft: 10, letterSpacing: 0.4, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular }}>{"All Missionaries"}</Text>
                        <View>
                            <Image resizeMode="contain" style={{ height: RFValue(13), width: RFValue(13), marginRight: 10 }} source={Theme.icons.ic_right_arrow}></Image>
                        </View>
                    </TouchableOpacity>
                </CardView>
                <CardView cardElevation={2} style={{ width: '90%' }}>
                    <TouchableOpacity
                        onPress={() => btnManageCouponCodeClicked()}
                        activeOpacity={0.7} style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={{ marginLeft: 10, letterSpacing: 0.4, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular }}>{"Manage Coupons"}</Text>
                        <View>
                            <Image resizeMode="contain" style={{ height: RFValue(13), width: RFValue(13), marginRight: 10 }} source={Theme.icons.ic_right_arrow}></Image>
                        </View>
                    </TouchableOpacity>
                </CardView>
                <CardView cardElevation={2} style={{ width: '90%', marginTop: 0 }}>
                    {
                        isGettingEmail ? (
                            <TouchableOpacity
                                activeOpacity={1} style={{
                                    paddingTop: 10.6, paddingBottom: 10.6,
                                    backgroundColor: 'white', alignItems: 'center',
                                    marginTop: 20, width: '100%'
                                }}>
                                <ActivityIndicator style={{ alignSelf: 'center' }} />

                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => btnEmailExportClicked()}
                                activeOpacity={0.7} style={{
                                    paddingTop: 10, paddingBottom: 10,
                                    backgroundColor: 'white', alignItems: 'center',
                                    flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%'
                                }}>
                                <Text style={{
                                    marginLeft: 10, letterSpacing: 0.4,
                                    fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semiRegular
                                }}>{"Export Email"}</Text>
                                <View>
                                    <Image resizeMode="contain" style={{
                                        height: RFValue(13),
                                        width: RFValue(13), marginRight: 10
                                    }} source={Theme.icons.ic_right_arrow}></Image>
                                </View>
                            </TouchableOpacity>
                        )
                    }

                </CardView>
                <Text style={[styContainer.pageTitleText, { marginTop: 30 }]}>{objReport ? 'Reports' : 'Loading Reports'}</Text>
                {
                    objReport ? (
                        <CardView cardElevation={2} style={{ width: '90%', marginTop: 10 }}>
                            <View style={{ width: '100%', backgroundColor: 'white' }}>
                                <View style={{ padding: 10 }}>
                                    <Text style={{ fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular }}>
                                        <Text>
                                            {"Total Gift: "}
                                        </Text>
                                        <Text style={{ fontFamily: Theme.fontFamily.medium }}>
                                            {"$" + objReport.total_donation}
                                        </Text>
                                    </Text>
                                    <Text style={{ marginTop: 10, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular }}>
                                        <Text>
                                            {"Total Missionary: "}
                                        </Text>
                                        <Text style={{ fontFamily: Theme.fontFamily.medium }}>
                                            {objReport.missionary_profile_with_bank_added}
                                        </Text>
                                    </Text>
                                    <Text style={{ marginTop: 10, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular }}>
                                        <Text>
                                            {"Avg. Sponsors Per Missionary: "}
                                        </Text>
                                        <Text style={{ fontFamily: Theme.fontFamily.medium }}>
                                            {objReport.avg_sponsors_per_missionary}
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        </CardView>
                    ) : (
                        <View></View>
                    )
                }
                {/* <Text style={[styContainer.pageTitleText, { marginTop: 30 }]}>Export Email</Text> */}


            </View>


        </SafeAreaView >
    )
}

export default adminHomeView

adminHomeView['navigationOptions'] = screenProps => ({
    header: null
})
