import React, { useState, useEffect, useMemo } from 'react';
import {
    Dimensions, SafeAreaView, View, Platform, Keyboard, Linking,
    Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Theme from '../../theme/theme'
import styContainer from '../../styles/commonStyle';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import AppConstants from '../../module/constantVairable';
import { NavigationActions, StackActions } from 'react-navigation';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey, removeAllDataFromCache } from '../../module/cacheData';
import Share from 'react-native-share';
import { EventRegister } from 'react-native-event-listeners'
import { syncUserWithServer, getConfigurationData, deRegisterPushTokenId, CALL_API, Reload_API_Alert, getCurrentUserData, saveCurrentUserData, calulcateAge, ISLIVE } from '../../api/api';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import CodePush from "react-native-code-push";
import Icon from 'react-native-vector-icons/dist/FontAwesome';
var currentUser = {}
var serverConfig = {}

const drawerContentView = (props) => {

    const [currentUserProfilePic, setcurrentUserProfilePic] = useState(currentUser.user_profile_photo);
    const [cp_label, setcp_label] = useState("")
    const [cp_version, setcp_version] = useState("")
    const [cp_description, setcp_description] = useState("")
    const [selectedItemIdx, setselectedItemIdx] = useState(0)
    const [isRaisingFundEnabled, setisRaisingFundEnabled] = useState(true)
    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()
    let reloadProfileListener;
    let navigateToProfileListener;
    let drawerNotificationNavigationListener;
    let navigateToMyMissionaryListener;
    let navigateToMyMissionaryProfileListener;
    let navigateToViewMissionaryListener;
    let performLogoutListener;
    let forceMissionarySelectionListener;


    useEffect(() => {
        return () => {
            EventRegister.removeEventListener(reloadProfileListener)
            EventRegister.removeEventListener(drawerNotificationNavigationListener)
            EventRegister.removeEventListener(navigateToMyMissionaryListener)
            EventRegister.removeEventListener(navigateToProfileListener)
            EventRegister.removeEventListener(navigateToMyMissionaryProfileListener)
            EventRegister.removeEventListener(navigateToViewMissionaryListener)
            EventRegister.removeEventListener(performLogoutListener)
        }
    }, [])

    useMemo(() => {
        checkEnableShareButtonStatus()
        reloadProfileListener = EventRegister.addEventListener('reloadProfileListener', (data) => {
            checkEnableShareButtonStatus()
            updateProfilePic()
        })

        navigateToProfileListener = EventRegister.addEventListener('navigateToProfileListener', (data) => {
            btnSideMenuItemClicked('sp_profile')
        })

        drawerNotificationNavigationListener = EventRegister.addEventListener('drawerNotificationNavigationListener', (data) => {
            EventRegister.emit("resetAppBadgeListener")
            if (data.eventType == "new_post") {
                if (currentUser.user_type == "sponsor") {
                    btnSideMenuItemClicked('sp_dashboard_activity_feed')
                }
            }
            else if (data.eventType == "missionary_selected") {
                if (currentUser.user_type == "missionary") {
                    btnSideMenuItemClicked('missionary_sponsor')
                }
            }
            else if (data.eventType == "dontation_received") {
                if (currentUser.user_type == "missionary") {
                    btnSideMenuItemClicked('dashboard')
                }
            }
            else if (data.eventType == "missionary_raising_paused") {
                if (currentUser.user_type == "sponsor") {
                    btnSideMenuItemClicked('dashboard')
                }
            }
        })

        navigateToMyMissionaryListener = EventRegister.addEventListener('navigateToMyMissionaryListener', (data) => {
            btnSideMenuItemClicked('sp_my_missionary')
        })

        navigateToMyMissionaryProfileListener = EventRegister.addEventListener('navigateToMyMissionaryProfileListener', (data) => {
            btnSideMenuItemClicked('missionary_my_profile')
        })

        navigateToViewMissionaryListener = EventRegister.addEventListener('navigateToViewMissionaryListener', (data) => {
            btnSideMenuItemClicked('sp_view_missionary', data)
        })


        performLogoutListener = EventRegister.addEventListener('performLogoutListener', (data) => {
            logoutUser()
        })

        forceMissionarySelectionListener = EventRegister.addEventListener('forceMissionarySelectionListener', (data) => {
            props.navigation.navigate("missionarySelectionListView1");
        })
    }, []);


    function updateProfilePic() {
        currentUser = getCurrentUserData()
        setcurrentUserProfilePic(currentUser.profile_picture)
    }

    function checkEnableShareButtonStatus() {
        currentUser = getCurrentUserData()
        if (currentUser.user_type == "missionary") {
            if (currentUser.is_rounding_up_paused == 1) {
                setisRaisingFundEnabled(false)
            }
            else {
                setisRaisingFundEnabled(true)
            }
        }
    }

    function updateProfileClicked() {
        checkForUpdate()
        setselectedItemIdx(-2)
        props.navigation.toggleDrawer()
        let resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
                routeName: "updateProfileView",
                params: { is_from_menu: true }
            })],
        });
        props.navigation.dispatch(resetAction);
    }

    function btnSideMenuItemClicked(val, customData = {}) {
        checkForUpdate()
        if (val == "dashboard") {
            setselectedItemIdx(0)
            let route_name = "missionaryDashboardView"

            if (currentUser.user_type == "sponsor") {
                route_name = "sponsarDashboardView"
                let objFirbaseEvent = {
                    eventTitle: "side_menu_clicked",
                    eventObject: {
                        button: "Sponsor_Dashboard"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
            }
            else {
                let objFirbaseEvent = {
                    eventTitle: "side_menu_clicked",
                    eventObject: {
                        button: "Missionary_Dashboard"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
            }

            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: route_name })],
            });
            props.navigation.dispatch(resetAction);
        }
        else if (val == "dashboard_missionary_feed") {
            setselectedItemIdx(1)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "missionaryDashboardView" })],
            });
            props.navigation.dispatch(resetAction);
            setTimeout(() => {
                EventRegister.emit("navigateToFeedListener")
            }, 100);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "My_Mission_Feed"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "missionary_my_profile") {
            setselectedItemIdx(3)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "missionaryProfileView" })],
            });
            props.navigation.dispatch(resetAction);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Missionary_Profile"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "about_us") {

            if (currentUser.user_type == "sponsor") {
                setselectedItemIdx(10)
            }
            else {
                setselectedItemIdx(2)
            }

            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "aboutUsView" })],
            });
            props.navigation.dispatch(resetAction);

            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "About_Us"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        }
        else if (val == "settings") {
            if (currentUser.user_type == "sponsor") {
                setselectedItemIdx(6)
            }
            else {
                setselectedItemIdx(4)
            }

            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "settingsView" })],
            });
            props.navigation.dispatch(resetAction);

            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Setting"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        }
        else if (val == "sp_my_missionary") {
            setselectedItemIdx(3)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: "sponsarMyMissionaryView",
                    params: customData
                })],
            });
            props.navigation.dispatch(resetAction);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Sponsor_Missionary_List"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "sp_dashboard_activity_feed") {
            setselectedItemIdx(1)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "sponsarDashboardView" })],
            });
            props.navigation.dispatch(resetAction);
            setTimeout(() => {
                EventRegister.emit("navigateToFeedListener")
            }, 100);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Sponsor_Missionary_Feed"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "sp_view_missionary") {
            setselectedItemIdx(4)
            let branchClickMissionaryId = false
            if (customData.branch_missionary_id) {
                branchClickMissionaryId = customData.branch_missionary_id
            }
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: "missionarySelectionListView2",
                    params: { is_update: true, is_from_menu: true, branch_missionary_id: branchClickMissionaryId }
                })],
            });
            props.navigation.dispatch(resetAction);
            // _this.props.navigation.navigate("missionarySelectionListView2", {
            //     is_update: true
            // })
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Sponsor_Missionary_Selection_View"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "sp_profile") {
            setselectedItemIdx(5)

            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "sponsorProfileView" })],
            });
            props.navigation.dispatch(resetAction);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Sponsor_Profile"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "missionary_sponsor") {
            setselectedItemIdx(6)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "missionarySponsorView" })],
            });
            props.navigation.dispatch(resetAction);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Missionary_Selection_View"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "app_share") {
            setselectedItemIdx(11)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: "shareView",
                    params: { is_from_menu: true }
                })],
            });
            props.navigation.dispatch(resetAction);
            // let objFirbaseEvent = {
            //     eventTitle: "side_menu_clicked",
            //     eventObject: {
            //         button: "App_Share"
            //     }
            // }
            // EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "admin_functions") {
            setselectedItemIdx(15)
            props.navigation.toggleDrawer()
            let resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: "adminHomeView",
                    params: { is_from_menu: true }
                })],
            });
            props.navigation.dispatch(resetAction);
            let objFirbaseEvent = {
                eventTitle: "side_menu_clicked",
                eventObject: {
                    button: "Admin_Functions"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else if (val == "logout") {
            Alert.alert("Are you sure you want to logout?", null, [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: () => { logoutUser() } },
            ], { cancelable: true })
        }
    }

    function oneTimeDonationClicked() {
        checkForUpdate()
        setselectedItemIdx(-2)
        props.navigation.toggleDrawer()
        let resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "oneTimeDonationView" })],
        });
        props.navigation.dispatch(resetAction);
    }

    function logoutUser() {
        let objFirbaseEvent = {
            eventTitle: "side_menu_clicked",
            eventObject: {
                button: "Logout"
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        deRegisterPushTokenId()
        setTimeout(() => {
            removeAllDataFromCache()
            setTimeout(() => {
                props.navigation.navigate("landingScreen")
            }, 500)
        }, 100)
    }

    function checkForUpdate() {
        var codePushDeploymentKey = ""
        if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_Android) {
            codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_DEV_Android //Staging
        }
        else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_iOS) {
            codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_DEV_iOS //Staging
        }
        else if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_Android) {
            codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_LIVE_Android //LIVE
        }
        else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_iOS) {
            codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_LIVE_iOS //LIVE
        }

        CodePush.sync({ deploymentKey: codePushDeploymentKey, installMode: CodePush.InstallMode.IMMEDIATE });
    }



    return (
        <SafeAreaView style={[styContainer.windowContainer, { backgroundColor: '#E3E6EE', }]}>
            <View style={{ justifyContent: 'space-between', alignItems: 'center', height: RFValue(100), width: '100%', backgroundColor: '#E3E6EE', flexDirection: 'row' }}>

                <View style={{ flex: 1, marginLeft: 20, marginTop: 0, flexDirection: 'row', alignItems: 'center' }}>
                    <FastImage
                        source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.user_profile_photo }}
                        style={{ borderRadius: RFValue(30), height: RFValue(60), width: RFValue(60), backgroundColor: 'gray' }}>
                    </FastImage>
                    <Text style={{ flex: 1, marginLeft: 5, marginRight: 5, fontSize: Theme.fontSize.small, fontFamily: Theme.fontFamily.regular }}>{currentUser.display_name}</Text>
                </View>
                <View style={{ marginRight: 0, marginTop: 13 }}>
                    <TouchableOpacity
                        onPress={() => updateProfileClicked()}
                        style={{ justifyContent: 'center', alignItems: 'center', height: RFValue(40), width: RFValue(45), }}>
                        <Icon size={RFValue(16)} name="pencil" />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => btnSideMenuItemClicked("dashboard")}
                        style={selectedItemIdx == 0 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                        <Image resizeMode="contain" style={[selectedItemIdx == 0 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon]}
                            source={Theme.icons.ic_home}></Image>
                        <Text style={selectedItemIdx == 0 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => btnSideMenuItemClicked(currentUser.user_type == "sponsor" ? 'sp_dashboard_activity_feed' : 'dashboard_missionary_feed')}
                        style={selectedItemIdx == 1 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                        <Image resizeMode="contain" style={[selectedItemIdx == 1 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon]}
                            source={Theme.icons.ic_news_feed}></Image>
                        <Text style={selectedItemIdx == 1 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{currentUser.user_type == "sponsor" ? 'Activity Feed' : 'My Mission Feed'}</Text>
                    </TouchableOpacity>

                    {
                        currentUser.user_type == "missionary" ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('missionary_sponsor')}
                                style={selectedItemIdx == 6 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 6 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_help_hand}></Image>
                                <Text style={selectedItemIdx == 6 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'My Sponsors'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View></View>
                        )
                    }

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => btnSideMenuItemClicked(currentUser.user_type == "sponsor" ? 'sp_my_missionary' : 'missionary_my_profile')}
                        style={selectedItemIdx == 3 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                        <Image resizeMode="contain"
                            style={selectedItemIdx == 3 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                            source={currentUser.user_type == "sponsor" ? Theme.icons.ic_read_book : Theme.icons.ic_user}></Image>
                        <Text style={selectedItemIdx == 3 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{currentUser.user_type == "sponsor" ? 'My Missionary' : 'My Profile'}</Text>
                    </TouchableOpacity>
                    {
                        currentUser.user_type == "sponsor" ? (
                            <View>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => btnSideMenuItemClicked('sp_view_missionary')}
                                    style={selectedItemIdx == 4 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                    <Image resizeMode="contain" style={selectedItemIdx == 4 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                        source={Theme.icons.ic_list}></Image>
                                    <Text style={selectedItemIdx == 4 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'View Missionary'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => btnSideMenuItemClicked('sp_profile')}
                                    style={selectedItemIdx == 5 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                    <Image resizeMode="contain" style={selectedItemIdx == 5 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                        source={Theme.icons.ic_user}></Image>
                                    <Text style={selectedItemIdx == 5 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'My Profile'}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View></View>
                        )
                    }
                    {
                        currentUser.user_type == "sponsor" ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('about_us')}
                                style={selectedItemIdx == 10 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 10 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_about_us}></Image>
                                <Text style={selectedItemIdx == 10 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'About Us'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('about_us')}
                                style={selectedItemIdx == 2 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 2 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_about_us}></Image>
                                <Text style={selectedItemIdx == 2 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'About Us'}</Text>
                            </TouchableOpacity>
                        )
                    }

                    {
                        currentUser.user_type == "sponsor" ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('settings')}
                                style={selectedItemIdx == 6 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 6 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_settings}></Image>
                                <Text style={selectedItemIdx == 6 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'Settings'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('settings')}
                                style={selectedItemIdx == 4 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 4 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_settings}></Image>
                                <Text style={selectedItemIdx == 4 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'Settings'}</Text>
                            </TouchableOpacity>
                        )
                    }

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL("mailto:" + serverConfig.support_email + "?subject=&body=")}
                        style={selectedItemIdx == -1 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                        <Image resizeMode="contain" style={selectedItemIdx == -1 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                            source={Theme.icons.ic_phone}></Image>
                        <Text style={selectedItemIdx == -1 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'Contact Us'}</Text>
                    </TouchableOpacity>
                    {
                        currentUser.user_type == "missionary" && isRaisingFundEnabled ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('app_share')}
                                style={selectedItemIdx == 11 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 11 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_share}></Image>
                                <Text style={selectedItemIdx == 11 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'Share'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View></View>
                        )
                    }

                    {
                        currentUser.is_admin ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => btnSideMenuItemClicked('admin_functions')}
                                style={selectedItemIdx == 15 ? styContainer.sideMenuItemSelected : styContainer.sideMenuItem}>
                                <Image resizeMode="contain" style={selectedItemIdx == 15 ? styContainer.sideMenuItemIconSelected : styContainer.sideMenuItemIcon}
                                    source={Theme.icons.ic_admin}></Image>
                                <Text style={selectedItemIdx == 15 ? styContainer.sideMenuItemTextSelected : styContainer.sideMenuItemText}>{'Admin Functions'}</Text>
                            </TouchableOpacity>
                        ) :
                            (
                                <View></View>
                            )
                    }


                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => btnSideMenuItemClicked("logout")}
                        style={styContainer.sideMenuItem}>
                        <Image resizeMode="contain" style={styContainer.sideMenuItemIcon}
                            source={Theme.icons.ic_logout}></Image>
                        <Text style={styContainer.sideMenuItemText}>Logout</Text>
                    </TouchableOpacity>

                </View>
                <View style={{ height: 30 }}></View>
            </ScrollView>

            {
                currentUser.user_type == "sponsor" ? (
                    <TouchableOpacity
                        onPress={() => oneTimeDonationClicked()}
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: Theme.colors.sendMeBlue,
                            flexDirection: 'row',
                            width: '100%', height: RFValue(40), alignItems: 'center'
                        }}>
                        <Image
                            style={{ marginLeft: RFValue(15), height: RFValue(22), width: RFValue(22), tintColor: 'white' }}
                            source={Theme.icons.ic_donation}></Image>
                        <Text style={[styContainer.sideMenuItemText, { color: 'white' }]}>One-Time Gift</Text>
                    </TouchableOpacity>
                ) : (
                    <View></View>
                )

            }




        </SafeAreaView>
    )
}

export default drawerContentView

drawerContentView['navigationOptions'] = screenProps => ({
    header: null
})
