import React, { useState, useEffect } from 'react';
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

import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';

var currentUser = {}
let serverConfig = {}
let arrUserT = []
let isUpdate = false
let isFromMenu = false
let branchMissionary_Id = false

const adminAllMissionaryListView = (props) => {

    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()
    // arrUserT = []
    isUpdate = props.navigation.getParam("is_update", false)
    isFromMenu = props.navigation.getParam("is_from_menu", false)

    branchMissionary_Id = props.navigation.getParam("branch_missionary_id", false)
    const [arrMissionaries, setarrMissionaries] = useState([])
    const [selectedMissionaryItemUserId, setselectedMissionaryItemUserId] = useState('')
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [txt_search, settxt_search] = useState("")
    const [isPullToRefreshing, setisPullToRefreshing] = useState(false)


    useEffect(() => {
        console.log("~~~~~~~")
        console.log(currentUser)
        console.log("~~~~~~~")
        if (isUpdate) {
            setselectedMissionaryItemUserId(currentUser.missionary.user_id)
        }
        getAllMissionaries()
        let reloadAdminMissionary = EventRegister.addEventListener('reloadAdminMissionary', (data) => {
            settxt_search("")
            getAllMissionaries()
        })
        return () => {
            EventRegister.removeEventListener(reloadAdminMissionary)
        }
    }, [])


    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    // function _updateMasterState = (attrName, value) => {
    //     this.setState({ [attrName]: value });
    // }

    function getAllMissionaries() {
        let param = {
            user_time_zone: serverConfig.time_zone
        }
        CALL_API("admin_AllMissionaryUser", param).then((res) => {
            console.log(res)
            setisPullToRefreshing(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        getAllMissionaries()
                    }
                })
                return
            }
            arrUserT = res.data
            console.log("arrUserTarrUserTarrUserTarrUserT==>", arrUserT);
            if (res.status == 1) {
                console.log("res.data==>", res.data);
                setarrMissionaries(res.data)
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }


    function searchTextChange(val) {
        console.log("value", val)
        settxt_search(val)
        if (val.trim() == "") {
            setarrMissionaries(arrUserT)
        }
        else {
            console.log("call else", arrUserT);
            let arrTemp = []
            for (var obj of arrUserT) {
                console.log(obj.display_name)
                let strx = (obj.display_name.trim() + obj.email.trim() + obj.missionary_location.trim() + obj.missionary_details.trim() + "").toLowerCase()

                let searchString = val.replace(/\s/g, "")
                if (strx.includes(searchString.toLowerCase())) {
                    arrTemp.push(obj)
                }
            }
            console.log("arrTemp==>", arrTemp)
            setarrMissionaries(arrTemp)
        }
        //arrUserT
    }

    function onPullToRefresh() {
        setisPullToRefreshing(true)
        getAllMissionaries()
    }

    function btnOnItemClicked(item) {
        console.log(item)
        props.navigation.navigate("adminMissionaryProfileView", {
            selectedMissionary: item
        })
    }

    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    function renderMissionaryItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
                <TouchableOpacity
                    onPress={() => btnOnItemClicked(item)}
                    activeOpacity={0.9}
                    style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row' }}>

                    <View>
                        <FastImage
                            source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + item.user_profile_photo }}
                            style={{ backgroundColor: 'gray', height: RFValue(70), width: RFValue(70) }}></FastImage>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"Name: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{item.display_name}</Text>
                        </Text>
                        {/* <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.semiSmall1 }]}>{item.display_name}</Text> */}
                        {/* <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{item.missionary_details}</Text> */}
                        <Text style={{ marginTop: 5 }}>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"This Month: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{"$" + item.current_month_donation}</Text>
                        </Text>

                        <Text style={{ marginTop: 5 }}>
                            <Text style={[styContainer.pageTitleText, { fontSize: Theme.fontSize.semiSmall1 }]}>{"All Time: "}</Text>
                            <Text numberOfLines={3} style={[styContainer.goalText, { marginTop: 5 }]}>{"$" + item.total_donation}</Text>
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
                            <View style={styContainer.sideMenuContainerRight}>
                            </View>
                        </View>
                    </View>
                </CardView>
                <Text style={styContainer.pageTitleText}>All Missionaries</Text>
                <CardView cardElevation={2} style={{ width: '90%', marginTop: 15 }}>
                    <View style={{ height: RFValue(40), backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', width: '100%' }}>
                        <TextInput
                            onChangeText={(text) => searchTextChange(text)}
                            autoCapitalize={false}
                            autoCorrect={false}
                            value={txt_search}
                            style={{ height: '95%', flex: 1, marginRight: 7, marginLeft: 10 }}
                            placeholder="Search"></TextInput>
                        <Image resizeMode="contain" style={{ height: RFValue(15), width: RFValue(15), marginRight: 10 }} source={Theme.icons.ic_search}></Image>
                    </View>
                </CardView>
                <FlatList keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ paddingTop: 20, paddingBottom: 70 }} style={{ width: '100%', flex: 1, marginTop: 5 }}
                    data={arrMissionaries}
                    renderItem={renderMissionaryItem}
                    keyExtractor={(item, index) => index}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    refreshing={isPullToRefreshing}
                    onRefresh={() => onPullToRefresh()}
                />



            </View>
            <KeyboardAccessoryView />
        </SafeAreaView >
    )
}

export default adminAllMissionaryListView

adminAllMissionaryListView['navigationOptions'] = screenProps => ({
    header: null
})
