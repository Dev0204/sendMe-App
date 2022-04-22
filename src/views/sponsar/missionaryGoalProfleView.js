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
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { EventRegister } from 'react-native-event-listeners'
import FastImage from 'react-native-fast-image';
var _this = null
var selectedMissionary = false
let serverConfig = {}
let isUpdating = false
let branch_missionary_id = false
export default class MissionaryGoalProfileView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        serverConfig = getConfigurationData()
        selectedMissionary = this.props.navigation.getParam("selectedMissionary", false)
        isUpdating = this.props.navigation.getParam("isUpdating", false)
        branch_missionary_id = this.props.navigation.getParam("branch_missionary_id", false)
        this.state = {
            btnShowLoading: false,
            kDoRender: false
        }
    }

    async componentDidMount() {

        if (branch_missionary_id) {
            this.getMissionaryFromId()
        }
        else {
            this.setState({
                kDoRender: true
            })
        }
    }

    getMissionaryFromId() {
        let param = {
            missionary_id: branch_missionary_id
        }
        CALL_API("getGoalMissionaryById", param).then((res) => {
            if (res.status == 1) {
                selectedMissionary = res.data
                this.setState({
                    kDoRender: true
                })
            }
        })
    }

    btnGoBackClicked() {
        this.props.navigation.goBack()
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    btnGetReadyClicked() {

    }

    btnSelectClicked() {
        if (branch_missionary_id) {
            _this.props.navigation.navigate("signInView")
            return
        }
        if (_this.state.btnShowLoading) {
            return
        }

        let param = {
            missionary_user_id: selectedMissionary.user_id
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
        if (isUpdating) {
            url = "updateMissionary"
            let objFirbaseEvent = {
                eventTitle: "button_clicked",
                eventObject: {
                    button: "Update_Missionary",
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        else {
            let objFirbaseEvent = {
                eventTitle: "button_clicked",
                eventObject: {
                    button: "Choose_Missionary",
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        }
        CALL_API(url, param).then((res) => {
            console.log(res)

            setTimeout(() => {
                _this.setState({
                    btnShowLoading: false
                })
            }, 1000);

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        _this.btnSelectClicked()
                    }
                })
                return
            }
            if (res.status == 1) {
                if (isUpdating) {
                    syncUserWithServer().then((res) => {
                        if (res) {
                            currentUser = getCurrentUserData()
                            EventRegister.emit("reloadProfileListener", '')
                            _this.props.navigation.navigate("sponsarMyMissionaryView")
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
        //_this.props.navigation.navigate("sponsarGetBankAndCardInfoView")
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
                                    onPress={() => this.btnGoBackClicked()}
                                >
                                    <Image
                                        style={styContainer.sideMenuIcon}
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
                        this.state.kDoRender ? (
                            <View style={{ width: '100%', flex: 1 }}>
                                <Text style={[styContainer.pageTitleText, { marginLeft: 10 }]}>Missionary Profile</Text>
                                <ScrollView contentContainerStyle={{ paddingBottom: 70, alignItems: 'center' }} style={{ width: '100%', flex: 1 }}>
                                    <CardView cardElevation={2} style={{ width: '90%', marginTop: 20, alignSelf: 'center', marginBottom: 15 }}>
                                        <View style={{ backgroundColor: 'white', padding: 15, flexDirection: 'row' }}>
                                            <View>
                                                <FastImage
                                                    source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + selectedMissionary.user_profile_photo }}
                                                    style={{ backgroundColor: 'gray', height: RFValue(70), width: RFValue(70) }}></FastImage>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 7 }}>
                                                <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.regular }]}>{selectedMissionary.display_name}</Text>
                                                <Text style={[styContainer.goalText, { marginTop: 5 }]}>{selectedMissionary.missionary_location}</Text>
                                            </View>
                                        </View>
                                    </CardView>
                                    <View style={{ width: '90%', marginTop: 10 }}>
                                        <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.small }]}>Mission</Text>
                                        <Text style={[styContainer.goalText, { marginTop: 5, fontSize: Theme.fontSize.semiSmall }]}>{selectedMissionary.missionary_details}</Text>

                                        <Text style={[styContainer.pageTitleText, { marginTop: 20, fontSize: Theme.fontSize.small }]}>Mission Goals</Text>
                                        <Text style={{ marginTop: 5 }}>
                                            <Text style={[styContainer.goalText, {
                                                color: Theme.colors.sendMeBlue, marginTop: 5,
                                                fontSize: Theme.fontSize.semiRegular, fontFamily: Theme.fontFamily.bold
                                            }]}>${selectedMissionary.missionary_goal}</Text>
                                            {/* <Text style={styContainer.goalText}>{" by June 15th"}</Text> */}
                                        </Text>
                                    </View>
                                </ScrollView>
                            </View>
                        ) : (
                                <View></View>
                            )
                    }


                    {
                        selectedMissionary ? (
                            <View style={{ width: '100%', marginBottom: 5, position: 'absolute', bottom: 10 }}>
                                <CustomButton title={branch_missionary_id ? 'Get Ready' : 'Select'}
                                    isLoading={this.state.btnShowLoading}
                                    onButtonClicked={this.btnSelectClicked} />
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