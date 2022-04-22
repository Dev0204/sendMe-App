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
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';

import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';

var _this = null
var currentUser = {}
let serverConfig = {}
let arrUserT = []
let isUpdate = false
let isFromMenu = false
let branchMissionary_Id = false
export default class MissionarySelectionListView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        arrUserT = []
        isUpdate = this.props.navigation.getParam("is_update", false)
        isFromMenu = this.props.navigation.getParam("is_from_menu", false)

        branchMissionary_Id = this.props.navigation.getParam("branch_missionary_id", false)

        this.state = {
            arrMissionaries: [],
            selectedMissionaryItemUserId: "",
            btnShowLoading: false,
            txt_search: "",
            isPullToRefreshing: false
        }
    }

    componentDidMount() {
        console.log("~~~~~~~")
        console.log(currentUser)
        console.log("~~~~~~~")
        if (isUpdate) {
            this.setState({
                selectedMissionaryItemUserId: currentUser.missionary.user_id
            })
        }

        this.getAllMissionaries()


    }

    btnSideMenuClicked() {
        this.props.navigation.toggleDrawer()
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    getAllMissionaries() {

        CALL_API("getAllMissionaryProfile").then((res) => {
            console.log(res)
            this.setState({
                isPullToRefreshing: false
            })
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.getAllMissionaries()
                    }
                })
                return
            }
            arrUserT = res.data
            if (res.status == 1) {
                this.setState({
                    arrMissionaries: res.data
                })
                if (branchMissionary_Id) {
                    res.data.forEach(element => {
                        if (branchMissionary_Id == element.user_id) {
                            this.btnReadMoreClicked(element)
                        }
                    });
                }
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }

    btnGetReadyClicked() {
        _this.setState({
            selectedTab: 1
        })
    }

    btnReadMoreClicked(item) {
        if (isUpdate) {
            _this.props.navigation.navigate("missionaryGoalProfileView1", {
                selectedMissionary: item,
                isUpdating: isUpdate,
                is_fromSidemenu: isFromMenu
            })
        }
        else {
            _this.props.navigation.navigate("missionaryGoalProfileView", {
                selectedMissionary: item
            })
        }
    }

    btnSelectClicked() {
        let objMissionary = false
        _this.state.arrMissionaries.forEach(element => {
            if (element.user_id == _this.state.selectedMissionaryItemUserId) {
                objMissionary = element
            }
        });

        if (!objMissionary) {
            return
        }
        console.log(objMissionary)
        let param = {
            missionary_user_id: objMissionary.user_id
        }
        _this.setState({
            btnShowLoading: true
        })
        setTimeout(() => {
            _this.setState({
                btnShowLoading: false
            })
        }, AppConstants.loaderTimeOutDuration * 1000);

        let url = "chooseMissionary"
        if (isUpdate) {
            url = "updateMissionary"
        }

        CALL_API(url, param).then((res) => {
            console.log(res)
            setTimeout(() => {
                _this.setState({
                    btnShowLoading: false
                })
            }, 1000)

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.btnSelectClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                if (isUpdate) {
                    syncUserWithServer().then((res) => {
                        if (res) {
                            currentUser = getCurrentUserData()
                            EventRegister.emit("navigateToMyMissionaryListener", '')
                            //_this.props.navigation.navigate("sponsarMyMissionaryView")
                        }
                    })

                }
                else {
                    _this.props.navigation.navigate("sponsarGetBankAndCardInfoView1")
                }
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    btnOnItemClicked(userId) {
        Keyboard.dismiss()
        this.setState({
            selectedMissionaryItemUserId: userId
        })
    }

    btnGoBackClicked(isChoosingUserType = false) {
        if (isChoosingUserType) {
            this.props.navigation.navigate("sponsorAccountSetupInfoView")
            return
        }

        if (isFromMenu) {
            this.props.navigation.toggleDrawer()
        }
        else {
            this.props.navigation.goBack()
        }
    }

    searchTextChange(val) {
        console.log(val)
        this.setState({
            txt_search: val
        })
        if (val.trim() == "") {
            this.setState({
                arrMissionaries: arrUserT
            })
        }
        else {
            let arrTemp = []
            for (var obj of arrUserT) {
                console.log(obj.display_name)
                let strx = (obj.display_name.trim() + obj.email.trim() + obj.missionary_location.trim() + obj.missionary_details.trim() + "").toLowerCase()

                let searchString = val.replace(/\s/g, "")
                if (strx.includes(searchString.toLowerCase())) {
                    arrTemp.push(obj)
                }
            }
            this.setState({
                arrMissionaries: arrTemp
            })
        }

        //arrUserT

    }

    onPullToRefresh() {
        this.setState({
            isPullToRefreshing: true
        })
        this.getAllMissionaries()
    }

    renderMissionaryItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginBottom: 15 }}>
                <TouchableOpacity
                    onPress={() => _this.btnOnItemClicked(item.user_id)}
                    activeOpacity={0.9}
                    style={{ backgroundColor: 'white', padding: 15, flexDirection: 'row' }}>
                    <View style={{ justifyContent: 'center', marginRight: 8 }}>
                        <Image
                            style={{ height: 30, width: 30 }}
                            source={_this.state.selectedMissionaryItemUserId == item.user_id ? Theme.icons.ic_radio_checked : Theme.icons.ic_radio_unchecked}
                        ></Image>
                    </View>
                    <View>
                        <FastImage
                            source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + item.user_profile_photo }}
                            style={{ backgroundColor: 'gray', height: RFValue(70), width: RFValue(70) }}></FastImage>
                    </View>
                    <View style={{ flex: 1, marginLeft: 7 }}>
                        <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.semiSmall1 }]}>{item.display_name}</Text>
                        <Text style={[styContainer.goalText, { marginTop: 5 }]}>{item.missionary_details}</Text>
                        <TouchableOpacity activeOpacity={0.7}
                            onPress={() => _this.btnReadMoreClicked(item)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image resizeMode="contain" style={{ height: RFValue(8), width: RFValue(8), marginRight: 5, tintColor: Theme.colors.sendMeBlue }} source={Theme.icons.ic_orientation}></Image>
                            <Text style={[styContainer.goalText, { color: Theme.colors.sendMeBlue, padding: 5, paddingLeft: 0 }]}>Read More</Text>
                        </TouchableOpacity>
                    </View>

                </TouchableOpacity>
            </CardView>
        )
    }

    render() {
        return (
            <SafeAreaView style={styContainer.windowContainer}>
                <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                        <View style={styContainer.navigationCustomHeaderp}>
                            <View style={styContainer.navigationCustomHeaderq}>

                                {
                                    isUpdate ? (
                                        <TouchableOpacity activeOpacity={0.7}
                                            style={styContainer.sideMenuContainerLeft}
                                            onPress={() => this.btnGoBackClicked()}
                                        >
                                            <Image
                                                style={styContainer.sideMenuIcon}
                                                source={isFromMenu ? Theme.icons.ic_sidemenu : Theme.icons.ic_go_back}>
                                            </Image>
                                        </TouchableOpacity>
                                    ) : (
                                            currentUser.stripe_customer_id == "" && currentUser.stripe_connect_id == "" ? (
                                                <TouchableOpacity activeOpacity={0.7}
                                                    style={styContainer.sideMenuContainerLeft}
                                                    onPress={() => this.btnGoBackClicked(true)}
                                                >
                                                    <Image
                                                        style={styContainer.sideMenuIcon}
                                                        source={isFromMenu ? Theme.icons.ic_sidemenu : Theme.icons.ic_go_back}>
                                                    </Image>
                                                </TouchableOpacity>
                                            ) : (
                                                    <View style={styContainer.sideMenuContainerLeft}>
                                                    </View>
                                                )
                                        )
                                }

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
                    <Text style={styContainer.pageTitleText}>View Missionaries</Text>
                    <CardView cardElevation={2} style={{ width: '90%', marginTop: 15 }}>
                        <View style={{ height: RFValue(40), backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', width: '100%' }}>
                            <TextInput
                                onChangeText={(text) => this.searchTextChange(text)}
                                autoCapitalize={false}
                                autoCorrect={false}
                                value={this.state.txt_search}
                                style={{ height: '95%', flex: 1, marginRight: 7, marginLeft: 10 }}
                                placeholder="Search"></TextInput>
                            <Image resizeMode="contain" style={{ height: RFValue(15), width: RFValue(15), marginRight: 10 }} source={Theme.icons.ic_search}></Image>
                        </View>
                    </CardView>
                    <FlatList keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ paddingTop: 20, paddingBottom: 70 }} style={{ width: '100%', flex: 1, marginTop: 5 }}
                        data={this.state.arrMissionaries}
                        renderItem={this.renderMissionaryItem}
                        keyExtractor={(item, index) => index}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        refreshing={this.state.isPullToRefreshing}
                        onRefresh={() => this.onPullToRefresh()}
                    />
                    {
                        this.state.selectedMissionaryItemUserId != "" ? (
                            <View style={{ width: '100%', marginBottom: 5, position: 'absolute', bottom: 10 }}>
                                <CustomButton title="Continue"
                                    isLoading={this.state.btnShowLoading}
                                    onButtonClicked={this.btnSelectClicked} />
                            </View>
                        ) : (
                                <View></View>
                            )
                    }


                </View>
                <KeyboardAccessoryView />
            </SafeAreaView >
        )
    }
}