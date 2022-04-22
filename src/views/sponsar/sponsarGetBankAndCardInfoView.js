import React, { useState, useEffect } from 'react';
import {
    Dimensions, FlatList, SectionList,
    ScrollView, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage,
    TextInput, Text, Button, Image, TouchableOpacity, StatusBar,
    StyleSheet, TextComponent, Modal, ActivityIndicator, BackHandler
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
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import PlaidLink from 'react-native-plaid-link-sdk';
// import Stripe from 'react-native-stripe-api';
import { CALL_API, getStripePublishKey, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
import Share from "react-native-share";
var _this = null
// var client = null
var currentUser = {}
let serverConfig = {}

const sponsarGetBankAndCardInfoView = (props) => {

    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()
    const [selectedTab, setselectedTab] = useState(0)
    const [nameOnCard, setnameOnCard] = useState("")
    const [cardNumber, setcardNumber] = useState("")
    const [zipCode, setzipCode] = useState("")
    const [expDate, setexpDate] = useState("")
    const [cvv, setcvv] = useState("")
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [arrCardSources, setarrCardSources] = useState([])
    const [tosAccepted, settosAccepted] = useState(false)
    const [arrPlaidBankAccounts, setarrPlaidBankAccounts] = useState([])
    const [arrPlaidCreditCardAccounts, setarrPlaidCreditCardAccounts] = useState([])
    const [plaidBankPublicToken, setplaidBankPublicToken] = useState("")
    const [plaidBankAccountId, setplaidBankAccountId] = useState("")
    const [plaidBankAccountName, setplaidBankAccountName] = useState("")
    const [plaidCCPublicToken, setplaidCCPublicToken] = useState("")
    const [plaidCCAccountId, setplaidCCAccountId] = useState("")
    const [plaidCCAccountName, setplaidCCAccountName] = useState("")
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [isLoading, setisLoading] = useState(false)
    const [kDoRender, setkDoRender] = useState(false)
    const [isStepToInitialLoad, setisStepToInitialLoad] = useState(true)
    const [isShowingTerms, setisShowingTerms] = useState(false)
    const [isChoosingSingleCardModal, setisChoosingSingleCardModal] = useState(false)


    useEffect(() => {
        syncUserWithServer().then((res) => {
            if (res) {
                currentUser = getCurrentUserData()
                if (currentUser.plaid_bank_access_token != "" && currentUser.plaid_bank_account_id != "" && currentUser.plaid_cc_access_token != "" && currentUser.plaid_cc_account_id != "") {
                    props.navigation.navigate("sponsarHomeView")
                }
                else {
                    setkDoRender(true)
                    BackHandler.addEventListener('hardwareBackPress', handleAndroidBackButton);
                }
            }
        })
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButton);
        }
    }, [])


    function handleAndroidBackButton() {
        return true;
    }

    function btnTabClicked(idx) {
        setselectedTab(idx)
    }

    // function _updateMasterState = (attrName, value) => {
    //     this.setState({ [attrName]: value });
    //     if (attrName == "cardNumber") {
    //         let cardType = getCardTypeByValue(value)
    //         // console.log(cardType)
    //         let frmt = formatCardNumber(value)
    //         if (frmt) {
    //             _this.setState({
    //                 cardNumber: frmt
    //             })
    //         }
    //     }
    //     else if (attrName == "expDate") {
    //         let frmt = formatExpiry(value)
    //         if (frmt) {
    //             _this.setState({
    //                 expDate: frmt
    //             })
    //         }
    //     }
    // }

    function btnNextClicked() {
        setselectedTab(1)
    }

    function btnTosAcceptClicked() {
        if (tosAccepted) {
            setTimeout(() => {
                settosAccepted(false)
            }, 50);
        }
        else {
            settosAccepted(true)
        }

    }

    function loadPlaidCCardData(data) {
        console.log(data)
        if (Platform.OS == "ios") {
            if (data.status == "connected") {

                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Credit_Card_Added"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)


                let prm = {
                    logs: "CC" + JSON.stringify(data)
                }
                CALL_API("plaidAccountLog", prm).then((res) => {

                })

                let arrTCC = []
                data.accounts.forEach(element => {
                    //console.log(element.name)
                    if (element.type == "credit" || element.type == "depository" || element.type == "other") {
                        if (element.subtype == "credit card" || element.subtype == "checking" || element.subtype == "savings" || element.subtype == "other") {
                            arrTCC.push(element)
                        }
                    }
                });


                if (arrTCC.length == 1) {
                    setplaidCCAccountId(arrTCC[0].id)
                }

                if (arrTCC.length == 0) {
                    setisStepToInitialLoad(false)
                }

                setarrPlaidCreditCardAccounts(arrTCC)
                setplaidCCPublicToken(data.public_token)
                setplaidCCAccountName(data.institution.name)
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
                        button: "Sponsor_Credit_Card_Added"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let prm = {
                    logs: "CC" + JSON.stringify(data)
                }
                CALL_API("plaidAccountLog", prm).then((res) => {

                })

                let arrTCC = []
                data.link_connection_metadata.accounts.forEach(element => {
                    console.log(element)
                    let obj = {
                        type: element.account_type,
                        subtype: element.account_sub_type,
                        name: element.account_name,
                        mask: element.account_number,
                        id: element.account_id
                    }
                    if (element.account_type == "credit" || element.account_type == "depository" || element.account_type == "other") {
                        if (element.account_sub_type == "credit card" || element.account_sub_type == "checking" || element.account_sub_type == "savings" || element.account_sub_type == "other") {
                            arrTCC.push(obj)
                        }
                    }
                });

                if (arrTCC.length == 1) {
                    setplaidCCAccountId(arrTCC[0].id)
                }

                if (arrTCC.length == 0) {
                    setisStepToInitialLoad(false)
                }

                setarrPlaidCreditCardAccounts(arrTCC)
                setplaidCCPublicToken(data.public_token)
                setplaidCCAccountName(data.link_connection_metadata.institution_name)
            }
            else {
                Alert.alert("Fail to connect to bank account.")
            }
        }
    }

    function onPlaidError(data) {
        if (data.error) {
            Alert.alert(data.error.message)
        }
    }

    function loadPlaidBankData(data) {
        console.log(data)
        let isConnectionError = false
        if (Platform.OS == "ios") {
            if (data.status == "connected") {

                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "Sponsor_Bank_Account_Added"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let prm = {
                    logs: "BANK" + JSON.stringify(data)
                }
                CALL_API("plaidAccountLog", prm).then((res) => {

                })

                let arrT = []
                data.accounts.forEach(element => {
                    //console.log(element.name)
                    if (element.type == "depository") {
                        if (element.subtype == "savings" || element.subtype == "checking") {
                            let objT = JSON.parse(JSON.stringify(element))
                            objT.account_id = element.id
                            arrT.push(objT)
                        }
                    }
                });

                if (arrT.length == 1) {
                    setplaidBankAccountId(arrT[0].account_id)
                }

                setarrPlaidBankAccounts(arrT)
                setplaidBankPublicToken(data.public_token)
                setplaidBankAccountName(data.institution.name)
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
                        button: "Sponsor_Bank_Account_Added"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

                let prm = {
                    logs: "BANK" + JSON.stringify(data)
                }
                CALL_API("plaidAccountLog", prm).then((res) => {

                })

                let arrT = []
                data.link_connection_metadata.accounts.forEach(element => {
                    console.log(element)
                    let obj = {
                        type: element.account_type,
                        subtype: element.account_sub_type,
                        name: element.account_name,
                        mask: element.account_number,
                        account_id: element.account_id
                    }
                    if (element.account_type == "depository") {
                        if (element.account_sub_type == "savings" || element.account_sub_type == "checking") {
                            arrT.push(obj)
                        }
                    }
                });

                if (arrT.length == 1) {
                    setplaidBankAccountId(arrT[0].account_id)
                }

                setarrPlaidBankAccounts(arrT)
                setplaidBankPublicToken(data.public_token)
                setplaidBankAccountName(data.link_connection_metadata.institution_name)
            }
            else {
                isConnectionError = true
                Alert.alert("Fail to connect to bank account.")
            }
        }

        if (!isConnectionError) {
            if (arrPlaidCreditCardAccounts.length == 0) {
                loadPlaidCCardData(data)
            }
        }
    }

    function btnStepClicked(idx) {
        setselectedTab(idx)
    }

    function btnLinkingBankAccountClicked() {
        if (arrPlaidBankAccounts.length == 0 || arrPlaidCreditCardAccounts.length == 0) {
            Alert.alert("Error", "Bank or credit card account not provided!")
            return
        }

        if (btnShowLoading) {
            return
        }
        let param = {
            plaid_bank_public_token: plaidBankPublicToken,
            plaid_cc_public_token: plaidCCPublicToken,
            bank_account_id: plaidBankAccountId,
            cc_account_id: plaidCCAccountId,
            user_time_zone: serverConfig.time_zone
        }
        setbtnShowLoading(true)

        setTimeout(() => {
            setbtnShowLoading(false)
        }, AppConstants.loaderTimeOutDuration * 1000);

        CALL_API("createStripeCustomerWithPlaidBankTokenV2", param).then((res) => {
            setTimeout(() => {
                setbtnShowLoading(false)
            }, 1000)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnLinkingBankAccountClicked()
                    }
                })
                return
            }
            if (res.status == 1) {
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                    }
                })
                props.navigation.navigate("sponsarHomeView")
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
                setarrPlaidBankAccounts([])
                setarrPlaidCreditCardAccounts([])
                setselectedTab(0)
                setisStepToInitialLoad(true)
            }
            console.log(res)
        })
    }

    function onCardItemClicked(item) {
        if (arrPlaidCreditCardAccounts.length == 1) {
            return
        }
        let arrT = []
        arrPlaidCreditCardAccounts.forEach(element => {
            if (item.id == element.id) {
                arrT.push(element)
                setplaidCCAccountId(element.id)
            }
        });
        setarrPlaidCreditCardAccounts(arrT)
    }

    function renderCreditCardAccountItem({ item, index }) {
        return (
            <TouchableOpacity
                onPress={() => onCardItemClicked(item)}
                activeOpacity={arrPlaidCreditCardAccounts.length == 1 ? 1 : 0.7} style={{ width: '90%', alignSelf: 'center' }}>
                <CardView cardElevation={2} style={{ width: '100%', alignSelf: 'center', marginTop: 15 }}>
                    <View style={{ backgroundColor: 'white', padding: 15 }}>
                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Name: </Text>
                            <Text>{item.name}</Text>
                        </Text>
                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Type: </Text>
                            <Text>{item.type}</Text>
                        </Text>

                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Sub Type: </Text>
                            <Text>{item.subtype}</Text>
                        </Text>

                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Mask: </Text>
                            <Text>{"**** " + item.mask}</Text>
                        </Text>

                    </View>
                </CardView>
                {
                    arrPlaidCreditCardAccounts.length == 1 ? (
                        <TouchableOpacity
                            onPress={() => setarrPlaidCreditCardAccounts([])}
                            activeOpacity={0.7}
                            style={{ width: '100%', height: RFValue(35) }}
                        >
                            <Text style={{
                                fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiSmall,
                                letterSpacing: 0.4, textAlign: 'center', marginTop: 15,
                                textDecorationLine: 'underline'
                            }}>Change</Text>
                        </TouchableOpacity>
                    ) : (
                        <View></View>
                    )
                }

            </TouchableOpacity>
        )
    }

    function tosClicked() {
        setisShowingTerms(true)
    }

    function bankItemClicked(item) {
        if (arrPlaidBankAccounts.length == 1) {
            return
        }

        let arrT = []
        arrPlaidBankAccounts.forEach(element => {
            console.log(element)
            if (item.account_id == element.account_id) {
                arrT.push(element)
                setplaidBankAccountId(element.account_id)
            }
        });
        setarrPlaidBankAccounts(arrT)
    }

    function renderBankAccountItem({ item, index }) {
        return (
            <TouchableOpacity
                onPress={() => bankItemClicked(item)}
                activeOpacity={arrPlaidBankAccounts.length == 1 ? 1 : 0.7}
                style={{ width: '90%', alignSelf: 'center' }}>
                <CardView cardElevation={2} style={{ width: '100%', alignSelf: 'center', marginTop: 15 }}>
                    <View style={{ backgroundColor: 'white', padding: 15 }}>
                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Name: </Text>
                            <Text>{item.name}</Text>
                        </Text>
                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Type: </Text>
                            <Text>{item.type}</Text>
                        </Text>

                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Sub Type: </Text>
                            <Text>{item.subtype}</Text>
                        </Text>

                        <Text style={{
                            letterSpacing: 0.4,
                            fontFamily: Theme.fontFamily.regular,
                            fontSize: Theme.fontSize.regular
                        }}>
                            <Text style={{ fontFamily: Theme.fontFamily.medium }}>Mask: </Text>
                            <Text>{"**** " + item.mask}</Text>
                        </Text>

                    </View>
                </CardView>
                {
                    arrPlaidBankAccounts.length == 1 ? (
                        <TouchableOpacity
                            onPress={() => setarrPlaidBankAccounts([])}
                            activeOpacity={0.7}
                            style={{ width: '100%', height: RFValue(35) }}
                        >
                            <Text style={{
                                fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiSmall,
                                letterSpacing: 0.4, textAlign: 'center', marginTop: 15,
                                textDecorationLine: 'underline'
                            }}>Change Bank Account</Text>
                        </TouchableOpacity>
                    ) : (
                        <View></View>
                    )
                }

            </TouchableOpacity>
        )
    }

    function btnGoBackClicked() {
        if (selectedTab == 1) {
            setselectedTab(0)
        }
        else {

            let param = {
                missionary_user_id: currentUser.missionary.user_id
            }
            setisLoading(true)
            CALL_API("deleteMissionary", param).then((res) => {
                setisLoading(false)
                if (res.errMsg != null) {
                    Reload_API_Alert(res.errMsg).then((res) => {
                        if (res) {
                            btnGoBackClicked()
                        }
                    })
                    return
                }
                if (res.status == 1) {
                    syncUserWithServer().then((res) => {
                        if (res) {
                            currentUser = getCurrentUserData()
                        }
                    })
                    props.navigation.navigate("missionarySelectionListView1")
                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                    setarrPlaidBankAccounts([])
                    setarrPlaidCreditCardAccounts([])
                }
            })
        }
    }

    function btnAddDifferentBankCardClicked() {
        setarrPlaidCreditCardAccounts([])
        setisStepToInitialLoad(false)
    }

    function onRequestCloseTerms() {
        setisShowingTerms(false)
    }

    let bankAccountUsageInformation = (
        <View style={{ flex: arrPlaidBankAccounts.length == 0 ? 1 : 0, marginTop: 20, marginBottom: 10 }}>
            <Text style={{
                fontFamily: Theme.fontFamily.light,
                fontSize: Theme.fontSize.small, textAlign: 'center',
                margin: 10
            }}>We will round up every transaction from your connected card to the nearest dollar. For example, $7.25 will collect $.75 cents for your missionary. Once the total reaches a minimum of $10, the total amount of round ups will be send using this bank account.</Text>
        </View>
    )

    let creditCardUsageInformation = (
        <View style={{ flex: arrPlaidCreditCardAccounts.length == 0 ? 1 : 0, marginTop: 20, marginBottom: 10 }}>
            <Text style={{
                fontFamily: Theme.fontFamily.light,
                fontSize: Theme.fontSize.small, textAlign: 'center',
                margin: 10
            }}>We will use this card for round up to the nearest dollar. For example, $7.25 will collect $.75 cents for your missionary.</Text>
        </View>
    )

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <Loader loading={isLoading} refParentView={_this} />
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>
                            <TouchableOpacity activeOpacity={0.7}
                                style={styContainer.sideMenuContainerLeft}
                                onPress={() => btnGoBackClicked()}
                            >
                                <Image
                                    style={[styContainer.sideMenuIcon]}
                                    source={Theme.icons.ic_go_back}>
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
                    kDoRender ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: RFValue(130), marginTop: RFValue(-5) }}>
                            <View style={{ position: 'absolute', width: '100%', height: 3, backgroundColor: '#EAEAEA' }}></View>
                            <Image resizeMode="contain" style={{ right: '45%', position: 'absolute', width: RFValue(11) }} source={Theme.icons.ic_step_next_arrow}></Image>
                            <View>
                                <TouchableOpacity activeOpacity={0.8} onPress={() => setselectedTab(0)}>
                                    <CardView cornerRadius={17.5} cardElevation={Platform.OS == "android" ? 4 : 2} style={[styContainer.missionaryGoalStepView, { marginTop: 18, marginRight: 60, backgroundColor: selectedTab == 0 ? Theme.colors.sendMeBlue : 'white' }]}>
                                        <Text style={[styContainer.missionaryGoalStepTextView, { color: selectedTab == 0 ? 'white' : "#BBBBBB" }]}>1</Text>
                                    </CardView>
                                </TouchableOpacity>
                                <Text style={[styContainer.missionaryGoalStepTextView, { fontFamily: Theme.fontFamily.regular, marginTop: 5, color: selectedTab == 0 ? Theme.colors.sendMeBlue : "#BBBBBB" }]}>STEP</Text>
                            </View>
                            <View>

                                <CardView cornerRadius={17.5} cardElevation={Platform.OS == "android" ? 4 : 2} style={[styContainer.missionaryGoalStepView, { marginTop: 18, backgroundColor: selectedTab == 1 ? Theme.colors.sendMeBlue : 'white' }]}>
                                    <Text style={[styContainer.missionaryGoalStepTextView, { color: selectedTab == 1 ? 'white' : '#BBBBBB' }]}>2</Text>
                                </CardView>

                                <Text style={[styContainer.missionaryGoalStepTextView, { fontFamily: Theme.fontFamily.regular, marginTop: 5, color: selectedTab == 1 ? Theme.colors.sendMeBlue : "#BBBBBB" }]}>STEP</Text>
                            </View>
                        </View>
                    ) : (
                        <View></View>
                    )
                }

                {
                    selectedTab == 0 && kDoRender ? (
                        arrPlaidBankAccounts.length == 0 ? (

                            <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                                <Text style={styContainer.stepTitle}>Add Bank Account</Text>
                                {bankAccountUsageInformation}
                                <View style={{
                                    alignSelf: 'center',
                                    width: '85%', alignItems: 'center',
                                    marginBottom: 20, justifyContent: 'center', marginTop: -50
                                }}>

                                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
                                        <TouchableOpacity
                                            onPress={() => btnTosAcceptClicked()}
                                            activeOpacity={0.7}
                                            style={{ height: RFValue(30), width: RFValue(30), justifyContent: 'center', alignItems: 'center' }}>
                                            <CardView cardElevation={1}>
                                                <Image style={{ tintColor: tosAccepted ? 'black' : '#c9c9c9', height: RFValue(22), width: RFValue(22) }} source={tosAccepted ? Theme.icons.ic_checked : Theme.icons.ic_unchecked}></Image>
                                            </CardView>
                                        </TouchableOpacity>
                                        <Text style={{
                                            marginLeft: RFValue(5), letterSpacing: 0.4, flex: 1,
                                            fontFamily: Theme.fontFamily.regular,
                                            fontSize: Theme.fontSize.semiSmall1,
                                            color: Theme.colors.sendMeBlack
                                        }}>
                                            <Text>
                                                {"By selecting, I agree to send payments to the missionary of my choosing based on the following "}
                                            </Text>
                                            <Text onPress={() => tosClicked()} style={{ color: Theme.colors.sendMeBlue }}>
                                                terms.
                                            </Text>
                                        </Text>
                                    </View>
                                    {
                                        selectedTab == 0 ? (
                                            tosAccepted ? (
                                                <View style={{ backgroundColor: Theme.colors.sendMeBlue, width: '100%', alignItems: 'center' }}>
                                                    <PlaidLink
                                                        // Replace any of the following <#VARIABLE#>s according to your setup,
                                                        // for details see https://plaid.com/docs/quickstart/#client-side-link-configuration
                                                        publicKey={AppConstants.plaid_public_key_dev}
                                                        clientName='SendMe'
                                                        env='development'  // 'sandbox' or 'development' or 'production'

                                                        product={["auth", "transactions"]}
                                                        onSuccess={data => loadPlaidBankData(data)}
                                                        onExit={data => onPlaidError(data)}
                                                        onCancelled={(result) => { console.log('Cancelled: ', result) }}
                                                    >
                                                        <Text style={{
                                                            paddingTop: 10, paddingBottom: 10,
                                                            paddingRight: '18%',
                                                            paddingLeft: '18%',
                                                            width: '100%',
                                                            fontFamily: Theme.fontFamily.medium,
                                                            color: 'white', fontSize: Theme.fontSize.small
                                                        }}>{"Link your bank account"}</Text>
                                                    </PlaidLink>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => Alert.alert("Please read and accept terms.")}
                                                    activeOpacity={0.8}
                                                    style={{ backgroundColor: Theme.colors.sendMeBlue, width: '100%', alignItems: 'center' }}>
                                                    <Text style={{
                                                        padding: 10,
                                                        fontFamily: Theme.fontFamily.medium,
                                                        color: 'white', fontSize: Theme.fontSize.small
                                                    }}>Link your bank account</Text>
                                                </TouchableOpacity>
                                            )
                                        ) : (
                                            <View></View>
                                        )
                                    }

                                </View>
                            </View>
                        ) : (

                            <View style={{ flex: 1, width: '100%', marginTop: 20 }}>

                                {bankAccountUsageInformation}

                                <Text style={[styContainer.stepTitle, { fontSize: Theme.fontSize.regular }]}>{plaidBankAccountName}</Text>
                                {
                                    arrPlaidBankAccounts.length == 1 ? (
                                        <Text style={[styContainer.stepTitle, { marginTop: 5 }]}>Bank Account Details</Text>
                                    ) : (
                                        <Text style={[styContainer.stepTitle, {
                                            marginTop: 5,
                                            color: 'red', fontSize: Theme.fontSize.semiSmall, textAlign: 'center', paddingLeft: 5, paddingRight: 5
                                        }]}>Please choose Bank</Text>
                                    )
                                }

                                <FlatList
                                    keyboardShouldPersistTaps={'handled'}
                                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 20 }}
                                    style={{ width: '100%', flex: 1, marginTop: 5 }}
                                    data={arrPlaidBankAccounts}
                                    renderItem={renderBankAccountItem}
                                    keyExtractor={(item, index) => index}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                />
                                {
                                    arrPlaidBankAccounts.length == 1 ? (
                                        <TouchableOpacity
                                            onPress={() => btnStepClicked(1)}
                                            activeOpacity={0.8}
                                            style={{
                                                alignSelf: 'center',
                                                backgroundColor: Theme.colors.sendMeBlue,
                                                width: '90%', alignItems: 'center', marginBottom: 10
                                            }}>
                                            {
                                                btnShowLoading ? (
                                                    <View style={{ padding: 10, }}>
                                                        <ActivityIndicator size="small" color="white" />
                                                    </View>
                                                )
                                                    : (
                                                        <Text style={{
                                                            padding: 10,
                                                            fontFamily: Theme.fontFamily.medium,
                                                            color: 'white', fontSize: Theme.fontSize.small
                                                        }}>Next</Text>
                                                    )
                                            }

                                        </TouchableOpacity>
                                    ) : (
                                        <View></View>
                                    )
                                }

                            </View>
                        )
                    ) : (


                        arrPlaidCreditCardAccounts.length == 0 && kDoRender ? (

                            <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                                <Text style={styContainer.stepTitle}>Add Credit Card</Text>
                                {creditCardUsageInformation}

                                <View style={{ backgroundColor: Theme.colors.sendMeBlue, width: '90%', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
                                    <PlaidLink
                                        // Replace any of the following <#VARIABLE#>s according to your setup,
                                        // for details see https://plaid.com/docs/quickstart/#client-side-link-configuration
                                        publicKey={AppConstants.plaid_public_key_dev}
                                        clientName='SendMe'
                                        env='development'  // 'sandbox' or 'development' or 'production'

                                        product={["auth", "transactions"]}
                                        onSuccess={data => loadPlaidCCardData(data)}
                                        onExit={data => onPlaidError(data)}
                                        onCancelled={(result) => { console.log('Cancelled: ', result) }}
                                    >
                                        <Text style={{
                                            paddingTop: 10, paddingBottom: 10,
                                            paddingRight: '18%',
                                            paddingLeft: '18%',
                                            width: '100%',
                                            fontFamily: Theme.fontFamily.medium,
                                            color: 'white', fontSize: Theme.fontSize.small
                                        }}>{"Link Account For Round-Ups"}</Text>
                                    </PlaidLink>
                                </View>
                            </View>
                        ) : (

                            kDoRender ? (
                                isStepToInitialLoad ? (
                                    <View style={{ flex: 1, width: '100%', marginTop: 20, justifyContent: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() => setisStepToInitialLoad(false)}
                                            activeOpacity={0.8}
                                            style={{
                                                alignSelf: 'center',
                                                backgroundColor: Theme.colors.sendMeBlue,
                                                width: '90%', alignItems: 'center'
                                            }}>

                                            <Text style={{
                                                padding: 10,
                                                paddingLeft: 15, paddingRight: 15,
                                                fontFamily: Theme.fontFamily.medium, textAlign: 'center',
                                                color: 'white', fontSize: Theme.fontSize.small
                                            }}>Use same bank for transactions to round-up</Text>


                                        </TouchableOpacity>
                                        <Text style={{
                                            padding: 15, fontSize: Theme.fontSize.small,
                                            fontFamily: Theme.fontFamily.bold, textAlign: 'center'
                                        }}>OR</Text>
                                        <TouchableOpacity
                                            onPress={() => btnAddDifferentBankCardClicked()}
                                            activeOpacity={0.8}
                                            style={{
                                                alignSelf: 'center',
                                                backgroundColor: "#b5b5b5",
                                                width: '90%', alignItems: 'center'
                                            }}>

                                            <Text style={{
                                                padding: 10,
                                                paddingLeft: 15, paddingRight: 15,
                                                fontFamily: Theme.fontFamily.medium,
                                                color: 'black', fontSize: Theme.fontSize.small
                                            }}>Add a new credit card for transactions to round-up</Text>


                                        </TouchableOpacity>
                                        <View style={{ height: 60 }}></View>
                                    </View>
                                ) : (
                                    <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                                        {creditCardUsageInformation}
                                        <Text style={[styContainer.stepTitle, { fontSize: Theme.fontSize.regular }]}>{plaidCCAccountName}</Text>

                                        {
                                            arrPlaidCreditCardAccounts.length == 1 ? (
                                                <Text style={[styContainer.stepTitle, { marginTop: 5 }]}>Credit Card Details</Text>
                                            ) : (
                                                <Text style={[styContainer.stepTitle, {
                                                    marginTop: 5,
                                                    color: 'red', fontSize: Theme.fontSize.semiSmall, textAlign: 'center', paddingLeft: 5, paddingRight: 5
                                                }]}>Please choose one card of Round Up</Text>
                                            )
                                        }
                                        <FlatList
                                            keyboardShouldPersistTaps={'handled'}
                                            contentContainerStyle={{ paddingTop: 5, paddingBottom: 20 }}
                                            style={{ width: '100%', flex: 1, marginTop: 5 }}
                                            data={arrPlaidCreditCardAccounts}
                                            renderItem={renderCreditCardAccountItem}
                                            keyExtractor={(item, index) => index}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={false}
                                        />
                                        {
                                            arrPlaidCreditCardAccounts.length == 1 ? (
                                                <TouchableOpacity
                                                    onPress={() => btnLinkingBankAccountClicked()}
                                                    activeOpacity={0.8}
                                                    style={{
                                                        alignSelf: 'center',
                                                        backgroundColor: Theme.colors.sendMeBlue,
                                                        width: '90%', alignItems: 'center', marginBottom: 10
                                                    }}>
                                                    {
                                                        btnShowLoading ? (
                                                            <View style={{ padding: 10, }}>
                                                                <ActivityIndicator size="small" color="white" />
                                                            </View>
                                                        )
                                                            : (
                                                                <Text style={{
                                                                    padding: 10,
                                                                    fontFamily: Theme.fontFamily.medium,
                                                                    color: 'white', fontSize: Theme.fontSize.small
                                                                }}>Continue</Text>
                                                            )
                                                    }

                                                </TouchableOpacity>
                                            ) : (
                                                <View></View>
                                            )

                                        }

                                    </View>
                                )

                            ) : (
                                <View></View>
                            )


                        )



                    )

                }

                <KeyboardAccessoryView />
            </View>

            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isShowingTerms}
                onRequestClose={() => { onRequestCloseTerms() }}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>

                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center', height: '80%' }}>

                        <View style={{ alignItems: 'center', padding: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
                            <View style={{ height: 35, width: 35 }}></View>
                            <Text style={{
                                textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiMedium
                            }}>Terms</Text>
                            <TouchableOpacity onPress={() => onRequestCloseTerms()} style={{ height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    style={{ height: 25, width: 25 }}
                                    source={Theme.icons.ic_close}></Image>
                            </TouchableOpacity>
                        </View>


                        <ScrollView>
                            <Text allowFontScaling={false} style={{
                                fontFamily: Theme.fontFamily.light, letterSpacing: 0.5,
                                fontSize: Theme.fontSize.semiRegular, padding: 15,
                            }}>
                                {AppConstants.StringLiterals.strAddBankSponsorTos}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isChoosingSingleCardModal}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>

                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center', height: '80%' }}>

                        <View style={{ alignItems: 'center', padding: 10, justifyContent: 'center', flexDirection: 'row' }}>

                            <Text style={{
                                textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiMedium
                            }}>{'Choose One Card'}</Text>

                        </View>

                    </View>
                </View>
            </Modal>

        </SafeAreaView >
    )
}

export default sponsarGetBankAndCardInfoView


sponsarGetBankAndCardInfoView['navigationOptions'] = screenProps => ({
    header: null
})


var DEFAULT_CVC_LENGTH = 3;
var DEFAULT_ZIP_LENGTH = 5;
var DEFAULT_CARD_FORMAT = /(\d{1,4})/g;
var CARD_TYPES = [{
    type: 'amex',
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    startPattern: /^3[47]/,
    maxCardNumberLength: 15,
    cvcLength: 4,
    icon: Theme.icons.ic_card_amex,
}, {
    type: 'dankort',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^5019/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_dankort,
}, {
    type: 'hipercard',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
    maxCardNumberLength: 19,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_hipercard,
}, {
    type: 'dinersclub',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(36|38|30[0-5])/,
    maxCardNumberLength: 14,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_diners_club,
}, {
    type: 'discover',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(6011|65|64[4-9]|622)/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_discover,
}, {
    type: 'jcb',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^35/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_jcb,
}, {
    type: 'laser',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(6706|6771|6709)/,
    maxCardNumberLength: 19,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_laser,
}, {
    type: 'maestro',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(5018|5020|5038|6304|6703|6708|6759|676[1-3])/,
    maxCardNumberLength: 19,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_maestro,
}, {
    type: 'mastercard',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_mastrer_card,
}, {
    type: 'unionpay',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^62/,
    maxCardNumberLength: 19,
    cvcLength: DEFAULT_CVC_LENGTH,
    luhn: false,
    icon: Theme.icons.ic_card_unionpay,
}, {
    type: 'visaelectron',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^4(026|17500|405|508|844|91[37])/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_visa_electron,
}, {
    type: 'elo',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/,
    maxCardNumberLength: 16,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_elo,
}, {
    type: 'visa',
    format: DEFAULT_CARD_FORMAT,
    startPattern: /^4/,
    maxCardNumberLength: 19,
    cvcLength: DEFAULT_CVC_LENGTH,
    icon: Theme.icons.ic_card_visa,
}];

var getCardTypeByValue = function getCardTypeByValue(value) {
    return CARD_TYPES.filter(function (cardType) {
        return cardType.startPattern.test(value);
    })[0];
};
var getCardTypeByType = function getCardTypeByType(type) {
    return CARD_TYPES.filter(function (cardType) {
        return cardType.type === type;
    })[0];
};

var formatCardNumber = function formatCardNumber(cardNumber) {
    var cardType = getCardTypeByValue(cardNumber);
    if (!cardType) return (cardNumber.match(/\d+/g) || []).join('');
    var format = cardType.format;

    if (format.global) {
        return cardNumber.match(format).join(' ');
    }
    var execResult = format.exec(cardNumber.split(' ').join(''));
    if (execResult) {
        return execResult.splice(1, 3).filter(function (x) {
            return x;
        }).join(' ');
    }
    return cardNumber;
};

var formatExpiry = function formatExpiry(expValue) {
    //var eventData = event.nativeEvent && event.nativeEvent.data;
    var prevExpiry = expValue//event.target.value.split(' / ').join('/');

    if (!prevExpiry) return null;
    var expiry = prevExpiry;
    if (/^[2-9]$/.test(expiry)) {
        expiry = '0' + expiry;
    }

    if (prevExpiry.length === 2 && +prevExpiry > 12) {
        var _prevExpiry = toArray(prevExpiry),
            head = _prevExpiry[0],
            tail = _prevExpiry.slice(1);

        expiry = '0' + head + '/' + tail.join('');
    }

    if (/^1[/-]$/.test(expiry)) {
        return '01 / ';
    }

    expiry = expiry.match(/(\d{1,2})/g) || [];
    if (expiry.length === 1) {
        if (prevExpiry.includes('/')) {
            return expiry[0];
        }
        if (/\d{2}/.test(expiry)) {
            return expiry[0] + ' / ';
        }
    }
    if (expiry.length > 2) {
        var _ref = expiry.join('').match(/^(\d{2}).*(\d{2})$/) || [],
            _ref2 = slicedToArray(_ref, 3),
            month = _ref2[1],
            year = _ref2[2];

        return [month, year].join(' / ');
    }
    return expiry.join(' / ');
};

var slicedToArray = function () {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);

                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }

        return _arr;
    }

    return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

var toArray = function (arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
};