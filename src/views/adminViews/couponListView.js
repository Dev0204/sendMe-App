import React, { useEffect, useState, useRef } from 'react';
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
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';

import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import moment from 'moment';

var currentUser = {}
let serverConfig = {}
let arrUserT = []
let isUpdate = false
let isFromMenu = false
let branchMissionary_Id = false

const couponListView = (props) => {

    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()
    arrUserT = []
    isUpdate = props.navigation.getParam("is_update", false)
    isFromMenu = props.navigation.getParam("is_from_menu", false)
    branchMissionary_Id = props.navigation.getParam("branch_missionary_id", false)
    const [arrCoupon, setarrCoupon] = useState([])
    const [selectedMissionaryItemUserId, setselectedMissionaryItemUserId] = useState("")
    const [btnLoading, setbtnLoading] = useState(false)
    const [btnLoadingDelete, setbtnLoadingDelete] = useState(false)
    const [txt_coupon_code, settxt_coupon_code] = useState("")
    const [isPullToRefreshing, setisPullToRefreshing] = useState(false)
    const [kDoRender, setkDoRender] = useState(false)
    const [isAddingCouponModal, setisAddingCouponModal] = useState(false)
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [isCouponActive, setisCouponActive] = useState(true)
    const [couponIsAdding, setcouponIsAdding] = useState(true)
    const [selectedItem, setselectedItem] = useState(false)
    const [ani_validate, setani_validate] = useState(null)
    const [btnShowLoading, setbtnShowLoading] = useState(false)

    useEffect(() => {
        console.log("~~~~~~~")
        console.log(currentUser)
        console.log("~~~~~~~")
        // if (isUpdate) {
        //     this.setState({
        //         selectedMissionaryItemUserId: currentUser.missionary.user_id
        //     })
        // }

        getAllCoupons()

        // this.reloadAdminMissionary = EventRegister.addEventListener('reloadAdminMissionary', (data) => {
        //     _this.setState({
        //         txt_search: ""
        //     })
        //     _this.getAllMissionaries()
        // })

        return () => {
            // EventRegister.removeEventListener(reloadAdminMissionary)
        }
    }, [])


    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    const _updateMasterState = (attrName, value) => {
        settxt_coupon_code(value)
    }

    function getAllCoupons() {
        let param = {
            user_time_zone: serverConfig.time_zone
        }
        CALL_API("getAllCoupon", param).then((res) => {
            console.log(res)
            setisPullToRefreshing(false)
            setkDoRender(true)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        getAllCoupons()
                    }
                })
                return
            }
            arrUserT = res.data
            if (res.status == 1) {
                setarrCoupon(res.data)
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }


    function onPullToRefresh() {
        setisPullToRefreshing(true)
        getAllCoupons()
    }

    function btnOnItemClicked(item) {
        console.log(item)
        setselectedItem(item)
        setcouponIsAdding(false)
        settxt_coupon_code(item.coupon_text)
        setisCouponActive(item.is_enabled == 1 ? true : false)
        setisAddingCouponModal(true)
        // this.props.navigation.navigate("adminMissionaryProfileView", {
        //     selectedMissionary: item
        // })
    }

    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    function onRequestClosePopUp() {
        setisAddingCouponModal(false)
        setisBtnSubmitClicked(false)
        setcouponIsAdding(false)
    }

    function btnAddCodeClicked() {
        setcouponIsAdding(true)
        setisAddingCouponModal(true)
        settxt_coupon_code("")
        setisCouponActive(true)
    }

    function btnDeleteCodeClicked() {
        Alert.alert("Are you sure you want to delete this coupon", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", onPress: () => {
                    setTimeout(() => {
                        doDeleteCoupon()
                    }, 50);

                }
            },
        ], { cancelable: true })

    }

    function doDeleteCoupon() {
        let param = {
            "coupon_id": selectedItem.coupon_id
        }

        if (btnLoadingDelete) {
            return
        }

        setbtnLoadingDelete(true)
        CALL_API("deleteCoupon", param).then((res) => {
            setbtnLoadingDelete(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        doDeleteCoupon()
                    }
                })
                return
            }

            if (res.status == 1) {
                resetState()
                getAllCoupons()
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function btnUpdateCodeClicked() {
        setisBtnSubmitClicked(true)
        if (txt_coupon_code.trim() == "") {
            return
        }

        if (btnLoading) {
            return
        }

        let isActive = isCouponActive ? "true" : "false"
        let param = {
            "coupon_code": txt_coupon_code,
            "is_active": isActive,
            "code_id": selectedItem.coupon_id
        }

        setbtnLoading(true)
        CALL_API("editCoupon", param).then((res) => {
            console.log("update res==>", res);
            setbtnLoading(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnUpdateCodeClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                resetState()
                getAllCoupons()
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })

    }

    function btnAddNewCodeClicked() {
        setisBtnSubmitClicked(true)
        if (txt_coupon_code.trim() == "") {
            return
        }

        if (btnLoading) {
            return
        }

        let isActive = isCouponActive ? "true" : "false"
        let param = {
            "coupon_code": txt_coupon_code,
            "is_active": isActive
        }
        setbtnLoading(true)
        CALL_API("addNewCoupon", param).then((res) => {
            setbtnLoading(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnAddNewCodeClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                resetState()
                getAllCoupons()
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function resetState() {
        setisAddingCouponModal(false)
        setisCouponActive(true)
        setisBtnSubmitClicked(false)
        setbtnShowLoading(false)
        settxt_coupon_code("")
        setbtnLoading(false)
    }

    function btnActiveClicked() {
        if (isCouponActive) {
            setisCouponActive(false)
            setTimeout(() => {
            }, 50);
        }
        else {
            setisCouponActive(true)
        }
    }

    function renderCouponItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
                <TouchableOpacity
                    onPress={() => btnOnItemClicked(item)}
                    activeOpacity={0.9}
                    style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row' }}>


                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1, width: 50 }]}>{"Coupon Code: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{item.coupon_text}</Text>
                        </Text>

                        <Text style={{ marginTop: 5 }}>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"Is Active: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{item.is_enabled ? 'Yes' : 'No'}</Text>
                        </Text>
                        <Text style={{ marginTop: 5 }}>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"Total Redeemed: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{item.total_redeemed}</Text>
                        </Text>

                        <Text style={{ marginTop: 5 }}>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"Created At: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{moment(item.post_date).format("MM/DD/YYYY")}</Text>
                        </Text>

                    </View>
                    <View style={{ justifyContent: 'center', marginRight: 0 }}>
                        <Image
                            style={{ height: 12, width: 12 }}
                            source={Theme.icons.ic_right_arrow}
                        ></Image>
                    </View>
                </TouchableOpacity>
            </CardView>
        )
    }

    const rf_end_time = useRef(null)

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>



                            <TouchableOpacity activeOpacity={0.7}
                                style={styContainer.sideMenuContainerLeft}
                                onPress={() => btnGoBackClicked()}
                            >
                                <Image
                                    style={styContainer.sideMenuIcon}
                                    source={isFromMenu ? Theme.icons.ic_sidemenu : Theme.icons.ic_go_back}>
                                </Image>
                            </TouchableOpacity>

                            <Image
                                resizeMode="contain"
                                style={{ height: RFValue(90) }}
                                source={Theme.icons.ic_app_logo}>
                            </Image>

                            <TouchableOpacity activeOpacity={0.7}
                                style={[styContainer.sideMenuContainerRight, {}]}
                                onPress={() => btnAddCodeClicked()}
                            >
                                <Text style={{
                                    fontFamily: Theme.fontFamily.bold,
                                    fontSize: Theme.fontSize.small, letterSpacing: 0.5
                                }}>ADD</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </CardView>
                {
                    kDoRender && arrCoupon.length == 0 ? (
                        <View style={{ marginTop: -60, flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Theme.fontFamily.regular, letterSpacing: 0.5 }}>No Coupons Found!</Text>
                        </View>
                    ) : (
                        <FlatList keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ paddingTop: 20, paddingBottom: 70 }} style={{ width: '100%', flex: 1, marginTop: 5 }}
                            data={arrCoupon}
                            renderItem={renderCouponItem}
                            keyExtractor={(item, index) => index}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            refreshing={isPullToRefreshing}
                            onRefresh={() => onPullToRefresh()}
                        />

                    )

                }



            </View>


            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isAddingCouponModal}
                onRequestClose={() => { onRequestClosePopUp() }}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>

                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center', height: '80%' }}>

                        <View style={{ alignItems: 'center', padding: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
                            <View style={{ height: 35, width: 35 }}></View>
                            <Text style={{
                                textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiMedium
                            }}>{couponIsAdding ? 'Add Coupon Code' : 'Edit Coupon Code'}</Text>
                            <TouchableOpacity onPress={() => onRequestClosePopUp()} style={{ height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
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
                                ref={rf_end_time}
                                title={"Coupon Code"}
                                value={txt_coupon_code}
                                isErrorRedBorder={(txt_coupon_code.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterState}
                                otherTextInputProps={{
                                    placeholder: "Enter Coupon Code",
                                    autoCorrect: false,
                                    autoCapitalize: 'none'
                                }}
                            />

                            <View
                                animation={ani_validate} style={{ width: '100%', padding: 14, flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
                                <TouchableOpacity
                                    onPress={() => btnActiveClicked()}
                                    activeOpacity={0.7}
                                    style={{ height: RFValue(30), width: RFValue(30), justifyContent: 'center', alignItems: 'center' }}>
                                    <CardView cardElevation={1}>
                                        <Image style={{ tintColor: isCouponActive ? 'black' : '#c9c9c9', height: RFValue(22), width: RFValue(22) }} source={isCouponActive ? Theme.icons.ic_checked : Theme.icons.ic_unchecked}></Image>
                                    </CardView>
                                </TouchableOpacity>
                                <Text style={{
                                    marginLeft: RFValue(5), letterSpacing: 0.5, flex: 1,
                                    fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semiSmall1,
                                    color: Theme.colors.sendMeBlack
                                }}>
                                    <Text>
                                        {"Active"}
                                    </Text>

                                </Text>
                            </View>


                        </KeyboardAwareScrollView>
                        <View style={{ marginBottom: 10 }}>

                            <CustomButton title={couponIsAdding ? "Add" : 'Update'}
                                isLoading={btnLoading}
                                onButtonClicked={couponIsAdding ? btnAddNewCodeClicked : btnUpdateCodeClicked} />

                            {
                                !couponIsAdding ? (
                                    <View style={{ marginTop: 10 }}>
                                        <CustomButton title={"Delete"}
                                            isLoading={btnLoadingDelete}
                                            bgColor={"#bf3528"}
                                            onButtonClicked={btnDeleteCodeClicked} />
                                    </View>

                                ) : (
                                    <View></View>
                                )
                            }

                        </View>

                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    )
}

export default couponListView

couponListView['navigationOptions'] = screenProps => ({
    header: null
})
