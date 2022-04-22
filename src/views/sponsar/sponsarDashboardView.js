import React, { Component } from 'react';
import { Dimensions, FlatList, SectionList, ScrollView, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet, TextComponent, Modal, EventEmitter } from 'react-native';

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
import FastImage from 'react-native-fast-image';
import { CALL_API, getCurrentUserData, getConfigurationData, Reload_API_Alert, syncUserWithServer, ISLIVE } from '../../api/api';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import ImageViewer from 'react-native-image-zoom-viewer';
import { EventRegister } from 'react-native-event-listeners'
import branch, { BranchEvent } from 'react-native-branch'
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey, removeAllDataFromCache } from '../../module/cacheData'

var _this = null
var currentUser = {}
let serverConfig = {}
export default class SponsarDashboardView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        this.state = {
            selectedTab: 0,
            firstName: "",
            lastName: "",
            missionLocation: "",
            missionDetails: "",
            missionGoal: "",
            arrTransactions: [],
            arrFeed: [],
            totalRoundUp: 0,
            maximumAmount: 0,
            progressAmountMarginRight: '0%',
            isTransactionLoading: false,
            lastTransactionDate: "",
            isFeedLoading: false,
            last_donate_to: false,
            arrViewerImages: [],
            isShowImageViewer: false,
            selectedImgIndx: 0,
            isRoundUpPaused: false,
            kDoRender: false,
            isMissionaryPausedRaisingFund: false,
            isPullToRefreshing: false
        }
    }

    componentDidMount() {
        if (currentUser.missionary.is_rounding_up_paused == 1) {
            this.setState({
                isMissionaryPausedRaisingFund: true
            })
        }

        _this.syncUser()

        this.navigateToFeedListener = EventRegister.addEventListener('navigateToFeedListener', (data) => {
            _this.setState({
                selectedTab: 1
            })
            _this.getActivityFeed()
        })

        this.reloadTransactionListener = EventRegister.addEventListener('reloadTransactionListener', (data) => {
            _this.setState({
                selectedTab: 0
            })
            _this.getPlaidTransaction()
        })

        setTimeout(() => {
            _this.checkBranchLinkClicked()
        }, 1000 * 4);

    }



    syncUser() {
        syncUserWithServer().then((res) => {
            if (res) {
                currentUser = getCurrentUserData()
                EventRegister.emit("firebaseSetUserPropertiesListener", {})
                if (currentUser.missionary.is_rounding_up_paused == 1) {
                    this.setState({
                        isMissionaryPausedRaisingFund: true,
                        kDoRender: true
                    })
                }
                else {
                    this.setState({
                        isMissionaryPausedRaisingFund: false,
                    })
                }
                this.getPlaidTransaction()

            }
        })
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.navigateToFeedListener)
        EventRegister.removeEventListener(this.reloadTransactionListener)
    }

    getPlaidTransaction() {
        if (this.state.isTransactionLoading) {
            console.log("LOADING.....")
            return
        }
        this.setState({
            isTransactionLoading: true
        })
        let param = {
            user_time_zone: serverConfig.time_zone
        }
        CALL_API("getPlaidTransaction", param).then((res) => {
            console.log(res)
            this.setState({
                isTransactionLoading: false,
                isPullToRefreshing: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.getPlaidTransaction()
                    }
                })
                return
            }

            if (res.status == 1) {
                let arrT = []
                let totalRoundUp = 0
                if (!this.state.isMissionaryPausedRaisingFund) {
                    res.data.transactions.forEach(element => {
                        let roundUp = Math.ceil(element.amount) - element.amount
                        if (roundUp != 0) {
                            totalRoundUp = totalRoundUp + roundUp
                            arrT.push(element)
                        }
                    });

                    if (res.data.spending) {
                        // let totalRightMargin = (totalRoundUp * res.data.spending.target)
                        let totalRightMargin = ((totalRoundUp * 100) / res.data.spending.target)
                        // Alert.alert(totalRightMargin + '')
                        //Alert.alert("" + totalRoundUp + " * " + res.data.spending.target)
                        let maxValue = res.data.spending.target
                        if (totalRoundUp > res.data.spending.target) {
                            maxValue = totalRoundUp.toFixed(2)
                        }
                        if (totalRightMargin > 100) {
                            totalRightMargin = 100
                        }
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

                        //Alert.alert(totalRoundUp + " - " + res.data.spending.target + " - " + totalRightMargin + "")
                        this.setState({
                            arrTransactions: arrT,
                            totalRoundUp: totalRoundUp,
                            progressAmountMarginRight: totalRightMargin,
                            maximumAmount: maxValue,
                            lastTransactionDate: res.data.spending.start_date,
                            last_donate_to: res.data.last_donation,
                            kDoRender: true
                        })
                    }
                    else {
                        _this.syncUser()
                    }


                }
                else {
                    this.setState({
                        last_donate_to: res.data.last_donation,
                        kDoRender: true
                    })
                }
            }
            else if (res.status == 2) {
                this.setState({
                    isRoundUpPaused: true
                })
            }
            else {
                if (res.is_plaid_error == 1) {
                    EventRegister.emit("navigateToProfileListener", '')
                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }
            }
        })
    }

    async checkBranchLinkClicked() {
        let missionaryId = await getDataFromCachedWithKey("branch_missionary_id")
        if (missionaryId) {
            removeDataFromCachedWithKey("branch_missionary_id")
        }
    }

    btnSideMenuClicked() {
        this.props.navigation.toggleDrawer()
    }

    btnTabClickedAt(idx) {
        this.setState({
            selectedTab: idx
        })

        if (idx == 1) {
            _this.syncUser()
            _this.getActivityFeed()
        }
        else {
            _this.getPlaidTransaction()
        }
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    getActivityFeed() {
        let param = {
            page: 1
        }
        if (this.state.arrFeed.length == 0) {
            this.setState({
                isFeedLoading: true
            })
        }
        CALL_API("getMissionaryFeedList", param, "POST").then((res) => {
            console.log(res)
            this.setState({
                isFeedLoading: false,
                isPullToRefreshing: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {

                    if (res) {
                        _this.getActivityFeed()
                    }
                })
                return
            }

            if (res.status == 1) {
                let arrImages = []
                res.data.forEach(element => {

                    let url = (ISLIVE ? serverConfig.img_feed_live_base_url : serverConfig.img_feed_dev_base_url) + "/" + element.feed_photo
                    arrImages.push({ url })
                });

                this.setState({
                    arrFeed: res.data,
                    arrViewerImages: arrImages
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }

    renderTransactionItem({ item, index }) {
        return (
            <View>
                {
                    index == 0 ? (
                        <View style={{ marginBottom: 5 }}>
                            <Text style={[styContainer.dashboardTabTitle, { marginLeft: 10, textAlign: 'left', width: '90%', fontSize: Theme.fontSize.semiSmall1, fontFamily: Theme.fontFamily.light }]}>Transactions</Text>
                            <View style={{ borderBottomWidth: 0, alignSelf: 'center', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>



                                <View style={{ marginLeft: 15, marginRight: 15, flexDirection: 'row', alignItems: 'center', width: '65%', justifyContent: 'space-between', paddingLeft: 5, paddingRight: 5 }}>

                                    <Text style={[styContainer.transByText, { color: Theme.colors.sendMeBlack, marginLeft: 9 }]}>Date</Text>
                                    <Text style={[styContainer.transByText, { color: Theme.colors.sendMeBlack, marginLeft: 5 }]}>Round Up</Text>

                                    <Text style={[styContainer.transByText, { color: Theme.colors.sendMeBlack }]}>Total </Text>
                                </View>

                                <Text style={[styContainer.transByText, { color: Theme.colors.sendMeBlack, marginRight: 10 }]}>Description</Text>

                            </View>
                        </View>
                    ) : (<View></View>)
                }
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#E7E7E7', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%', }}>

                    <View style={{ marginLeft: 15, marginRight: 15, flexDirection: 'row', alignItems: 'center', width: '65%', justifyContent: 'space-between', padding: 5 }}>
                        <Text style={[styContainer.transByText, {}]}>{moment(item.date).format("MM/DD/YY")}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ marginRight: 5, textAlign: 'center', color: '#2CB33B', marginBottom: 1, fontFamily: Theme.fontFamily.light, fontSize: Theme.fontSize.semiLarge }}>+</Text>
                            <Text style={styContainer.transByText}>{(Math.ceil(item.amount) - item.amount).toFixed(2)}</Text>
                        </View>
                        <Text style={[styContainer.transByText, {}]}>{"$" + (item.amount).toFixed(2)}</Text>
                    </View>

                    <Text numberOfLines={2} style={[styContainer.transByText, { flex: 1, marginRight: 10, marginLeft: 5, textAlign: 'right' }]}>{item.name}</Text>

                </View>
            </View>

        )
    }

    btnOnFeedItemClickedAtIdx(idx) {

        _this.setState({
            isShowImageViewer: true,
            selectedImgIndx: idx
        })
    }

    btnStartRoundUpClicked() {
        EventRegister.emit("navigateToProfileListener", '')
    }

    btnOneTimeDonationClicked() {
        _this.props.navigation.navigate("oneTimeDonationView", {
            is_pushed: true
        })
    }

    btnCloseClicked() {
        _this.setState({
            isShowImageViewer: false
        })
    }

    btnChooseMissionaryClicked() {
        EventRegister.emit("navigateToViewMissionaryListener", '')
    }

    onPullToRefresh() {
        this.setState({
            isPullToRefreshing: true
        })
        if (this.state.selectedTab == 0) {
            this.getPlaidTransaction()
        }
        else {
            this.getActivityFeed()
        }
    }

    renderFeedItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginTop: 15 }}>
                <View style={{ backgroundColor: 'white', padding: 15 }}>
                    <TouchableOpacity
                        onPress={() => _this.btnOnFeedItemClickedAtIdx(index)}
                        activeOpacity={0.7}>
                        <FastImage
                            source={{ uri: (ISLIVE ? serverConfig.img_feed_live_base_url : serverConfig.img_feed_dev_base_url) + "/" + item.feed_photo }}
                            style={{ width: '100%', backgroundColor: 'gray', height: RFValue(170) }}>

                        </FastImage>
                    </TouchableOpacity>
                    <View style={{ width: '95%', alignSelf: 'center', marginTop: 15 }}>
                        <Text style={{ letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>{item.feed_title}</Text>
                        <Text style={{ color: Theme.colors.sendMeGray, marginTop: 5, letterSpacing: 0.4, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiSmall1 }}>{item.feed_desc}</Text>
                    </View>
                    {/* <View style={{ justifyContent: 'center', alignItems: 'center', borderRadius: RFValue(15), alignSelf: 'center', top: 107, position: 'absolute', backgroundColor: Theme.colors.sendMeBlue, height: RFValue(30), width: RFValue(30) }}>
                        <Icon name="camera" color={'white'} size={10}></Icon>
                    </View> */}
                </View>
            </CardView>
        )
    }

    render() {
        return (
            <SafeAreaView style={styContainer.windowContainer}>
                <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
                <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                        <View style={styContainer.navigationCustomHeaderp}>
                            <View style={styContainer.navigationCustomHeaderq}>
                                <TouchableOpacity activeOpacity={0.7}
                                    style={styContainer.sideMenuContainerLeft}
                                    onPress={() => this.btnSideMenuClicked()}
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

                    <Text style={styContainer.pageTitleText}>Sponsor Dashboard</Text>

                    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <TouchableOpacity
                                onPress={() => this.btnTabClickedAt(0)}
                                activeOpacity={0.7}
                                style={{ borderBottomWidth: this.state.selectedTab == 0 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                <Text style={this.state.selectedTab == 0 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Dashboard</Text>
                            </TouchableOpacity>
                            {
                                this.state.isMissionaryPausedRaisingFund ? (
                                    <View></View>
                                ) : (
                                        <View style={{ marginLeft: 40 }}>

                                            <TouchableOpacity
                                                onPress={() => this.btnTabClickedAt(1)}
                                                activeOpacity={0.7}
                                                style={{ borderBottomWidth: this.state.selectedTab == 1 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                                <Text style={this.state.selectedTab == 1 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Activity Feed</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                            }


                        </View>
                        {
                            this.state.selectedTab == 0 ? (
                                this.state.isRoundUpPaused ? (
                                    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: '15%' }}>

                                        <CardView cardElevation={2} style={{ width: '90%', marginTop: 20 }}>
                                            <View style={{ backgroundColor: 'white', padding: 10, }}>
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        fontSize: Theme.fontSize.small,
                                                        fontFamily: Theme.fontFamily.regular, letterSpacing: 0.5
                                                    }}
                                                >Spare Change Round-ups have been paused.</Text>
                                                <View style={{ height: 15 }}></View>
                                                <CustomButton title={"Start Again"}
                                                    isLoading={this.state.btnShowLoading}
                                                    defineHeight={RFValue(35)}
                                                    bgColor={"#28bf58"}
                                                    defineFontFamily={Theme.fontFamily.regular}
                                                    onButtonClicked={this.btnStartRoundUpClicked} />
                                            </View>
                                        </CardView>
                                    </View>
                                ) : (
                                        <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>

                                            <CardView cardElevation={2} style={{ width: '90%', marginTop: 20 }}>
                                                {
                                                    this.state.last_donate_to ? (
                                                        <View style={{ backgroundColor: 'white', padding: 7, alignItems: 'center' }}>
                                                            <Text style={{ textAlign: 'center' }}>
                                                                <Text style={[styContainer.dashboardTabTitle, {
                                                                    fontSize: Theme.fontSize.semiSmall1, textAlign: 'center',
                                                                    color: Theme.colors.sendMeBlue
                                                                }]}>{"You have supported " + this.state.last_donate_to.display_name + ": "}</Text>
                                                                <Text style={[styContainer.amountDonate]}>{"$" + this.state.last_donate_to.donation_amount}</Text>
                                                            </Text>

                                                            {
                                                                this.state.isMissionaryPausedRaisingFund ? (
                                                                    <View></View>
                                                                ) : (
                                                                        <View style={{ marginTop: 10, width: '100%' }}>
                                                                            <CustomButton title="Add One-Time Gift"
                                                                                defineFontSize={Theme.fontSize.semiSmall1}
                                                                                defineFontFamily={Theme.fontFamily.medium}
                                                                                defineHeight={RFValue(30)}
                                                                                onButtonClicked={this.btnOneTimeDonationClicked} />
                                                                        </View>
                                                                    )
                                                            }


                                                        </View>
                                                    ) : (
                                                            <View></View>
                                                        )
                                                }

                                            </CardView>
                                            {
                                                this.state.isMissionaryPausedRaisingFund ? (
                                                    <View></View>
                                                ) : (
                                                        <CardView cardElevation={2} style={{ width: '90%', marginTop: this.state.last_donate_to ? 20 : 1 }}>
                                                            <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                                                                <Text style={[styContainer.dashboardTabTitle, { textAlign: 'left', width: '90%', fontSize: Theme.fontSize.semiSmall1, fontFamily: Theme.fontFamily.light }]}>Available Round-Ups</Text>
                                                                <View style={{ flexDirection: 'row', width: Dimensions.get('window').width - 80, justifyContent: 'space-between', marginTop: 5 }}>
                                                                    <Text style={styContainer.goalText}>$0</Text>
                                                                    {/* <Text style={[styContainer.goalText, { marginLeft: '42%', position: 'absolute' }]}>$4.75</Text> */}
                                                                    <Text style={styContainer.goalText}>{_this.state.maximumAmount == 0 ? '' : ("$" + _this.state.maximumAmount)}</Text>
                                                                </View>

                                                                <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
                                                                    <Progress.Bar progress={this.state.totalRoundUp > 0 ? (((this.state.totalRoundUp * 100) / _this.state.maximumAmount) / 100) : 0} borderRadius={30} height={15} width={Dimensions.get('window').width - 80}
                                                                        color={Theme.colors.sendMeBlue}
                                                                        unfilledColor={"#F4F4F4"}
                                                                        borderColor={"#E7E7E7"} borderWidth={1} />
                                                                </View>
                                                                {
                                                                    this.state.totalRoundUp > 0 ? (
                                                                        <View style={{ position: 'absolute', bottom: 0, left: this.state.progressAmountMarginRight }}>
                                                                            <Text style={[styContainer.goalText, { fontSize: Theme.fontSize.semi_Small }]}>{this.state.progressAmountMarginRight == "0%" ? '' : ("$" + this.state.totalRoundUp.toFixed(2))}</Text>
                                                                        </View>
                                                                    ) : (<View></View>)
                                                                }

                                                            </View>
                                                        </CardView>
                                                    )
                                            }

                                            {
                                                this.state.last_donate_to ? (
                                                    <View></View>
                                                ) : (
                                                        this.state.kDoRender ? (
                                                            this.state.isMissionaryPausedRaisingFund ? (
                                                                <View></View>
                                                            ) : (
                                                                    <View style={{ marginTop: 13, width: '100%' }}>
                                                                        <CustomButton title="Add One-Time Gift"
                                                                            defineFontSize={Theme.fontSize.semiSmall1}
                                                                            defineFontFamily={Theme.fontFamily.medium}
                                                                            defineHeight={RFValue(30)}
                                                                            onButtonClicked={this.btnOneTimeDonationClicked} />
                                                                    </View>
                                                                )

                                                        ) : (
                                                                <View></View>
                                                            )

                                                    )
                                            }
                                            <CardView cardElevation={2} style={{ flex: 1, width: '90%', marginTop: 20 }}>
                                                {
                                                    this.state.isMissionaryPausedRaisingFund ? (
                                                        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small, padding: 15 }}>
                                                                <Text style={{ fontFamily: Theme.fontFamily.medium }}>{currentUser.missionary.display_name}</Text>
                                                                <Text>{" " + AppConstants.StringLiterals.missionaryRaisingFundPaused}</Text>
                                                            </Text>
                                                            <View style={{ width: '100%' }}>
                                                                <CustomButton title="Choose Missionary"
                                                                    isLoading={this.state.btnShowLoading}
                                                                    onButtonClicked={this.btnChooseMissionaryClicked} />
                                                            </View>
                                                        </View>
                                                    ) : (
                                                            <View style={{ backgroundColor: 'white', flex: 1, marginBottom: 20, alignItems: 'center' }}>
                                                                {
                                                                    this.state.arrTransactions.length == 0 ? (
                                                                        <View>
                                                                            <Text style={{
                                                                                fontFamily: Theme.fontFamily.regular,
                                                                                fontSize: Theme.fontSize.small,
                                                                                marginTop: 10, letterSpacing: 0.4, textAlign: 'center'
                                                                            }}>{this.state.isTransactionLoading ? 'Loading transactions...' : ('No transactions from \n' + moment(moment(this.state.lastTransactionDate).toDate()).format("MM/DD/YYYY"))}</Text>
                                                                            {
                                                                                this.state.arrTransactions.length == 0 && !this.state.isTransactionLoading ? (
                                                                                    <View>
                                                                                        <TouchableOpacity
                                                                                            onPress={() => _this.getPlaidTransaction()}
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
                                                                                data={this.state.arrTransactions}
                                                                                renderItem={this.renderTransactionItem}
                                                                                keyExtractor={(item, index) => index}
                                                                                showsHorizontalScrollIndicator={false}
                                                                                showsVerticalScrollIndicator={false}
                                                                                refreshing={this.state.isPullToRefreshing}
                                                                                onRefresh={() => this.onPullToRefresh()}
                                                                            />
                                                                        )
                                                                }


                                                            </View>
                                                        )
                                                }

                                            </CardView>
                                        </View>
                                    )
                            ) : (
                                    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                                        {
                                            this.state.isFeedLoading ? (
                                                <Text
                                                    style={styContainer.feedLoadingText}
                                                >Loading...</Text>
                                            ) : (
                                                    this.state.arrFeed.length == 0 ? (
                                                        <Text
                                                            style={styContainer.feedLoadingText}
                                                        >No feed by {currentUser.missionary.display_name} yet!</Text>
                                                    ) : (
                                                            <View></View>
                                                        )

                                                )
                                        }
                                        {
                                            this.state.isMissionaryPausedRaisingFund ? (
                                                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small, padding: 15 }}>
                                                        <Text style={{ fontFamily: Theme.fontFamily.medium }}>{currentUser.missionary.display_name}</Text>
                                                        <Text>{" " + AppConstants.StringLiterals.missionaryRaisingFundPaused}</Text>
                                                    </Text>
                                                    <View style={{ width: '100%' }}>
                                                        <CustomButton title="Choose Missionary"
                                                            onButtonClicked={this.btnChooseMissionaryClicked} />
                                                    </View>
                                                </View>
                                            ) : (
                                                    <FlatList
                                                        keyboardShouldPersistTaps={'handled'}
                                                        contentContainerStyle={{ paddingBottom: 20 }}
                                                        style={{ width: '100%', flex: 1, marginTop: 5 }}
                                                        data={this.state.arrFeed}
                                                        renderItem={this.renderFeedItem}
                                                        keyExtractor={(item, index) => index}
                                                        showsHorizontalScrollIndicator={false}
                                                        showsVerticalScrollIndicator={false}
                                                        refreshing={this.state.isPullToRefreshing}
                                                        onRefresh={() => this.onPullToRefresh()}
                                                    />
                                                )
                                        }

                                    </View>
                                )
                        }
                    </View>
                </View>

                <Modal useNativeDriver={true}
                    onRequestClose={() => { this.setState({ isShowImageViewer: false }) }}
                    visible={this.state.isShowImageViewer} transparent={true}>

                    <ImageViewer index={this.state.selectedImgIndx}
                        enablePreload

                        renderHeader={this.renderHeaderItem}
                        swipeDownThreshold={50}
                        onCancel={() => this.setState({ isShowImageViewer: false })}
                        enableSwipeDown={true} useNativeDriver={true}
                        imageUrls={this.state.arrViewerImages} />
                    <TouchableOpacity onPress={() => _this.btnCloseClicked()} style={{ marginTop: 30, marginLeft: 10, position: 'absolute' }}>
                        <Image
                            style={{ tintColor: 'white', height: 30, width: 30 }}
                            source={Theme.icons.ic_close}>

                        </Image>
                    </TouchableOpacity >
                </Modal>

            </SafeAreaView >
        )
    }
}