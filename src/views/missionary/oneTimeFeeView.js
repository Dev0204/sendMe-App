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
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Animatable from 'react-native-animatable';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
import FastImage from 'react-native-fast-image';

import RNIap, {
    purchaseErrorListener,
    purchaseUpdatedListener,
    type ProductPurchase,
    type PurchaseError
} from 'react-native-iap';
import { EventRegister } from 'react-native-event-listeners';


var _this = null
var currentUser = {}
let serverConfig = {}

export default class OneTimeFeeView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        this.state = {
            btnLoading: false,
            tosAccepted: false,
            ani_validate: null,
            txt_coupon_code: "",
            isAddingCouponModal: false,
            btnLoadingCoupon: false,
            isBtnSubmitClicked: false
        }
    }

    componentDidMount() {

        this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: InAppPurchase | SubscriptionPurchase | ProductPurchase) => {
            console.log('purchaseUpdatedListener', purchase);
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                await RNIap.finishTransaction(purchase, true)
                let param = {
                    transaction_receipt: receipt
                }
                _this.purchaseComplete(param)
            }
        });

        this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
            console.log('purchaseErrorListener', error);
            if (error.code == "E_ALREADY_OWNED") {
                _this.getPurchaseHistory()
            }
            else if (error.code == "E_USER_CANCELLED") {
                let objFirbaseEvent = {
                    eventTitle: "button_clicked",
                    eventObject: {
                        button: "in_app_purchase_canceled_by_missionary"
                    }
                }
                EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
            }
        });
    }

    async getPurchaseHistory() {
        let history = await RNIap.getPurchaseHistory()
        console.log(history)
        if (history.length > 0) {
            let receipt = history[0]
            let param = {
                transaction_receipt: receipt.transactionReceipt
            }
            _this.purchaseComplete(param)
        }
    }

    purchaseComplete(param) {
        _this.setState({
            btnLoading: true
        })
        CALL_API("oneTimeFeeSuccess", param).then(async (res) => {
            _this.setState({
                btnLoading: false
            })

            if (res.status == 1) {
                _this.props.navigation.navigate("missionaryHomeView")
            }
        })
    }

    componentWillUnmount() {
        if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
            this.purchaseErrorSubscription.remove();
            this.purchaseErrorSubscription = null;
        }
    }

    async btnInAppClicked() {
        if (!_this.state.tosAccepted) {
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
        if (_this.state.btnLoading) {
            return
        }

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "missionary_in_app_purchase_continue"
            }
        }

        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        const itemSkus = Platform.select({
            ios: [
                'com.app.sendme.onetimefee'
            ],
            android: [
                'com.app.sendme.onetimefee'
            ]
        });

        try {
            _this.setState({
                btnLoading: true
            })
            const products = await RNIap.getProducts(itemSkus);
            if (products.length > 0) {
                let pId = products[0].productId
                _this.setState({
                    btnLoading: true
                })
                await RNIap.requestPurchase(pId, false);
                _this.setState({
                    btnLoading: false
                })
            }
            else {
                _this.setState({
                    btnLoading: false
                })
                Alert.alert("Fail to get in app purchase product. Please contact sendMe support.")
            }
            //await RNIap.requestPurchase(sku, false);


        } catch (err) {
            _this.setState({
                btnLoading: false
            })
            Alert.alert(err.message)
            console.log(err); // standardized err.code and err.message available
        }

    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    btnTosAcceptClicked() {
        if (this.state.tosAccepted) {
            setTimeout(() => {
                this.setState({
                    tosAccepted: false
                })
            }, 50);
        }
        else {
            this.setState({
                tosAccepted: true
            })
        }

    }

    txtPromoClick() {
        if (!_this.state.tosAccepted) {
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
        this.setState({
            isAddingCouponModal: true
        })
    }

    onRequestClosePopUp() {
        this.setState({
            isAddingCouponModal: false
        })
    }


    btnApplyClicked() {
        _this.setState({
            isBtnSubmitClicked: true
        })

        if (_this.state.txt_coupon_code.trim() == "") {
            return
        }
        if (_this.state.btnLoadingCoupon) {
            return
        }
        _this.setState({
            btnLoadingCoupon: true
        })
        let param = {
            coupon_code: _this.state.txt_coupon_code.trim()
        }
        CALL_API("validateCode", param).then((res) => {
            _this.setState({
                btnLoadingCoupon: false
            })
            if (res.status == 1) {
                _this.setState({
                    isAddingCouponModal: false
                })
                setTimeout(() => {
                    Alert.alert("Congratulations!", res.msg, [
                        {
                            text: "Okay", onPress: () => {
                                setTimeout(() => {
                                    _this.props.navigation.navigate("missionaryHomeView")
                                }, 50);
                            }
                        },
                    ])
                }, 100);
            }
            else {
                Alert.alert(res.msg)
            }
        })
    }

    render() {
        return (
            <SafeAreaView style={styContainer.windowContainer}>
                <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                        <View style={styContainer.navigationCustomHeaderp}>
                            <View style={styContainer.navigationCustomHeaderq}>

                                <View style={styContainer.sideMenuContainerLeft}>
                                </View>


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
                    <View style={{ flex: 1, alignItems: 'center', padding: 10, marginTop: 20 }}>
                        <Text style={{
                            fontSize: Theme.fontSize.semiMedium, textAlign: 'center',
                            fontFamily: Theme.fontFamily.bold, letterSpacing: 0.8
                        }}>One-time Missionary Set-up Fee</Text>
                        <Text style={{
                            fontSize: Theme.fontSize.semiRegular,
                            padding: 10, fontFamily: Theme.fontFamily.light,
                            letterSpacing: 0.8, marginTop: 20
                        }}>We incur costs for every missionary we sign up and there sponsors from  the integrations of connecting bank accounts and credit cards. This one-time fee ensures your sincerity of getting users on the platform and costs associated with setting up the account.
                        </Text>
                    </View>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <Animatable.View
                            animation={this.state.ani_validate} style={{ width: '100%', padding: 14, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
                            <TouchableOpacity
                                onPress={() => this.btnTosAcceptClicked()}
                                activeOpacity={0.7}
                                style={{ height: RFValue(30), width: RFValue(30), justifyContent: 'center', alignItems: 'center' }}>
                                <CardView cardElevation={1}>
                                    <Image style={{ tintColor: this.state.tosAccepted ? 'black' : '#c9c9c9', height: RFValue(22), width: RFValue(22) }} source={this.state.tosAccepted ? Theme.icons.ic_checked : Theme.icons.ic_unchecked}></Image>
                                </CardView>
                            </TouchableOpacity>
                            <Text style={{
                                marginLeft: RFValue(5), letterSpacing: 0.5, flex: 1,
                                fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiSmall1,
                                color: Theme.colors.sendMeBlack
                            }}>
                                <Text>
                                    {"By selecting this box, I agree to the one-time payment for setting up this account."}
                                </Text>
                            </Text>
                        </Animatable.View>

                        <Text
                            onPress={() => this.txtPromoClick()}
                            style={{
                                padding: 14, paddingTop: 10, textAlign: 'center',
                                marginBottom: 10, fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiSmall
                            }}>
                            <Text>
                                {"If you have a code, please enter "}
                            </Text>
                            <Text style={{ color: Theme.colors.sendMeBlue, textDecorationLine: 'underline' }}>HERE</Text>
                        </Text>

                        <CustomButton title="Continue"
                            isLoading={this.state.btnLoading}
                            onButtonClicked={this.btnInAppClicked} />
                    </View>

                </View>

                <Modal useNativeDriver={true}
                    transparent={true}
                    animationType={'fade'}

                    visible={this.state.isAddingCouponModal}
                    onRequestClose={() => { this.onRequestClosePopUp() }}>
                    <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>

                        <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center', height: '80%' }}>

                            <View style={{ alignItems: 'center', padding: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
                                <View style={{ height: 35, width: 35 }}></View>
                                <Text style={{
                                    textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semiMedium
                                }}>{'Apply Coupon Code'}</Text>
                                <TouchableOpacity onPress={() => this.onRequestClosePopUp()} style={{ height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image
                                        style={{ height: 25, width: 25 }}
                                        source={Theme.icons.ic_close}></Image>
                                </TouchableOpacity>
                            </View>


                            <KeyboardAwareScrollView

                                automaticallyAdjustContentInsets={false}
                                contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}
                                keyboardShouldPersistTaps={'handled'}
                                style={{ width: '100%', flex: 1 }}>



                                <View style={{ height: 20 }}></View>
                                <CustomTextInputView
                                    attrName='txt_coupon_code'
                                    title={"Coupon Code"}
                                    value={this.state.txt_coupon_code}
                                    isErrorRedBorder={(this.state.txt_coupon_code.trim().length == 0 && this.state.isBtnSubmitClicked) ? true : false}
                                    updateMasterState={this._updateMasterState}
                                    otherTextInputProps={{
                                        placeholder: "Enter Coupon Code",
                                        autoCorrect: false,
                                        autoCapitalize: 'none'
                                    }}
                                />




                            </KeyboardAwareScrollView>
                            <View style={{ marginBottom: 10 }}>

                                <CustomButton title={"Apply"}
                                    isLoading={this.state.btnLoadingCoupon}
                                    onButtonClicked={this.btnApplyClicked} />



                            </View>

                        </View>
                    </View>
                </Modal>

            </SafeAreaView >
        )
    }
}