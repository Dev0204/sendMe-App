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
import PlaidLink from 'react-native-plaid-link-sdk';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { syncUserWithServer, getConfigurationData, CALL_API, Reload_API_Alert, getCurrentUserData, saveCurrentUserData, calulcateAge, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import { EventRegister } from 'react-native-event-listeners'
var _this = null
var currentUser = {}
var serverConfig = {}
export default class SponsorProfileView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        this.state = {
            objCC: false,
            objBank: false,
            plaidBankAccountId: "",
            plaidBankPublicToken: "",
            plaidBankAccountName: "",
            plaidCCPublicToken: "",
            plaidCCAccountName: "",
            plaidCCAccountId: "",
            isLoading: false,
            isRoundUpPaused: false,
            btnShowLoading: false,
            ccPlaidLoadingFail: false
        }
    }

    componentDidMount() {
        console.log(currentUser)

        _this.checkPaymentRoundsUp()
        _this.getBankDetails()

    }

    resetPlaidStateValues() {
        this.setState({
            plaidBankAccountId: "",
            plaidBankPublicToken: "",
            plaidBankAccountName: "",
            plaidCCPublicToken: "",
            plaidCCAccountName: "",
            plaidCCAccountId: "",
        })
    }

    getBankDetails() {
        CALL_API("getCustomerByID").then((res) => {
            _this.setState({
                isLoading: false
            })

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.getBankDetails()
                    }
                })
                return
            }
            if (res.status == 1) {
                this.setState({
                    objBank: res.data.sources.data[0]
                })
                _this.getCCDetails()
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    getCCDetails() {
        CALL_API("getPlaidCCAccountInfo").then((res) => {
            _this.setState({
                isLoading: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.getCCDetails()
                    }
                })
                return
            }
            if (res.status == 1) {
                this.setState({
                    objCC: res.data
                })
            }
            else {
                if (res.is_plaid_error == 1) {
                    this.setState({
                        ccPlaidLoadingFail: true
                    })
                }
                let msg = res.msg
                if (res.plaid_obj) {
                    if (res.plaid_obj.error_code == "ITEM_LOGIN_REQUIRED") {
                        msg = AppConstants.StringLiterals.errPlaidLoginRequiredError
                    }
                }
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, msg)
                }, 50)
            }
        })
    }

    btnSideMenuClicked() {
        this.props.navigation.toggleDrawer()
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    onPlaidError(data) {
        if (data.error) {
            Alert.alert(data.error.message)
        }
    }

    editBankClicked(data) {

        console.log(data)
        let isConnectionError = false
        if (Platform.OS == "ios") {
            if (data.status == "connected") {

                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Bank_Edited",
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let arrT = []
                data.accounts.forEach(element => {
                    //console.log(element.name)
                    if (element.type == "depository") {
                        if (element.subtype == "savings") {
                            arrT.push(element)
                            _this.setState({
                                plaidBankAccountId: element.id
                            })
                        }
                    }
                });
                _this.setState({
                    plaidBankPublicToken: data.public_token,
                    plaidBankAccountName: data.institution.name
                })

                setTimeout(() => {
                    _this.confirmUpdateBank()
                }, 500);

            }
            else {
                isConnectionError = true
                Alert.alert("Fail to connect to bank account.")
            }
        }
        else if (Platform.OS == "android") {


            if (data.public_token) {

                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Bank_Edited",
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let arrT = []
                data.link_connection_metadata.accounts.forEach(element => {
                    console.log(element)
                    let obj = {
                        type: element.account_type,
                        subtype: element.account_sub_type,
                        name: element.account_name,
                        mask: element.account_number
                    }
                    if (element.account_type == "depository") {
                        if (element.account_sub_type == "savings") {
                            arrT.push(obj)
                            _this.setState({
                                plaidBankAccountId: element.account_id
                            })
                        }
                    }
                });
                _this.setState({
                    arrPlaidBankAccounts: arrT,
                    plaidBankPublicToken: data.public_token,
                    plaidBankAccountName: data.link_connection_metadata.institution_name
                })
                setTimeout(() => {
                    _this.confirmUpdateBank()
                }, 500);
            }
            else {
                isConnectionError = true
                Alert.alert("Fail to connect to bank account.")
            }
        }

    }

    confirmUpdateBank() {
        Alert.alert("Are you sure you want to update bank info?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        _this.doUpdateBankInfo()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    doUpdateBankInfo() {
        console.log(this.state.plaidBankPublicToken)
        console.log(this.state.plaidBankAccountName)
        console.log(this.state.plaidBankAccountId)
        let param = {
            plaid_bank_public_token: this.state.plaidBankPublicToken,
            bank_account_id: this.state.plaidBankAccountId,
            user_time_zone: serverConfig.time_zone
        }
        _this.setState({
            isLoading: true
        })

        CALL_API("editPlaidBankToken", param).then((res) => {
            _this.setState({
                isLoading: false
            })

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.doUpdateBankInfo()
                    }
                })
                return
            }
            if (res.status == 1) {
                _this.resetPlaidStateValues()
                setTimeout(() => {
                    _this.setState({
                        objBank: false
                    })
                    this.getBankDetails()
                }, 100);

            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    editCCClicked(data) {
        console.log(data)
        if (Platform.OS == "ios") {
            if (data.status == "connected") {
                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Credit_Card_Edited"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
                let arrTCC = []
                data.accounts.forEach(element => {
                    //console.log(element.name)
                    if (element.type == "credit") {
                        if (element.subtype == "credit card") {
                            arrTCC.push(element)
                            _this.setState({
                                plaidCCAccountId: element.id
                            })
                        }
                    }
                });
                _this.setState({
                    plaidCCPublicToken: data.public_token,
                    plaidCCAccountName: data.institution.name,
                })
                _this.confirmUpdateCC()
            }
            else {
                Alert.alert("Fail to connect to bank account.")
            }
        }
        else if (Platform.OS == "android") {


            if (data.public_token) {

                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Credit_Card_Edited"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let arrTCC = []
                data.link_connection_metadata.accounts.forEach(element => {
                    console.log(element)
                    let obj = {
                        type: element.account_type,
                        subtype: element.account_sub_type,
                        name: element.account_name,
                        mask: element.account_number
                    }
                    if (element.account_type == "credit") {
                        if (element.account_sub_type == "credit card") {
                            arrTCC.push(obj)
                            _this.setState({
                                plaidCCAccountId: element.account_id
                            })
                        }
                    }
                });
                _this.setState({
                    plaidCCPublicToken: data.public_token,
                    plaidCCAccountName: data.link_connection_metadata.institution_name
                })
                _this.confirmUpdateCC()
            }
            else {
                Alert.alert("Fail to connect to bank account.")
            }
        }
    }

    confirmUpdateCC() {
        Alert.alert("Are you sure you want to update card info?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        _this.doUpdateCCInfo()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    doUpdateCCInfo() {

        console.log(this.state.plaidCCPublicToken)
        console.log(this.state.plaidCCAccountName)
        console.log(this.state.plaidCCAccountId)
        let param = {
            plaid_cc_public_token: this.state.plaidCCPublicToken,
            cc_account_id: this.state.plaidCCAccountId,
            user_time_zone: serverConfig.time_zone
        }
        _this.setState({
            isLoading: true
        })

        CALL_API("editPlaidCCToken", param).then((res) => {
            _this.setState({
                isLoading: false
            })

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.doUpdateBankInfo()
                    }
                })
                return
            }
            if (res.status == 1) {
                _this.resetPlaidStateValues()

                setTimeout(() => {
                    _this.setState({
                        objCC: false
                    })
                    _this.getCCDetails()
                }, 100);

            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    btnPauseRoundUpClicked() {
        if (_this.state.btnShowLoading) {
            return
        }
        Alert.alert("Are you sure you want to pause round up Payments?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        _this.doPauseRoundUp()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    btnStartRoundUpClicked() {
        if (_this.state.btnShowLoading) {
            return
        }
        Alert.alert("Are you sure you are ready to start spare change round-up payments again?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        _this.doStartRoundUp()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    doPauseRoundUp() {

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "Sponsor_Pause_Round_Up",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        this.setState({
            btnShowLoading: true
        })
        CALL_API("pauseRoundUpPayment").then((res) => {
            this.setState({
                btnShowLoading: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.doPauseRoundUp()
                    }
                })
                return
            }

            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                        _this.checkPaymentRoundsUp()
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

    doStartRoundUp() {
        this.setState({
            btnShowLoading: true
        })
        let param = {
            user_time_zone: serverConfig.time_zone
        }

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "Sponsor_Start_Round_Up",
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        CALL_API("startRoundUpPayment", param).then((res) => {
            this.setState({
                btnShowLoading: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.doPauseRoundUp()
                    }
                })
                return
            }

            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                        _this.checkPaymentRoundsUp()
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

    checkPaymentRoundsUp() {
        if (currentUser.is_rounding_up_paused == 1) {
            this.setState({
                isRoundUpPaused: true
            })
        }
        else {
            this.setState({
                isRoundUpPaused: false
            })
        }
    }

    render() {
        return (
            <SafeAreaView style={styContainer.windowContainer}>
                <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
                <Loader loading={this.state.isLoading} refParentView={_this} />
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

                    <ScrollView contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }} style={{ width: '100%', flex: 1 }}>
                        <Text style={styContainer.pageTitleText}>My Profile</Text>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styContainer.profileName}>{currentUser.display_name}</Text>

                            <FastImage
                                source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.user_profile_photo }}
                                style={{
                                    marginTop: 5, borderRadius: RFValue(40), height: RFValue(80), width: RFValue(80),
                                    backgroundColor: 'gray'
                                }}>
                            </FastImage>
                        </View>
                        <Text style={styContainer.pageTitleText}>My Missionary</Text>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styContainer.profileName}>{currentUser.missionary.display_name}</Text>
                            <FastImage
                                source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.missionary.user_profile_photo }}
                                style={{ marginTop: 5, borderRadius: RFValue(40), height: RFValue(80), width: RFValue(80), backgroundColor: 'gray' }}>
                            </FastImage>
                        </View>
                        {
                            this.state.objBank ? (
                                <CardView cardElevation={Platform.OS == "ios" ? 2 : 4} style={{ width: '90%', borderColor: '#f0f0f0', borderWidth: 1, marginTop: 10 }}>
                                    <View style={{ backgroundColor: 'white', alignItems: 'center', marginTop: 0 }}>
                                        <View style={{ marginTop: 0, backgroundColor: 'white', alignItems: 'center' }}>
                                            <Text style={[styContainer.pageTitleText, {
                                                textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small,
                                                color: Theme.colors.sendMeBlue, marginTop: 0, padding: 10
                                            }]}>Bank Details</Text>
                                        </View>
                                        {/* <Text>{this.state.objBank.bank_name}</Text> */}

                                        <View style={{ flexDirection: 'row', width: '90%', marginBottom: 10, alignItems: 'center' }}>
                                            <Image
                                                resizeMode="contain"
                                                style={{
                                                    height: RFValue(15),
                                                    width: RFValue(15), tintColor: Theme.colors.sendMeBlue
                                                }}
                                                source={Theme.icons.ic_bank}
                                            ></Image>
                                            <Text
                                                style={{
                                                    marginLeft: 10,
                                                    fontFamily: Theme.fontFamily.regular,
                                                    fontSize: Theme.fontSize.small, letterSpacing: 0.5
                                                }}
                                            >{this.state.objBank.bank_name} {" (**** " + this.state.objBank.last4 + ")"}</Text>
                                        </View>
                                        <View style={{ width: '100%', marginBottom: 10, flexDirection: 'row', justifyContent: 'center' }}>
                                            <View style={{ width: '90%' }}>
                                                {
                                                    this.state.isRoundUpPaused ? (
                                                        <Text
                                                            onPress={() => Alert.alert("Start round up payment to edit")}
                                                            style={{
                                                                backgroundColor: 'black', height: RFValue(30),
                                                                color: 'white', textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                                                                fontSize: Theme.fontSize.semiRegular, paddingTop: 4.5, opacity: 0.5
                                                            }}>Edit</Text>
                                                    ) : (
                                                            <PlaidLink
                                                                // Replace any of the following <#VARIABLE#>s according to your setup,
                                                                // for details see https://plaid.com/docs/quickstart/#client-side-link-configuration
                                                                publicKey={AppConstants.plaid_public_key_dev}
                                                                clientName='SendMe'
                                                                env='development'  // 'sandbox' or 'development' or 'production'

                                                                product={["auth", "transactions"]}
                                                                onSuccess={data => this.editBankClicked(data)}
                                                                onExit={data => this.onPlaidError(data)}
                                                                onCancelled={(result) => { console.log('Cancelled: ', result) }}
                                                            >
                                                                <Text style={{
                                                                    backgroundColor: 'black', height: RFValue(30),
                                                                    color: 'white', textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                                                                    fontSize: Theme.fontSize.semiRegular, paddingTop: 4.5
                                                                }}>Edit</Text>
                                                            </PlaidLink>
                                                        )
                                                }




                                            </View>
                                            {/* <View style={{ width: '47%' }}>
                                                <CustomButton title="Delete" defineHeight={RFValue(30)}
                                                    bgColor={Theme.colors.sendMeBlue} defineFontFamily={Theme.fontFamily.medium}
                                                    onButtonClicked={this.deleteBankClicked}
                                                />
                                            </View> */}
                                        </View>
                                    </View>
                                </CardView>
                            ) : (
                                    <CardView cardElevation={Platform.OS == "ios" ? 2 : 4} style={{ width: '90%', borderColor: '#f0f0f0', borderWidth: 1, marginTop: 10, alignItems: 'center' }}>
                                        <View>
                                            <Text
                                                style={{
                                                    padding: 10,
                                                    fontFamily: Theme.fontFamily.regular,
                                                    fontSize: Theme.fontSize.semiRegular
                                                }}
                                            >Loading Bank...</Text>
                                        </View>
                                    </CardView>
                                )
                        }

                        {
                            this.state.objCC ? (
                                <CardView cardElevation={Platform.OS == "ios" ? 2 : 4} style={{ width: '90%', marginTop: 20, borderColor: '#f0f0f0', borderWidth: 1 }}>
                                    <View style={{ backgroundColor: 'white', alignItems: 'center', marginTop: 0 }}>
                                        <View style={{ marginTop: 0, backgroundColor: 'white', alignItems: 'center' }}>
                                            <Text style={[styContainer.pageTitleText, {
                                                textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small,
                                                color: Theme.colors.sendMeBlue, marginTop: 0, padding: 10
                                            }]}>Card Details</Text>
                                        </View>
                                        {/* <Text>{this.state.objBank.bank_name}</Text> */}

                                        <View style={{ flexDirection: 'row', width: '90%', marginBottom: 10, alignItems: 'center' }}>
                                            <Image
                                                resizeMode="contain"
                                                style={{
                                                    height: RFValue(15),
                                                    width: RFValue(15), tintColor: Theme.colors.sendMeBlue
                                                }}
                                                source={Theme.icons.ic_credit_card}
                                            ></Image>
                                            <Text
                                                style={{
                                                    marginLeft: 10,
                                                    fontFamily: Theme.fontFamily.regular,
                                                    fontSize: Theme.fontSize.small, letterSpacing: 0.5
                                                }}
                                            >{this.state.objCC.name} {" (**** " + this.state.objCC.mask + ")"}</Text>
                                        </View>

                                        <View style={{ width: '100%', marginBottom: 10, flexDirection: 'row', justifyContent: 'center' }}>
                                            <View style={{ width: '90%' }}>
                                                {
                                                    this.state.isRoundUpPaused ? (
                                                        <Text
                                                            onPress={() => Alert.alert("Start round up payment to edit")}
                                                            style={{
                                                                backgroundColor: 'black', height: RFValue(30),
                                                                color: 'white', textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                                                                fontSize: Theme.fontSize.semiRegular, paddingTop: 4.5, opacity: 0.5
                                                            }}>Edit</Text>
                                                    ) : (
                                                            <PlaidLink
                                                                // Replace any of the following <#VARIABLE#>s according to your setup,
                                                                // for details see https://plaid.com/docs/quickstart/#client-side-link-configuration
                                                                publicKey={AppConstants.plaid_public_key_dev}
                                                                clientName='SendMe'
                                                                env='development'  // 'sandbox' or 'development' or 'production'

                                                                product={["auth", "transactions"]}
                                                                onSuccess={data => this.editCCClicked(data)}
                                                                onExit={data => this.onPlaidError(data)}
                                                                onCancelled={(result) => { console.log('Cancelled: ', result) }}
                                                            >
                                                                <Text style={{
                                                                    backgroundColor: 'black', height: RFValue(30),
                                                                    color: 'white', textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                                                                    fontSize: Theme.fontSize.semiRegular, paddingTop: 4.5
                                                                }}>Edit</Text>
                                                            </PlaidLink>
                                                        )
                                                }

                                            </View>
                                            {/* <View style={{ width: '47%' }}>
                                                <CustomButton title="Delete" defineHeight={RFValue(30)}
                                                    bgColor={Theme.colors.sendMeBlue} defineFontFamily={Theme.fontFamily.medium}
                                                    onButtonClicked={this.deleteCCClicked}
                                                />
                                            </View> */}
                                        </View>
                                    </View>
                                </CardView>
                            ) : (
                                    this.state.ccPlaidLoadingFail ? (
                                        <CardView cardElevation={Platform.OS == "ios" ? 2 : 4} style={{ width: '90%', borderColor: '#f0f0f0', borderWidth: 1, marginTop: 10, alignItems: 'center' }}>
                                            <View style={{ width: '90%' }}>
                                                <View style={{ padding: 10, paddingLeft: 0, paddingRight: 0 }}>
                                                    <PlaidLink
                                                        // Replace any of the following <#VARIABLE#>s according to your setup,
                                                        // for details see https://plaid.com/docs/quickstart/#client-side-link-configuration
                                                        publicKey={AppConstants.plaid_public_key_dev}
                                                        clientName='SendMe'
                                                        env='development'  // 'sandbox' or 'development' or 'production'
                                                        product={["auth", "transactions"]}
                                                        onSuccess={data => this.editCCClicked(data)}
                                                        onExit={data => this.onPlaidError(data)}
                                                        onCancelled={(result) => { console.log('Cancelled: ', result) }}
                                                    >
                                                        <Text style={{
                                                            backgroundColor: 'red', height: RFValue(30),
                                                            color: 'white', textAlign: 'center', fontFamily: Theme.fontFamily.medium,
                                                            fontSize: Theme.fontSize.semiRegular, paddingTop: 4.5
                                                        }}>Please connect card again</Text>
                                                    </PlaidLink>
                                                </View>
                                            </View>
                                        </CardView>
                                    ) : (
                                            <CardView cardElevation={Platform.OS == "ios" ? 2 : 4} style={{ width: '90%', borderColor: '#f0f0f0', borderWidth: 1, marginTop: 10, alignItems: 'center' }}>
                                                <View>
                                                    <Text
                                                        style={{
                                                            padding: 10,
                                                            fontFamily: Theme.fontFamily.regular,
                                                            fontSize: Theme.fontSize.semiRegular
                                                        }}
                                                    >Loading Card...</Text>
                                                </View>
                                            </CardView>
                                        )

                                )
                        }

                        <View style={{ width: '100%', marginTop: 25 }}>
                            {
                                this.state.isRoundUpPaused ? (
                                    <CustomButton title={"Start Round-up Payments"}
                                        isLoading={this.state.btnShowLoading}
                                        defineHeight={RFValue(40)}
                                        bgColor={"#28bf58"}
                                        onButtonClicked={this.btnStartRoundUpClicked} />
                                ) : (
                                        <CustomButton title={"Pause Round-up Payments"}
                                            isLoading={this.state.btnShowLoading}
                                            defineHeight={RFValue(40)}
                                            bgColor={"#bf3528"}
                                            onButtonClicked={this.btnPauseRoundUpClicked} />
                                    )
                            }

                        </View>

                        {/* <CardView cardElevation={2} style={{ width: '90%' }}>
                            <TouchableOpacity

                                activeOpacity={0.7} style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', width: '100%' }}>
                                <Text style={{ marginLeft: 10, color: Theme.colors.sendMeBlue, letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>Bank Details</Text>
                                <View>
                                    <Image resizeMode="contain" style={{ height: RFValue(13), width: RFValue(13), marginRight: 10 }} source={Theme.icons.ic_right_arrow}></Image>
                                </View>
                            </TouchableOpacity>
                        </CardView>
                        <CardView cardElevation={2} style={{ width: '90%', marginTop: 0 }}>
                            <TouchableOpacity

                                activeOpacity={0.7} style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', marginTop: 15, justifyContent: 'space-between', width: '100%' }}>
                                <Text style={{ marginLeft: 10, color: Theme.colors.sendMeBlue, letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>Card Details</Text>
                                <View>
                                    <Image resizeMode="contain" style={{ height: RFValue(13), width: RFValue(13), marginRight: 10 }} source={Theme.icons.ic_right_arrow}></Image>
                                </View>
                            </TouchableOpacity>
                        </CardView> */}
                    </ScrollView>



                </View>
            </SafeAreaView >
        )
    }
}