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
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';
import { EventRegister } from 'react-native-event-listeners'
import FastImage from 'react-native-fast-image';
import ImageViewer from 'react-native-image-zoom-viewer';
import moment from 'moment';
var selectedMissionary = false
let serverConfig = {}

const adminMissionaryProfileView = (props) => {

    let serverConfig = getConfigurationData()
    let selectedMissionary = props.navigation.getParam("selectedMissionary", false)
    let isUpdating = props.navigation.getParam("isUpdating", false)
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [kDoRender, setkDoRender] = useState(false)
    const [selectedTab, setselectedTab] = useState(0)
    const [arrFeed, setarrFeed] = useState([])
    const [isShowImageViewer, setisShowImageViewer] = useState(false)
    const [selectedImgIndx, setselectedImgIndx] = useState(0)
    const [isFeedLoading, setisFeedLoading] = useState(false)
    const [isPullToRefreshing, setisPullToRefreshing] = useState(false)
    const [arrViewerImages, setarrViewerImages] = useState([])

    useEffect(() => {
        async function fetchData() {
            setkDoRender(true)
        }
        fetchData();
    }, [])



    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    // const _updateMasterState = (attrName, value) => {
    //     this.setState({ [attrName]: value });
    // }

    function btnGetReadyClicked() {

    }

    function btnSelectClicked() {

        if (btnShowLoading) {
            return
        }

        Alert.alert("Are you sure you want to delete missionary?", "Following will be deleted permanently:\n\n- Missionary Goal\n- Missionary Feed\n- Missionary Bank Account\n- Missionary User Info", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        doDeleteMissionary()
                    }, 50);

                }
            },
        ], { cancelable: true })
    }

    function doDeleteMissionary() {
        let param = {
            missionary_user_id: selectedMissionary.user_id
        }
        setbtnShowLoading(true)
        CALL_API("adminDeleteMissionary", param).then((res) => {
            console.log(res)

            setTimeout(() => {
                setbtnShowLoading(false)
            }, 1000);

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        doDeleteMissionary()
                    }
                })
                return
            }
            if (res.status == 1) {
                Alert.alert(res.msg, null, [
                    {
                        text: "Ok", onPress: () => {
                            props.navigation.goBack()
                            setTimeout(() => {
                                EventRegister.emit("reloadAdminMissionary", '')
                            }, 500);

                        }
                    },
                ], { cancelable: true })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function btnTabClickedAt(idx) {
        setselectedTab(idx)
        if (idx == 1) {
            getActivityFeed()
        }
    }

    function getActivityFeed() {
        let param = {
            page: 1,
            missionary_user_id: selectedMissionary.user_id
        }
        console.log(param)
        if (arrFeed.length == 0) {
            setisFeedLoading(true)
        }
        CALL_API("getMissionaryFeedList", param, "POST").then((res) => {
            console.log(res)
            setisFeedLoading(false)
            setisPullToRefreshing(false)
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {

                    if (res) {
                        getActivityFeed()
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

                setarrFeed(res.data)
                setarrViewerImages(arrImages)
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }

    function btnOnFeedItemClickedAtIdx(idx) {
        setisShowImageViewer(true)
        setselectedImgIndx(idx)
    }

    function onPullToRefresh() {
        setisPullToRefreshing(true)
        getActivityFeed()
    }

    function btnCloseClicked() {
        setisShowImageViewer(false)

    }


    function renderFeedItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginTop: 15 }}>
                <View style={{ backgroundColor: 'white', padding: 15 }}>
                    <TouchableOpacity
                        onPress={() => btnOnFeedItemClickedAtIdx(index)}
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
                        <View style={{ width: '100%', flex: 1 }}>
                            <Text style={[styContainer.pageTitleText, { marginLeft: 10 }]}>Missionary Profile</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignSelf: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => btnTabClickedAt(0)}
                                    activeOpacity={0.7}
                                    style={{ borderBottomWidth: selectedTab == 0 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                    <Text style={selectedTab == 0 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Dashboard</Text>
                                </TouchableOpacity>

                                <View style={{ marginLeft: 40 }}>

                                    <TouchableOpacity
                                        onPress={() => btnTabClickedAt(1)}
                                        activeOpacity={0.7}
                                        style={{ borderBottomWidth: selectedTab == 1 ? 3 : 0, borderBottomColor: Theme.colors.sendMeBlue }}>
                                        <Text style={selectedTab == 1 ? [styContainer.dashboardTabTitle, { color: Theme.colors.sendMeBlue }] : styContainer.dashboardTabTitle}>Activity Feed</Text>
                                    </TouchableOpacity>
                                </View>



                            </View>
                            {
                                selectedTab == 0 ? (
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
                                            <Text style={[styContainer.pageTitleText, { marginTop: 20, fontSize: Theme.fontSize.small }]}>
                                                <Text>{"Current Month Gift "}</Text>
                                                <Text style={{ color: Theme.colors.sendMeBlue, fontFamily: Theme.fontFamily.regular }}>{"(" + moment(new Date()).format('MMMM') + ")"}</Text>
                                            </Text>
                                            <Text style={{ marginTop: 5 }}>
                                                <Text style={[styContainer.goalText, {
                                                    color: Theme.colors.sendMeBlue, marginTop: 5,
                                                    fontSize: Theme.fontSize.semiRegular, fontFamily: Theme.fontFamily.bold
                                                }]}>${selectedMissionary.current_month_donation}</Text>
                                                {/* <Text style={styContainer.goalText}>{" by June 15th"}</Text> */}
                                            </Text>

                                            <Text style={[styContainer.pageTitleText, { marginTop: 20, fontSize: Theme.fontSize.small }]}>Total Gift</Text>
                                            <Text style={{ marginTop: 5 }}>
                                                <Text style={[styContainer.goalText, {
                                                    color: Theme.colors.sendMeBlue, marginTop: 5,
                                                    fontSize: Theme.fontSize.semiRegular, fontFamily: Theme.fontFamily.bold
                                                }]}>${selectedMissionary.total_donation}</Text>
                                                {/* <Text style={styContainer.goalText}>{" by June 15th"}</Text> */}
                                            </Text>

                                            <Text style={[styContainer.pageTitleText, { marginTop: 20, fontSize: Theme.fontSize.small }]}>Total Sponsors</Text>
                                            <Text style={{ marginTop: 5 }}>
                                                <Text style={[styContainer.goalText, {
                                                    color: Theme.colors.sendMeBlue, marginTop: 5,
                                                    fontSize: Theme.fontSize.semiRegular, fontFamily: Theme.fontFamily.bold
                                                }]}>{selectedMissionary.cnt_total_sponsors}</Text>
                                                {/* <Text style={styContainer.goalText}>{" by June 15th"}</Text> */}
                                            </Text>
                                            <View style={{ height: 30 }}></View>
                                        </View>
                                    </ScrollView>
                                ) : (
                                    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                                        {
                                            isFeedLoading ? (
                                                <Text
                                                    style={styContainer.feedLoadingText}
                                                >Loading...</Text>
                                            ) : (
                                                arrFeed.length == 0 ? (
                                                    <Text
                                                        style={styContainer.feedLoadingText}
                                                    >No feed by {selectedMissionary.display_name} yet!</Text>
                                                ) : (
                                                    <View></View>
                                                )

                                            )
                                        }
                                        <FlatList
                                            keyboardShouldPersistTaps={'handled'}
                                            contentContainerStyle={{ paddingBottom: 20 }}
                                            style={{ width: '100%', flex: 1, marginTop: 5 }}
                                            data={arrFeed}
                                            renderItem={renderFeedItem}
                                            keyExtractor={(item, index) => index}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={false}
                                            refreshing={isPullToRefreshing}
                                            onRefresh={() => onPullToRefresh()}
                                        />
                                    </View>
                                )
                            }

                        </View>
                    ) : (
                        <View></View>

                    )
                }

                {
                    selectedMissionary && selectedTab == 0 ? (
                        <View style={{ width: '100%', marginBottom: 5, position: 'absolute', bottom: 10 }}>
                            <CustomButton title={'Delete Missionary'}
                                isLoading={btnShowLoading}
                                bgColor={"#bf3528"}
                                onButtonClicked={btnSelectClicked} />
                        </View>
                    ) : (
                        <View></View>
                    )
                }

            </View>

            <Modal useNativeDriver={true}
                onRequestClose={() => { setisShowImageViewer(false) }}
                visible={isShowImageViewer} transparent={true}>

                <ImageViewer index={selectedImgIndx}
                    enablePreload

                    // renderHeader={renderHeaderItem}
                    swipeDownThreshold={50}
                    onCancel={() => { setisShowImageViewer(false) }}
                    enableSwipeDown={true} useNativeDriver={true}
                    imageUrls={arrViewerImages} />
                <TouchableOpacity onPress={() => btnCloseClicked()} style={{ marginTop: 30, marginLeft: 10, position: 'absolute' }}>
                    <Image
                        style={{ tintColor: 'white', height: 30, width: 30 }}
                        source={Theme.icons.ic_close}>

                    </Image>
                </TouchableOpacity >
            </Modal>

        </SafeAreaView >
    )
}

export default adminMissionaryProfileView

adminMissionaryProfileView['navigationOptions'] = screenProps => ({
    header: null
})
