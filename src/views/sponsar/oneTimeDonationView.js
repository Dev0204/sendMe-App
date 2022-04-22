import React, { Component } from 'react';
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
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { CALL_API, getCurrentUserData, getConfigurationData, Reload_API_Alert, syncUserWithServer } from '../../api/api';
import { EventRegister } from 'react-native-event-listeners';

var _this = null
let isPushed = false
var currentUser = {}
let serverConfig = {}
export default class OneTimeDonationView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        isPushed = this.props.navigation.getParam("is_pushed", false)
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        this.state = {
            txt_amount: "",
            is_checked: false,
            ani_validate: null,
            ani_checkbox: null,
            btnShowLoading: false,
            strBankInfo: "Loading...",
            kDoRender: false,
            isMissionaryPausedRaising: false
        }
    }

    componentDidMount() {
        _this.syncUser()
        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "One_Time_Donation",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
    }

    syncUser() {
        currentUser = getCurrentUserData()
        if (currentUser.missionary.is_rounding_up_paused == 0) {
            this.setState({
                kDoRender: true,
                isMissionaryPausedRaising: false
            })
        }

        syncUserWithServer().then((res) => {
            if (res) {
                currentUser = getCurrentUserData()
                if (currentUser.missionary.is_rounding_up_paused == 0) {
                    this.setState({
                        kDoRender: true,
                        isMissionaryPausedRaising: false
                    })
                    _this.getBankInfo()
                }
                else {
                    this.setState({
                        kDoRender: true,
                        isMissionaryPausedRaising: true
                    })

                }
            }
        })
    }

    getBankInfo() {
        CALL_API("getCustomerByID").then((res) => {
            if (res.status == 1) {
                let bankInfo = res.data.sources.data[0].bank_name + " (**** " + res.data.sources.data[0].last4 + ")"
                this.setState({
                    strBankInfo: bankInfo
                })
            }
            else {
                Alert.alert(res.msg)
                this.props.navigation.goBack()
            }
        })
    }

    btnSideMenuClicked() {
        if (isPushed) {
            this.props.navigation.goBack()
        }
        else {
            this.props.navigation.toggleDrawer()
        }
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    btnGetReadyClicked() {

    }

    btnSelectClicked() {
        //_this.props.navigation.navigate("sponsarGetBankAndCardInfoView")
    }

    btnOneTimeDonationClicked() {
        Keyboard.dismiss()
        if (_this.state.btnShowLoading) {
            return
        }

        if (_this.state.txt_amount.trim() == "") {
            _this.setState({
                ani_validate: "shake"
            })
            setTimeout(() => {
                _this.setState({
                    ani_validate: null
                })
            }, 500);
            return
        }

        let amt = parseFloat(_this.state.txt_amount)

        if (amt <= 0 || isNaN(amt)) {
            Alert.alert("Invalid amount.")
            return
        }

        if (!_this.state.is_checked) {
            _this.setState({
                ani_checkbox: "shake"
            })
            setTimeout(() => {
                _this.setState({
                    ani_checkbox: null
                })
            }, 500);
            return
        }

        let param = {
            user_time_zone: serverConfig.time_zone,
            amount_in_usd: _this.state.txt_amount
        }
        _this.setState({
            btnShowLoading: true
        })
        CALL_API("doOneTimeDonation", param).then((res) => {
            _this.setState({
                btnShowLoading: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.btnOneTimeDonationClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                _this.setState({
                    txt_amount: ""
                })
                Alert.alert(res.msg)
                EventRegister.emit("reloadTransactionListener", '')
                _this.props.navigation.goBack()
            }
            else if (res.status == 2) {
                Alert.alert(res.msg)
                _this.syncUser()
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

            console.log(res)
        })
    }

    setSelectedValue(val) {
        this.setState({
            txt_amount: val + ''
        })
    }

    btnAgreeClicked() {
        let checked = this.state.is_checked
        setTimeout(() => {
            _this.setState({
                is_checked: !checked
            })
        }, 50);
    }

    render() {
        return (
            <SafeAreaView style={styContainer.windowContainer}>
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
                                        source={isPushed ? Theme.icons.ic_go_back : Theme.icons.ic_sidemenu}>
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
                    {
                        this.state.isMissionaryPausedRaising ? (
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small, padding: 15 }}>
                                    <Text style={{ fontFamily: Theme.fontFamily.medium }}>{currentUser.missionary.display_name}</Text>
                                    <Text>{" " + AppConstants.StringLiterals.missionaryRaisingFundPaused}</Text>
                                </Text>
                                {/* <Text style={{ fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4 }}>Missionary paused raising fund!</Text> */}
                            </View>
                        ) : (
                                <View></View>
                            )
                    }
                    {
                        this.state.kDoRender && !this.state.isMissionaryPausedRaising ? (
                            <KeyboardAwareScrollView
                                automaticallyAdjustContentInsets={false}
                                contentContainerStyle={{ paddingBottom: 65, alignItems: 'center' }}
                                keyboardShouldPersistTaps={'handled'}
                                style={{ width: '100%', flex: 1 }}>

                                <Text style={styContainer.pageTitleText}>One-time Gift</Text>

                                <Text style={[styContainer.profileName, { width: '90%', marginTop: 5 }]}>
                                    You can send a one-time gift separate from the round-up payments to your favorite missionary at any time.
                                </Text>

                                <Text style={[styContainer.profileName, { width: '90%', marginTop: 15, textAlign: 'left' }]}>
                                    <Text>To Missionary: </Text>
                                    <Text style={{ fontFamily: Theme.fontFamily.medium }}>{currentUser.missionary.display_name}</Text>
                                </Text>

                                <View style={{ flexDirection: 'row', width: '90%', marginTop: 20 }}>
                                    <CardView cardElevation={2}>
                                        <TouchableOpacity
                                            onPress={() => this.setSelectedValue(25)}
                                            activeOpacity={0.7} style={styContainer.donationAmountParentView}>
                                            <Text style={styContainer.donationAmount}>$25</Text>
                                        </TouchableOpacity>
                                    </CardView>
                                    <View style={{ width: RFValue(10) }}></View>
                                    <CardView cardElevation={2}>
                                        <TouchableOpacity
                                            onPress={() => this.setSelectedValue(50)}
                                            activeOpacity={0.7} style={styContainer.donationAmountParentView}>
                                            <Text style={styContainer.donationAmount}>$50</Text>
                                        </TouchableOpacity>
                                    </CardView>
                                </View>

                                <View style={{ flexDirection: 'row', width: '90%', marginTop: RFValue(10) }}>
                                    <CardView cardElevation={2}>
                                        <TouchableOpacity
                                            onPress={() => this.setSelectedValue(75)}
                                            activeOpacity={0.7} style={styContainer.donationAmountParentView}>
                                            <Text style={styContainer.donationAmount}>$75</Text>
                                        </TouchableOpacity>
                                    </CardView>
                                    <View style={{ width: RFValue(10) }}></View>
                                    <CardView cardElevation={2}>
                                        <TouchableOpacity
                                            onPress={() => this.setSelectedValue(100)}
                                            activeOpacity={0.7} style={styContainer.donationAmountParentView}>
                                            <Text style={styContainer.donationAmount}>$100</Text>
                                        </TouchableOpacity>
                                    </CardView>
                                </View>

                                <Text style={[styContainer.profileName, { width: '90%', marginTop: 25 }]}>
                                    Other
                                </Text>
                                <CardView cardElevation={2} style={{ width: '90%', marginTop: 15 }}>
                                    <Animatable.View
                                        animation={this.state.ani_validate}
                                        style={{
                                            height: RFValue(40), backgroundColor: 'white', alignItems: 'center',
                                            justifyContent: 'center', flexDirection: 'row', width: '100%'
                                        }}>

                                        <Icon name="usd" size={RFValue(15)} color={Theme.colors.sendMeGray} style={styContainer.sideMenuItemIcon} />
                                        <View style={[styContainer.sideMenuItemIcon, { height: '100%', width: 1, backgroundColor: '#E7E7E7' }]}></View>
                                        <TextInput
                                            keyboardType="numeric"
                                            style={{
                                                height: RFValue(35), flex: 1,
                                                marginRight: 7, marginLeft: 10
                                            }}
                                            value={this.state.txt_amount}
                                            onChangeText={txt => this.setState({ txt_amount: txt })}
                                            placeholder="Enter amount"></TextInput>

                                    </Animatable.View>
                                </CardView>

                                <TouchableOpacity
                                    onPress={() => this.btnAgreeClicked()}
                                    activeOpacity={0.7} style={{ width: '90%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 30 }}>
                                    <View style={{ height: RFValue(30), width: RFValue(30), justifyContent: 'center', alignItems: 'center' }}>
                                        <CardView cardElevation={1}>
                                            <Image style={{ tintColor: this.state.is_checked ? 'black' : '#c9c9c9', height: RFValue(22), width: RFValue(22) }} source={this.state.is_checked ? Theme.icons.ic_checked : Theme.icons.ic_unchecked}></Image>
                                        </CardView>
                                    </View>
                                    <Animatable.Text
                                        animation={this.state.ani_checkbox}
                                        style={{
                                            marginLeft: RFValue(5), letterSpacing: 0.4, flex: 1,
                                            fontFamily: Theme.fontFamily.regular,
                                            fontSize: Theme.fontSize.semiSmall1,
                                            color: Theme.colors.sendMeBlack
                                        }}>
                                        <Text>
                                            {"I agree to pay via bank."}
                                        </Text>
                                    </Animatable.Text>

                                </TouchableOpacity>
                                <Text style={{
                                    width: '90%', textAlign: 'center',
                                    marginTop: 20, fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.small
                                }}>
                                    <Text style={{ fontFamily: Theme.fontFamily.medium }}>
                                        Gift amount will be deducted from:
                            </Text>
                                    <Text>
                                        {"\n" + this.state.strBankInfo}
                                    </Text>

                                </Text>
                            </KeyboardAwareScrollView>
                        ) : (
                                <View></View>
                            )
                    }

                    <KeyboardAccessoryView />
                    {
                        this.state.kDoRender && !this.state.isMissionaryPausedRaising ? (
                            <View style={{ position: 'absolute', bottom: 10, width: '100%' }}>
                                <CustomButton
                                    isLoading={this.state.btnShowLoading}
                                    title="Confirm" onButtonClicked={this.btnOneTimeDonationClicked} />
                            </View>
                        ) : (
                                <View></View>
                            )
                    }


                </View>
            </SafeAreaView >
        )
    }
}