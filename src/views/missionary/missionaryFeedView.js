import React, { useEffect, useState } from 'react';
import {
    Dimensions, FlatList, SectionList, ScrollView,
    SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage,
    TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet,
    TextComponent, Modal, ActivityIndicator
} from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';

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
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import FastImage from 'react-native-fast-image';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';

const imgPickeroptions = {
    title: 'Choose feed photo from',
    takePhotoButtonTitle: "Take Photo",
    chooseFromLibraryButtonTitle: "Choose From Library",
    allowsEditing: true,
    imageFileType: 'jpg',
    maxWidth: 500,
    maxHeight: 500,
    cameraType: 'back',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};


const missionaryFeedView = () => {

    const [arrFeed, setarrFeed] = useState([])
    const [isFeedLoading, setisFeedLoading] = useState(false)
    const [isAddingPost, setisAddingPost] = useState(false)
    const [addPostAnimation, setaddPostAnimation] = useState("fadeInDown")
    const [isImagePickerVisible, setisImagePickerVisible] = useState(false)
    const [avatarSource, setavatarSource] = useState("")
    const [isAvatarChanged, setisAvatarChanged] = useState(false)
    const [txtFeedTitle, settxtFeedTitle] = useState("")
    const [txtFeedDesc, settxtFeedDesc] = useState("")
    const [isUploadingFeed, setisUploadingFeed] = useState(false)
    const [isMenuOptionVisible, setisMenuOptionVisible] = useState(false)
    const [optionSelectedItem, setoptionSelectedItem] = useState(false)
    const [isEditingPost, setisEditingPost] = useState(false)
    const [arrViewerImages, setarrViewerImages] = useState([])
    const [isShowImageViewer, setisShowImageViewer] = useState(false)
    const [selectedImgIndx, setselectedImgIndx] = useState(0)
    const [isPullToRefreshing, setisPullToRefreshing] = useState(false)
    const currentUser = getCurrentUserData()
    const serverConfig = getConfigurationData()


    useEffect(() => {
        getActivityFeed()
    }, [])

    function onPullToRefresh() {
        setisPullToRefreshing(true)
        getActivityFeed()
    }

    function getActivityFeed() {
        let param = {
            page: 1
        }
        if (arrFeed.length == 0) {
            setisFeedLoading(true)
        }
        setisFeedLoading(true)
        CALL_API("getMissionaryFeedList", param, "POST").then((res) => {
            console.log(res)
            setisFeedLoading(false)
            setisPullToRefreshing(false)
            setisFeedLoading(false)
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

    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    // const _updateMasterState = (attrName, value) => {
    //     this.setState({ [attrName]: value });
    // }

    function btnGetReadyClicked() {
        setselectedTab(1)
    }

    function btnAddPostClicked() {
        setisAddingPost(true)
        setisEditingPost(false)
    }

    function btnPostFeedCancelClicked() {
        setisAddingPost(false)
    }

    function btnSavePostClicked() {
        Keyboard.dismiss()
        if (txtFeedTitle.trim() == "") {
            Alert.alert("Please enter title.")
            return
        }

        if (txtFeedDesc.trim() == "") {
            Alert.alert("Please enter descriptions.")
            return
        }

        if (avatarSource == "") {
            Alert.alert("Please choose feed photo.")
            return
        }
        setisUploadingFeed(true)
        let objFeedData = {
            feed_image: {
                uri: avatarSource,
                type: "image/png",
                name: "photo.png",
            },
            feed_title: txtFeedTitle.trim(),
            feed_desc: txtFeedDesc.trim(),

        }
        if (isEditingPost) {
            objFeedData = {
                feed_image: {
                    uri: avatarSource,
                    type: "image/png",
                    name: "photo.png",
                },
                feed_title: txtFeedTitle.trim(),
                feed_desc: txtFeedDesc.trim(),
                is_editing: true,
                is_avatar_change: isAvatarChanged,
                missionary_feed_id: optionSelectedItem.missionary_feed_id
            }
        }
        console.log("***objFeedData***")
        console.log(objFeedData)
        console.log("***objFeedData***")
        UPLOAD_PROFILE("uploadMissionaryFeed", objFeedData).then((res) => {
            setisUploadingFeed(false)
            if (res.status == 1) {
                settxtFeedTitle("")
                settxtFeedDesc("")
                setavatarSource("")
                setisAvatarChanged(false)
                setisAddingPost(false)
                setisEditingPost(false)
                getActivityFeed()
            }
            else {
                setTimeout(() => {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50);
            }
            console.log(res)
        })

    }

    function addPostImageClicked() {
        Keyboard.dismiss()
        if (Platform.OS === "ios") {
            //    "Change Profile Image",
            //    "Where would you like to choose a new image from?",

            ImagePicker.showImagePicker(imgPickeroptions, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    const source = { uri: response.uri };

                    // ImgToBase64.getBase64String(response.uri)
                    //     .then(base64String => this.setState({ base64ImageString: base64String }))
                    //     .catch(err => console.log(err));

                    setavatarSource(source.uri)
                    setisAvatarChanged(true)
                }
            })
        }
        else {
            setisImagePickerVisible(true)
        }
    }

    function btnImagePickerClicked(pickerType) {
        setisImagePickerVisible(false)
        if (pickerType == "Photo") {
            ImagePicker.launchImageLibrary(imgPickeroptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setisAvatarChanged(true)
                }
            });
        }
        else if (pickerType == "Camera") {
            ImagePicker.launchCamera(imgPickeroptions, (response) => {
                if (response.uri) {
                    setavatarSource(response.uri)
                    setisAvatarChanged(true)
                }
            });
        }

    }

    function onRequestCloseImagePickerModal() {
        Keyboard.dismiss()
        setisImagePickerVisible(false)
        setisMenuOptionVisible(false)
    }

    function btnMoreClicked(item) {
        setisMenuOptionVisible(true)
        setoptionSelectedItem(item)
    }

    function btnPostOptionClicked(type) {
        if (optionSelectedItem) {
            setisMenuOptionVisible(false)
            if (type == "edit") {
                setTimeout(() => {
                    editFeed()
                }, 50);
            }
            else if (type == "delete") {
                setTimeout(() => {
                    deleteFeed()
                }, 100);

            }
        }
    }

    function editFeed() {
        setisEditingPost(true)
        setisAddingPost(true)
        settxtFeedTitle(optionSelectedItem.feed_title)
        settxtFeedDesc(optionSelectedItem.feed_desc)
        setavatarSource((ISLIVE ? serverConfig.img_feed_live_base_url : serverConfig.img_feed_dev_base_url) + "/" + optionSelectedItem.feed_photo)
    }

    function deleteFeed() {

        Alert.alert("Confirm delete?", null, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes", onPress: () => {
                    setTimeout(() => {
                        let param = {
                            missionary_feed_id: optionSelectedItem.missionary_feed_id
                        }
                        CALL_API("deleteMissionaryFeed", param, "POST").then((res) => {
                            if (res.errMsg != null) {
                                Reload_API_Alert(res.errMsg).then((res) => {
                                    if (res) {
                                        deleteFeed()
                                    }
                                })
                                return
                            }

                            if (res.status == 1) {
                                getActivityFeed()
                            }
                            else {
                                setTimeout(function () {
                                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                                }, 50)
                            }
                        })
                    }, 100);

                }
            },
        ], { cancelable: true })


    }

    function btnCloseClicked() {
        setisShowImageViewer(false)
    }

    function btnOnFeedItemClickedAtIdx(idx) {
        setisShowImageViewer(false)
        setselectedImgIndx(idx)
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
                            style={{ width: '100%', height: RFValue(170) }}>

                        </FastImage>
                    </TouchableOpacity>
                    <View style={{ width: '95%', alignSelf: 'center', marginTop: 15 }}>
                        <Text style={{ letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular }}>{item.feed_title}</Text>
                        <Text style={{ color: Theme.colors.sendMeGray, marginTop: 5, letterSpacing: 0.4, fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiSmall1 }}>{item.feed_desc}</Text>
                    </View>
                    {/* <View style={{ justifyContent: 'center', alignItems: 'center', borderRadius: RFValue(15), alignSelf: 'center', top: RFValue(110), position: 'absolute', backgroundColor: Theme.colors.sendMeBlue, height: RFValue(30), width: RFValue(30) }}>
                        <Icon name="camera" color={'white'} size={10}></Icon>
                    </View> */}
                    <TouchableOpacity
                        onPress={() => btnMoreClicked(item)}
                        style={{ position: 'absolute', right: 22, top: 12 }}
                        activeOpacity={0.7}>
                        <Image resizeMode="contain"
                            style={{ height: 35, width: 35, padding: 15 }}
                            source={Theme.icons.ic_dots}></Image>
                    </TouchableOpacity>
                </View>
            </CardView>
        )
    }


    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                {/* <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
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
            </CardView> */}
                {/* <Text style={styContainer.pageTitleText}>My Mission Feed</Text> */}
                {
                    isAddingPost ? (
                        <View></View>
                    ) : (
                        <CardView cardElevation={2} style={{ marginTop: 10 }}>
                            <TouchableOpacity
                                onPress={() => btnAddPostClicked()}
                                activeOpacity={0.8}
                                style={{ backgroundColor: 'white', width: RFValue(230), height: RFValue(38), alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{
                                    fontFamily: Theme.fontFamily.regular,
                                    letterSpacing: 0.4,
                                    fontSize: Theme.fontSize.semiSmall1
                                }}>Add Post</Text>
                            </TouchableOpacity>
                        </CardView>
                    )
                }


                {
                    isFeedLoading ? (
                        <Text
                            style={styContainer.feedLoadingText}
                        >Loading...</Text>
                    ) : (
                        (arrFeed.length == 0 && !isAddingPost) ? (
                            <Text
                                style={styContainer.feedLoadingText}
                            >No feed yet!</Text>
                        ) : (
                            <View></View>
                        )
                    )
                }
                {
                    isAddingPost ? (
                        <KeyboardAwareScrollView
                            automaticallyAdjustContentInsets={false}
                            contentContainerStyle={{ paddingBottom: 100, alignItems: 'center' }}
                            keyboardShouldPersistTaps={'handled'}
                            style={{ width: '100%', }}
                        >
                            <Animatable.View
                                animation={addPostAnimation}
                                style={{ width: '100%' }}>

                                <CardView cardElevation={2} style={{ width: '90%', alignSelf: 'center', marginTop: 15 }}>
                                    <View style={{ backgroundColor: 'white', padding: 15 }}>

                                        <TouchableOpacity
                                            onPress={() => addPostImageClicked()}
                                            activeOpacity={0.8}
                                            style={{ width: '100%', backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center', height: RFValue(170) }}>
                                            {
                                                avatarSource != "" ? (
                                                    <Image
                                                        style={{ height: '100%', width: '100%' }}
                                                        source={{ uri: avatarSource }}
                                                    >
                                                    </Image>
                                                ) : (
                                                    <Image
                                                        style={{ height: RFValue(80), width: RFValue(80) }}
                                                        source={Theme.icons.ic_plus_add}></Image>
                                                )
                                            }

                                        </TouchableOpacity>
                                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 15 }}>
                                            <TextInput style={{
                                                letterSpacing: 0.4, fontFamily: Theme.fontFamily.medium,
                                                fontSize: Theme.fontSize.regular
                                            }}
                                                placeholder="Enter Title"
                                                placeholderTextColor="black"
                                                value={txtFeedTitle}
                                                onChangeText={txt => settxtFeedTitle(txt)}
                                            ></TextInput>
                                            <TextInput style={{
                                                color: Theme.colors.sendMeGray, marginTop: 5,
                                                letterSpacing: 0.4, fontFamily: Theme.fontFamily.regular,
                                                fontSize: Theme.fontSize.semiSmall1,
                                                maxHeight: RFValue(60)
                                            }}
                                                placeholder="Enter Descriptions"
                                                placeholderTextColor="darkgray"
                                                multiline
                                                textAlignVertical="top"
                                                numberOfLines={3}
                                                value={txtFeedDesc}
                                                onChangeText={txt => settxtFeedDesc(txt)}
                                            ></TextInput>
                                        </View>

                                    </View>
                                </CardView>
                                {
                                    isUploadingFeed ? (
                                        <ActivityIndicator size="small" color="black" style={{ marginTop: 20 }} />
                                    ) : (
                                        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '90%', alignSelf: 'center' }}>
                                            <CardView cardElevation={2} style={{ width: '45%' }}>
                                                <TouchableOpacity
                                                    onPress={() => btnPostFeedCancelClicked()}
                                                    activeOpacity={0.8}
                                                    style={{
                                                        backgroundColor: 'white', height: RFValue(38),
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                    <Text style={{
                                                        fontFamily: Theme.fontFamily.regular,
                                                        letterSpacing: 0.4,
                                                        fontSize: Theme.fontSize.semiSmall1
                                                    }}>Cancel</Text>
                                                </TouchableOpacity>
                                            </CardView>
                                            <CardView cardElevation={2} style={{ width: '45%' }}>
                                                <TouchableOpacity
                                                    onPress={() => btnSavePostClicked()}
                                                    activeOpacity={0.8}
                                                    style={{
                                                        backgroundColor: Theme.colors.sendMeBlue,
                                                        height: RFValue(38), alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                    <Text style={{
                                                        fontFamily: Theme.fontFamily.regular,
                                                        letterSpacing: 0.4, color: 'white',
                                                        fontSize: Theme.fontSize.semiSmall1
                                                    }}>Save</Text>
                                                </TouchableOpacity>
                                            </CardView>

                                        </View>
                                    )
                                }

                            </Animatable.View>
                        </KeyboardAwareScrollView>
                    ) : (
                        <View></View>
                    )
                }

                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 20, opacity: isAddingPost ? 0 : 1 }}
                    style={{ width: '100%', flex: 1, marginTop: 5 }}
                    data={arrFeed}
                    renderItem={renderFeedItem}
                    keyExtractor={(item, index) => index}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    refreshing={isPullToRefreshing}
                    onRefresh={() => onPullToRefresh()}
                />



                <KeyboardAccessoryView />
            </View>
            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isImagePickerVisible}
                onRequestClose={() => { onRequestCloseImagePickerModal() }}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>
                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center' }}>
                        <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.roman, fontSize: Theme.fontSize.medium, marginTop: 14.5 }}>Choose Profile Image</Text>
                        <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.book, fontSize: Theme.fontSize.regularX, marginTop: 10 }}>Where would you like to choose a new image from?</Text>
                        <Text allowFontScaling={false} style={{ height: 30 }}></Text>
                        <TouchableOpacity
                            onPress={() => btnImagePickerClicked("Photo")}
                            activeOpacity={0.7}
                            style={[styContainer.profilePicturePickerButton, { borderTopWidth: 0.3 }]}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.medium }]}>Photos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => btnImagePickerClicked("Camera")}
                            activeOpacity={0.7}
                            style={styContainer.profilePicturePickerButton}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.medium }]}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => { onRequestCloseImagePickerModal() }}
                            activeOpacity={0.7}
                            style={styContainer.profilePicturePickerButton}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.regular }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isMenuOptionVisible}
                onRequestClose={() => { onRequestCloseImagePickerModal() }}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>
                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center' }}>
                        <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.book, fontSize: Theme.fontSize.regularX, marginTop: 10 }}>Manage Feed</Text>
                        <Text allowFontScaling={false} style={{ height: 20 }}></Text>
                        <TouchableOpacity
                            onPress={() => btnPostOptionClicked("edit")}
                            activeOpacity={0.7}
                            style={[styContainer.profilePicturePickerButton, { borderTopWidth: 0.3 }]}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.medium }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => btnPostOptionClicked("delete")}
                            activeOpacity={0.7}
                            style={styContainer.profilePicturePickerButton}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.medium }]}>Delete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setisMenuOptionVisible(false)}
                            activeOpacity={0.7}
                            style={styContainer.profilePicturePickerButton}>
                            <Text allowFontScaling={false} style={[styContainer.profilePicturePickerText, { fontFamily: Theme.fontFamily.regular }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <Modal useNativeDriver={true}
                onRequestClose={() => { setisShowImageViewer(false) }}
                visible={isShowImageViewer} transparent={true}>
                <ImageViewer index={selectedImgIndx}
                    enablePreload
                    swipeDownThreshold={50}
                    onCancel={() => setisShowImageViewer(false)}
                    enableSwipeDown={true} useNativeDriver={true}
                    imageUrls={arrViewerImages} />
                <TouchableOpacity onPress={() => btnCloseClicked()} style={{ marginTop: 30, marginLeft: 10, position: 'absolute' }}>
                    <Image
                        style={{ tintColor: 'white', height: 30, width: 30 }}
                        source={Theme.icons.ic_close}>
                    </Image>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView >
    )
}

export default missionaryFeedView

missionaryFeedView['navigationOptions'] = screenProps => ({
    header: null
})
