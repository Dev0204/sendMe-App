import React, { useEffect, useState } from 'react';
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
import moment from 'moment';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { CALL_API, getCurrentUserData, getConfigurationData, Reload_API_Alert, checkPayoutStatus, syncUserWithServer, currencyFormat, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import MissionaryFeedView from './missionaryFeedView'

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

const missionaryDashboardView = (props) => {

    const [selectedTab, setselectedTab] = useState(0)
    const [firstName, setfirstName] = useState("")
    const [lastName, setlastName] = useState("")
    const [missionLocation, setmissionLocation] = useState("")
    const [missionDetails, setmissionDetails] = useState("")
    const [missionGoal, setmissionGoal] = useState("")
    const [arrTransactions, setarrTransactions] = useState([])
    const [isTransactionLoading, setisTransactionLoading] = useState(false)
    const [totalCollection, settotalCollection] = useState(0)
    const [progressAmountMarginRight, setprogressAmountMarginRight] = useState(0)
    const [missionaryGoal, setmissionaryGoal] = useState(0)
    const [isMenuOpen, setisMenuOpen] = useState(false)
    const [selectedFilterType, setselectedFilterType] = useState(0)
    const [isRaisingFundEnabled, setisRaisingFundEnabled] = useState(true)
    const [isPullToRefreshing, setisPullToRefreshing] = useState(false)
    const currentUser = getCurrentUserData()
    const serverConfig = getConfigurationData()

    useEffect(() => {
        syncUserWithServer().then((res) => {
            if (res) {
                currentUser = getCurrentUserData()
                EventRegister.emit("firebaseSetUserPropertiesListener", {})
                getDataFromCachedWithKey("payout_reminder").then((res) => {
                    if (!res) {
                        checkPayoutStatus().then((res) => {
                            if (!res) {
                                Alert.alert("Payout is disabled", "Please provide necessary information to enable payout.", [
                                    {
                                        text: "Remind Me Later",
                                        onPress: () => {
                                            saveDataToCachedWithKey("payout_reminder", "yes")
                                        }
                                    },
                                    {
                                        text: "Proceed",
                                        onPress: () => {
                                            setTimeout(() => {
                                                saveDataToCachedWithKey("payout_reminder", "yes")
                                                getStripeLoginLink()
                                            }, 100);
                                        }
                                    }

                                ])
                            }
                        })
                    }
                })


                if (currentUser.is_rounding_up_paused == 0) {
                    setisRaisingFundEnabled(true)
                    getTransactions()
                }
                else {
                    setisRaisingFundEnabled(false)
                }

                // removeDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strInviteContact)
                getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strInviteContact).then((res) => {
                    if (!res) {
                        saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strInviteContact, "Yes")
                        props.navigation.navigate("shareView")
                    }
                })
            }
        })
        const navigateToFeedListener = EventRegister.addEventListener('navigateToFeedListener', (data) => {
            setselectedTab(1)
            // this.getActivityFeed()
        })

        return () => {
            EventRegister.removeEventListener(navigateToFeedListener)
        }
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

                console.log(res.data.url)
                props.navigation.navigate("commonWebView", {
                    txt_title: "Bank Details",
                    url: res.data.url
                })

            }
        })
    }



    function onPullToRefresh() {
        setisPullToRefreshing(true)
        getTransactions()
    }

    function getTransactions() {
        setisTransactionLoading(true)
        let type = "";
        if (selectedFilterType == 0) {
            type = "month"
        }
        else if (selectedFilterType == 1) {
            type = "all"
        }
        else if (selectedFilterType == 2) {
            type = "week"
        }
        else if (selectedFilterType == 3) {
            type = "year"
        }
        let param = {
            filterType: type,
            user_time_zone: serverConfig.time_zone
        }

        CALL_API("getReceivedTransactions", param).then((res) => {
            setisTransactionLoading(false)
            setisPullToRefreshing(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        getTransactions()
                    }
                })
                return
            }

            if (res.status == 1) {
                let arrT = []
                let totalCollection = 0
                res.data.transactions.forEach(element => {
                    let roundUp = parseFloat(element.amount)
                    totalCollection = totalCollection + roundUp
                    arrT.push(element)
                });
                console.log("totalCollection => " + totalCollection)
                let totalRightMargin = ((totalCollection * 100) / res.data.misionary_goal.missionary_goal)

                if (totalRightMargin >= 90) {
                    totalRightMargin = totalRightMargin - 13
                }
                else if (totalRightMargin >= 80) {
                    totalRightMargin = totalRightMargin - 10
                }
                else if (totalRightMargin >= 70) {
                    totalRightMargin = totalRightMargin - 8
                }
                else if (totalRightMargin >= 60) {
                    totalRightMargin = totalRightMargin - 6
                }
                else if (totalRightMargin >= 40) {
                    totalRightMargin = totalRightMargin - 5
                }
                else if (totalRightMargin >= 30) {
                    totalRightMargin = totalRightMargin - 4
                }

                totalRightMargin = totalRightMargin + "%"

                setarrTransactions(arrT);
                settotalCollection(totalCollection)
                setprogressAmountMarginRight(totalRightMargin)
                setmissionaryGoal(res.data.misionary_goal.missionary_goal)
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

    // const _updateMasterState = (attrName, value) => {
    //     this.setState({ [attrName]: value });
    // }

    function btnTabClickedAt(idx) {
        setselectedTab(idx)
        if (idx == 0) {
            getTransactions()
        }
    }

    function btnStartRaisingClicked() {
        EventRegister.emit('navigateToMyMissionaryProfileListener', '')
    }

    function renderTransactionItem({ item, index }) {
        return (

            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E7E7E7', alignSelf: 'center', alignItems: 'center', flexDirection: 'row', width: '100%' }}>
                <View style={{ marginLeft: 15, marginRight: 15, paddingTop: 15, paddingBottom: 15, flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <Text style={styContainer.transByText}>{moment(moment(item.payment_date).toDate()).format("MM/DD")}</Text>

                    <FastImage
                        source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + item.user_profile_photo }}
                        style={{ marginLeft: 5, borderRadius: RFValue(25), height: RFValue(50), width: RFValue(50), backgroundColor: 'lightgray' }}>
                    </FastImage>

                    <Text style={[styContainer.transByText, { marginLeft: 10 }]}>{item.display_name}</Text>
                </View>
                <View style={{ marginLeft: 15, marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ marginRight: 5, textAlign: 'center', color: '#2CB33B', marginBottom: 1, fontFamily: Theme.fontFamily.light, fontSize: Theme.fontSize.semiLarge }}>+</Text>
                    <Text style={styContainer.transByText}>{"$" + currencyFormat(item.amount)}</Text>
                </View>
            </View>
        )
    }

    function onFilterChange(idx) {
        setselectedFilterType(idx)
        setisMenuOpen(false)
        setTimeout(() => {
            getTransactions()
        }, 50);
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

                <Text style={styContainer.pageTitleText}>Missionary Dashboard</Text>
                {
                    isRaisingFundEnabled ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 5 }}>
                            <TouchableOpacity
                                onPress={() => btnTabClickedAt(0)}
                                activeOpacity={0.7}
                                style={{ borderBottomWidth: selectedTab == 0 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                <Text style={selectedTab == 0 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Dashboard</Text>
                            </TouchableOpacity>
                            <View style={{ width: RFValue(40) }}></View>
                            <TouchableOpacity
                                onPress={() => btnTabClickedAt(1)}
                                activeOpacity={0.7}
                                style={{ borderBottomWidth: selectedTab == 1 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                <Text style={selectedTab == 1 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Activity Feed</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View></View>
                    )
                }

                {

                    isRaisingFundEnabled ? (

                        selectedTab == 0 ? (
                            <View style={{ flex: 1, width: '95%', alignItems: 'center' }}>

                                {
                                    isMenuOpen ? (
                                        <CardView cardElevation={2} style={{ width: '90%', marginTop: 10 }}>
                                            <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                                                <TouchableOpacity
                                                    onPress={() => onFilterChange(0)}
                                                    activeOpacity={0.7}
                                                    style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                                    <Text style={{
                                                        letterSpacing: 0.4,
                                                        color: Theme.colors.sendMeBlack,
                                                        fontFamily: Theme.fontFamily.regular,
                                                        padding: 5
                                                    }}>This Month</Text>
                                                    {selectedFilterType == 0 ? (
                                                        <Image style={{
                                                            tintColor: 'green',
                                                            height: 15, width: 15, marginLeft: 0
                                                        }} source={Theme.icons.ic_correct}></Image>
                                                    ) : (
                                                        <View></View>
                                                    )
                                                    }

                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => onFilterChange(2)}
                                                    activeOpacity={0.7}
                                                    style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                                    <Text style={{
                                                        letterSpacing: 0.4,
                                                        color: Theme.colors.sendMeBlack,
                                                        fontFamily: Theme.fontFamily.regular,
                                                        padding: 5
                                                    }}>This Week</Text>
                                                    {
                                                        selectedFilterType == 2 ? (
                                                            <Image style={{
                                                                tintColor: 'green',
                                                                height: 15, width: 15, marginLeft: 0
                                                            }} source={Theme.icons.ic_correct}></Image>
                                                        ) : (
                                                            <View></View>
                                                        )
                                                    }
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => onFilterChange(3)}
                                                    activeOpacity={0.7}
                                                    style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                                    <Text style={{
                                                        letterSpacing: 0.4,
                                                        color: Theme.colors.sendMeBlack,
                                                        fontFamily: Theme.fontFamily.regular,
                                                        padding: 5
                                                    }}>This Year</Text>
                                                    {
                                                        selectedFilterType == 3 ? (
                                                            <Image style={{
                                                                tintColor: 'green',
                                                                height: 15, width: 15, marginLeft: 0
                                                            }} source={Theme.icons.ic_correct}></Image>
                                                        ) : (
                                                            <View></View>
                                                        )
                                                    }
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => onFilterChange(1)}
                                                    activeOpacity={0.7}
                                                    style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                                    <Text style={{
                                                        letterSpacing: 0.4,
                                                        color: Theme.colors.sendMeBlack,
                                                        fontFamily: Theme.fontFamily.regular,
                                                        padding: 5
                                                    }}>All Time</Text>
                                                    {
                                                        selectedFilterType == 1 ? (
                                                            <Image style={{
                                                                tintColor: 'green',
                                                                height: 15, width: 15, marginLeft: 0
                                                            }} source={Theme.icons.ic_correct}></Image>
                                                        ) : (
                                                            <View></View>
                                                        )
                                                    }
                                                </TouchableOpacity>

                                            </View>
                                        </CardView>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => setisMenuOpen(true)}
                                            activeOpacity={0.7}
                                            style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                            <Text style={{
                                                letterSpacing: 0.4,
                                                color: Theme.colors.sendMeBlack,
                                                fontFamily: Theme.fontFamily.regular,
                                                padding: 5
                                            }}>
                                                {
                                                    selectedFilterType == 0 ? (
                                                        <Text>This Month</Text>
                                                    ) : (
                                                        selectedFilterType == 1 ? (
                                                            <Text>All Time</Text>
                                                        ) : (
                                                            selectedFilterType == 2 ? (
                                                                <Text>This Week</Text>
                                                            ) : (
                                                                <Text>This Year</Text>
                                                            )
                                                        )
                                                    )
                                                }
                                            </Text>
                                            <Image style={{
                                                tintColor: Theme.colors.sendMeBlack,
                                                height: 13, width: 13, marginLeft: 0
                                            }} source={Theme.icons.ic_drop_down}></Image>
                                        </TouchableOpacity>
                                    )
                                }
                                <CardView cardElevation={2} style={{ width: '90%', marginTop: 10 }}>
                                    <View style={{ backgroundColor: 'white', alignItems: 'center' }}>

                                        <View style={{ flexDirection: 'row', width: Dimensions.get('window').width - 80, justifyContent: 'space-between', marginTop: 5 }}>
                                            <Text style={styContainer.goalText}>$0</Text>

                                            <Text style={styContainer.goalText}>{missionaryGoal == 0 ? '' : ("$" + currencyFormat(missionaryGoal))}</Text>
                                        </View>
                                        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
                                            <Progress.Bar progress={totalCollection > 0 ? (((totalCollection * 100) / missionaryGoal) / 100) : 0} borderRadius={30} height={15} width={Dimensions.get('window').width - 80}
                                                color={Theme.colors.sendMeBlue}
                                                unfilledColor={"#F4F4F4"}
                                                borderColor={"#E7E7E7"} borderWidth={1} />
                                        </View>
                                        {
                                            totalCollection > 0 ? (
                                                <View style={{ position: 'absolute', bottom: 0, left: progressAmountMarginRight }}>
                                                    <Text style={[styContainer.goalText, { fontSize: Theme.fontSize.semi_Small }]}>{progressAmountMarginRight == "0%" ? '' : ("$" + currencyFormat(totalCollection))}</Text>
                                                </View>
                                            ) : (<View></View>)
                                        }
                                    </View>
                                </CardView>
                                <CardView cardElevation={2} style={{ flex: 1, width: '90%', marginTop: 20 }}>
                                    <View style={{ backgroundColor: 'white', flex: 1, marginBottom: 20 }}>
                                        {
                                            arrTransactions.length == 0 ? (
                                                <View>
                                                    <Text style={{
                                                        fontFamily: Theme.fontFamily.regular,
                                                        fontSize: Theme.fontSize.small,
                                                        marginTop: 10, letterSpacing: 0.4, textAlign: 'center'
                                                    }}>{isTransactionLoading ? 'Loading transactions...' : ('No gifts yet!')}</Text>
                                                    {
                                                        arrTransactions.length == 0 && !isTransactionLoading ? (
                                                            <View>
                                                                <TouchableOpacity
                                                                    onPress={() => getTransactions()}
                                                                    activeOpacity={0.7} style={{ alignSelf: 'center', padding: 7, marginTop: 5 }}>
                                                                    <Image
                                                                        style={{ height: 30, width: 30, }}
                                                                        source={Theme.icons.ic_reload}>

                                                                    </Image>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <View></View>
                                                        )
                                                    }
                                                </View>
                                            ) : (
                                                <FlatList keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ paddingBottom: 10 }} style={{ width: '100%', flex: 1 }}
                                                    data={arrTransactions}
                                                    renderItem={renderTransactionItem}
                                                    keyExtractor={(item, index) => index}
                                                    showsHorizontalScrollIndicator={false}
                                                    showsVerticalScrollIndicator={false}
                                                    refreshing={state.isPullToRefreshing}
                                                    onRefresh={() => onPullToRefresh()}
                                                />
                                            )
                                        }



                                    </View>
                                </CardView>
                            </View>
                        ) : (
                            <View style={{ width: '95%', flex: 1 }}>
                                <MissionaryFeedView />
                            </View>
                        )
                    ) : (
                        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: '15%' }}>

                            <CardView cardElevation={2} style={{ width: '90%', marginTop: 20 }}>
                                <View style={{ backgroundColor: 'white', padding: 10, }}>
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: Theme.fontSize.small,
                                            fontFamily: Theme.fontFamily.regular, letterSpacing: 0.5
                                        }}
                                    >Raising funds has been paused.</Text>
                                    <View style={{ height: 15 }}></View>
                                    <CustomButton title={"Start Again"}
                                        defineHeight={RFValue(35)}
                                        bgColor={"#28bf58"}
                                        defineFontFamily={Theme.fontFamily.regular}
                                        onButtonClicked={btnStartRaisingClicked} />
                                </View>
                            </CardView>
                        </View>
                    )
                }

                <KeyboardAccessoryView />
            </View>
        </SafeAreaView >
    )
}

export default missionaryDashboardView

missionaryDashboardView['navigationOptions'] = screenProps => ({
    header: null
})
