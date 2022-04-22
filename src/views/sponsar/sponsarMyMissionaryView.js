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
import { EventRegister } from 'react-native-event-listeners'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';

import { syncUserWithServer, getConfigurationData, CALL_API, Reload_API_Alert, getCurrentUserData, saveCurrentUserData, calulcateAge, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';
var _this = null
var currentUser = {}
var serverConfig = {}
export default class SponsarMyMissionaryView extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        _this = this
        currentUser = getCurrentUserData()
        serverConfig = getConfigurationData()
        this.state = {
            kDoRender: false,
            isMissionaryRaisingFundPaused: false
        }
    }

    componentDidMount() {
        _this.syncUser()

        this.reloadMissionaryOnceChange = EventRegister.addEventListener('reloadProfileListener', (data) => {
            _this.syncUser()
            console.log(currentUser)
            console.log("reloadMissionaryOnceChange")
            this.setState({})
            Alert.alert("Success", "Missionary has been updated.")
        })
    }

    syncUser() {

        currentUser = getCurrentUserData()
        if (currentUser.missionary.is_rounding_up_paused == 0) {
            this.setState({
                kDoRender: true,
                isMissionaryRaisingFundPaused: false
            })
        }

        syncUserWithServer().then((res) => {
            if (res) {
                currentUser = getCurrentUserData()
                if (currentUser.missionary.is_rounding_up_paused == 0) {
                    this.setState({
                        kDoRender: true,
                        isMissionaryRaisingFundPaused: false
                    })
                }
                else {
                    this.setState({
                        kDoRender: true,
                        isMissionaryRaisingFundPaused: true
                    })

                }
            }
        })
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.reloadMissionaryOnceChange)
    }

    btnSideMenuClicked() {
        this.props.navigation.toggleDrawer()
    }

    _updateMasterState = (attrName, value) => {
        this.setState({ [attrName]: value });
    }

    btnGetReadyClicked() {

    }

    btnEditClicked() {
        _this.props.navigation.navigate("missionarySelectionListView2", {
            is_update: true,
        })
    }

    btnDeleteClicked() {

    }

    btnOneTimeDonationClicked() {
        _this.props.navigation.navigate("oneTimeDonationView", {
            is_pushed: true
        })
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
                    <Text style={styContainer.pageTitleText}>My Missionary</Text>
                    {
                        this.state.kDoRender && !this.state.isMissionaryRaisingFundPaused ? (
                            <ScrollView contentContainerStyle={{ paddingBottom: 70, alignItems: 'center' }} style={{ width: '100%', flex: 1 }}>
                                <CardView cardElevation={2} style={{ width: '90%', marginTop: 20, alignSelf: 'center', marginBottom: 15 }}>
                                    <View style={{ backgroundColor: 'white', paddingBottom: 15, }}>
                                        <View style={{ flexDirection: 'row', padding: 15, }}>
                                            <View>
                                                <FastImage
                                                    source={{ uri: (ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.missionary.user_profile_photo }}
                                                    style={{ backgroundColor: 'lightgray', height: RFValue(70), width: RFValue(70) }}></FastImage>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 7 }}>
                                                <Text style={[styContainer.pageTitleText, { marginTop: 0, fontSize: Theme.fontSize.regular }]}>{currentUser.missionary.display_name}</Text>
                                                <Text style={[styContainer.goalText, { marginTop: 5 }]}>{currentUser.missionary.missionary_details}</Text>
                                            </View>
                                        </View>

                                        <CustomButton title="Add One-Time Gift"
                                            defineFontSize={Theme.fontSize.small}
                                            defineFontFamily={Theme.fontFamily.medium}
                                            defineHeight={RFValue(37)}
                                            onButtonClicked={this.btnOneTimeDonationClicked} />

                                    </View>
                                </CardView>

                            </ScrollView>
                        ) : (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={{ textAlign: 'center', fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small, padding: 15 }}>
                                        <Text style={{ fontFamily: Theme.fontFamily.medium }}>{currentUser.missionary.display_name}</Text>
                                        <Text>{" " + AppConstants.StringLiterals.missionaryRaisingFundPaused}</Text>
                                    </Text>
                                    {/* <Text style={{ fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4 }}>Missionary paused raising fund!</Text> */}
                                </View>
                            )
                    }


                    <View style={{ width: '90%', flexDirection: 'row', marginBottom: 5, position: 'absolute', bottom: 10 }}>
                        <View style={{ width: '100%' }}>
                            <CustomButton title="Edit"
                                bgColor={Theme.colors.sendMeBlack}
                                defineHeight={RFValue(37)}
                                onButtonClicked={this.btnEditClicked} />
                        </View>
                        {/* <View style={{ width: '50%' }}>
                            <CustomButton title="Delete"
                                defineHeight={RFValue(37)}
                                onButtonClicked={this.btnDeleteClicked} />
                        </View> */}

                    </View>

                </View>
            </SafeAreaView >
        )
    }
}