import React, { useState, useEffect, useRef } from 'react';
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
import { syncUserWithServer, getConfigurationData, CALL_API, Reload_API_Alert, getCurrentUserData, saveCurrentUserData, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-picker';
import { EventRegister } from 'react-native-event-listeners'
var _this = null
var currentUser = {}
var serverConfig = {}
let isFromMenu = false
const imgPickerOptions = {
    title: 'Choose Profile Photo From',
    takePhotoButtonTitle: "Take Photo",
    chooseFromLibraryButtonTitle: "Choose From Library",
    allowsEditing: true,
    imageFileType: 'jpg',
    maxWidth: 300,
    maxHeight: 300,
    cameraType: 'front',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const updateProfileView = (props) => {

    let currentUser = getCurrentUserData()
    let serverConfig = getConfigurationData()
    let isFromMenu = props.navigation.getParam("is_from_menu", false)
    const [txt_display_name, settxt_display_name] = useState("")
    const [user_profile, setuser_profile] = useState("")
    const [txt_email, settxt_email] = useState("")
    const [isLoading, setisLoading] = useState(false)
    const [btnShowLoading, setBtnShowLoading] = useState(false)
    const [isImagePickerVisible, setisImagePickerVisible] = useState(false)
    const [avatarSource, setavatarSource] = useState("")
    const [isAvatarChanged, setIsAvatarChanged] = useState(false)
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)

    useEffect(() => {
        setupUserData();
    }, [])

    function setupUserData() {
        currentUser = getCurrentUserData()
        settxt_display_name(currentUser.display_name)
        settxt_email(currentUser.email)
        setavatarSource((ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.user_profile_photo)
    }

    function btnSideMenuClicked() {
        if (isFromMenu) {
            props.navigation.toggleDrawer()
        }
        else {
            props.navigation.goBack()
        }
    }

    const _updateMasterState = (attrName, value) => {
        settxt_display_name(value)
    }

    function btnImgProfileClicked() {
        if (Platform.OS === "ios") {
            //    "Change Profile Image",
            //    "Where would you like to choose a new image from?",
            ImagePicker.showImagePicker(imgPickerOptions, (response) => {
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
                    setIsAvatarChanged(true)
                }
            })
        }
        else {
            setisImagePickerVisible(true)
        }
    }

    function onRequestCloseImagePickerModal() {
        Keyboard.dismiss()
        setisImagePickerVisible(false)
    }

    function btnSubmitClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)
        if (checkVal(txt_display_name)) {
            if (isAvatarChanged) {
                updateProfilePic()
            }
            else {
                console.log(currentUser.user_profile_photo)
                updateDisplayName(currentUser.user_profile_photo)
            }
        }

    }

    function updateProfilePic() {
        setBtnShowLoading(true)
        UPLOAD_PROFILE("uploadUserProfilePhoto", {
            profile_photo: {
                uri: avatarSource,
                type: "image/png",
                name: "photo.png",
            }
        }).then((res) => {
            setBtnShowLoading(false)
            if (res.status == 1) {
                let profilePhotoName = res.photo_name
                updateDisplayName(profilePhotoName)
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function updateDisplayName(profileName) {
        let param = {
            display_name: txt_display_name,
            user_profile_photo: profileName
        }
        console.log("~!~!~!~!")
        console.log(param)
        console.log("~!~!~!~!")

        setBtnShowLoading(true)
        CALL_API("updateUserDetails", param).then((res) => {
            setBtnShowLoading(false)

            if (res.errMsg != null) {
                Alert.alert(res.errMsg)
                return
            }

            if (res.status == 1) {
                setIsAvatarChanged(false)
                Alert.alert("Profile has been successfully updated.")
                syncUserWithServer().then((res) => {
                    setupUserData()
                    EventRegister.emit('reloadProfileListener', '')
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }
        })
    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    function btnImagePickerClicked(pickerType) {
        setisImagePickerVisible(false)
        if (pickerType == "Photo") {
            ImagePicker.launchImageLibrary(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setIsAvatarChanged(true)
                }
            });
        }
        else if (pickerType == "Camera") {
            ImagePicker.launchCamera(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setIsAvatarChanged(true)
                }
            });
        }

    }

    const rf_end_time = useRef(null)

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
            <Loader loading={isLoading} refParentView={_this} />
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                    <View style={styContainer.navigationCustomHeaderp}>
                        <View style={styContainer.navigationCustomHeaderq}>

                            <TouchableOpacity activeOpacity={0.7}
                                style={styContainer.sideMenuContainerLeft}
                                onPress={() => btnSideMenuClicked()}
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

                <KeyboardAwareScrollView

                    automaticallyAdjustContentInsets={false}
                    contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}
                    keyboardShouldPersistTaps={'handled'}
                    style={{ width: '100%', flex: 1 }}>

                    <Text style={styContainer.pageTitleText}>Update Profile</Text>
                    <TouchableOpacity
                        style={{ alignItems: 'center', marginTop: 5 }}
                        onPress={() => btnImgProfileClicked()}
                        activeOpacity={0.7}>
                        {
                            avatarSource == "" ? (
                                <Image
                                    source={Theme.icons.ic_user_profile}
                                    style={{
                                        borderRadius: RFValue(50),
                                        height: RFValue(100), width: RFValue(100),
                                        backgroundColor: 'white',
                                        tintColor: 'gray'
                                    }}></Image>
                            ) : (
                                <FastImage
                                    source={{ uri: avatarSource }}
                                    style={{
                                        borderRadius: RFValue(50),
                                        height: RFValue(100), width: RFValue(100),
                                        backgroundColor: 'darkgray'
                                    }}></FastImage>
                            )

                        }
                        <Text
                            style={{
                                fontFamily: Theme.fontFamily.regular,
                                marginTop: 5, fontSize: Theme.fontSize.semi_Small
                            }}
                        >Change Profile Image</Text>
                    </TouchableOpacity>
                    <View style={{ height: 20 }}></View>
                    {/* <Text style={{ width: '90%', }}> */}
                    {/* <Text style={{ fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small }}>{"Email: "}</Text> */}
                    <Text style={{ fontFamily: Theme.fontFamily.light, fontSize: Theme.fontSize.small }}>{currentUser.email}</Text>
                    {/* </Text> */}
                    <View style={{ height: 20 }}></View>
                    <CustomTextInputView
                        attrName='txt_display_name'
                        ref={rf_end_time}
                        title={"Name"}
                        value={txt_display_name}
                        isErrorRedBorder={(txt_display_name.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                        updateMasterState={_updateMasterState}
                        otherTextInputProps={{
                            placeholder: "Enter Name",
                            autoCorrect: false,
                            autoCapitalize: 'none'
                        }}
                    />

                </KeyboardAwareScrollView>
                <KeyboardAccessoryView />
                <View style={{ width: '100%', marginBottom: 10 }}>
                    <CustomButton title={"Submit"}
                        isLoading={btnShowLoading}
                        onButtonClicked={btnSubmitClicked} />
                </View>

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
        </SafeAreaView >
    )
}

export default updateProfileView


updateProfileView['navigationOptions'] = screenProps => ({
    header: null
})
