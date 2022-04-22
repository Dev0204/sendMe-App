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
import { EmailValidtor, PasswordValidtor } from '../../module/validator'
import { CALL_API, Reload_API_Alert, syncUserWithServer, saveCurrentUserData, getCurrentUserData, UPLOAD_PROFILE, getConfigurationData } from '../../api/api';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-picker';
import { EventRegister } from 'react-native-event-listeners'
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey } from '../../module/cacheData'

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
let serverConfig = {}

const signInView = (props) => {

    serverConfig = getConfigurationData()
    let initSignIn = props.navigation.getParam("initSignIn", false)
    const [selectedTab, setselectedTab] = useState(initSignIn ? 1 : 0)
    const [firstName, setfirstName] = useState("")
    const [lastName, setlastName] = useState("")
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [confirmPassword, setconfirmPassword] = useState("")
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [isAnyValidationError, setisAnyValidationError] = useState(false)
    const [tosAccepted, settosAccepted] = useState(false)
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [visibleBottomView, setvisibleBottomView] = useState(true)
    const [isImagePickerVisible, setisImagePickerVisible] = useState(false)
    const [avatarSource, setavatarSource] = useState("")
    const [isAvtarChanged, setisAvtarChanged] = useState(false)
    const [isPasswordReset, setisPasswordReset] = useState(false)


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        const autoFillEmailAfterResetPasswordListener = EventRegister.addEventListener('autoFillEmailAfterResetPasswordListener', (data) => {
            setemail(data.email)
        })
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            EventRegister.removeEventListener(autoFillEmailAfterResetPasswordListener)
        }
    }, [])


    function _keyboardDidShow() {
        setvisibleBottomView(false)
    }

    function _keyboardDidHide() {
        setvisibleBottomView(true)
    }

    const btnTabClicked = (idx) => {
        Keyboard.dismiss()
        setselectedTab(idx)
    }

    const _updateMasterStateFirstname = (attrName, value) => {
        setfirstName(value)
    }

    const _updateMasterStateLastname = (attrName, value) => {
        setlastName(value)
    }

    const _updateMasterStateEmail = (attrName, value) => {
        setemail(value)
    }

    const _updateMasterStatePassword = (attrName, value) => {
        setpassword(value)
    }

    const _updateMasterStateConfirmPassword = (attrName, value) => {
        setconfirmPassword(value)
    }

    function btnGetReadyClicked() {
        Keyboard.dismiss()
        if (btnShowLoading) {
            return
        }
        setisBtnSubmitClicked(true)
        if (selectedTab == 0) {
            btnSignUpClicked()
        }
        else {
            btnLoginClicked()
        }
    }

    function btnSignUpClicked() {
        if (checkVal(firstName) && checkVal(lastName) && checkVal(email) && checkVal(password) && checkVal(confirmPassword)) {
            if (!EmailValidtor(email)) {
                Alert.alert(AppConstants.StringLiterals.strEmailFormatFail)
                return
            }
            if (!PasswordValidtor(password)) {
                Alert.alert(AppConstants.StringLiterals.strPasswordFailMinCharacter)
                return
            }
            if (password != confirmPassword) {
                Alert.alert(AppConstants.StringLiterals.strPasswordDoesnNotMatch)
                return
            }
            if (!tosAccepted) {
                Alert.alert("Please accept terms & condition in order to user app.")
                return
            }

            if (avatarSource == "") {
                Alert.alert("Please choose profile photo.")
                return
            }
            setbtnShowLoading(true)

            let objFirbaseEvent = {
                eventTitle: "button_clicked",
                eventObject: {
                    button: "Sign_Up"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

            UPLOAD_PROFILE("uploadUserProfilePhoto", {
                profile_photo: {
                    uri: avatarSource,
                    type: "image/png",
                    name: "photo.png",
                }
            }).then((res) => {
                console.log(res)
                setbtnShowLoading(false)
                if (res.status == 1) {
                    let profilePhotoName = res.photo_name
                    signupWithProfileName(profilePhotoName)
                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }
            })
        }
    }


    function signupWithProfileName(profile_name) {
        let param = {
            display_name: firstName + " " + lastName,
            email: email,
            password: password,
            profile_photo: profile_name,
            user_time_zone: serverConfig.time_zone
        }
        console.log(param)
        setbtnShowLoading(true)
        setTimeout(() => {
            setbtnShowLoading(false)
        }, AppConstants.loaderTimeOutDuration * 1000);
        CALL_API("registerUser", param).then((res) => {
            console.log(res)
            setTimeout(() => {
                setbtnShowLoading(false)
            }, 1000)

            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnSignUpClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                saveCurrentUserData(res.data)
                saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData, res.data)
                props.navigation.navigate("userTypeSelectionView")
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }

    function btnLoginClicked() {
        if (checkVal(email) && checkVal(password)) {
            if (!EmailValidtor(email)) {
                Alert.alert("Please enter valid email")
                return
            }

            let param = {
                email: email,
                password: password
            }

            setbtnShowLoading(true)
            setTimeout(() => {
                setbtnShowLoading(false)
            }, AppConstants.loaderTimeOutDuration * 1000);

            let objFirbaseEvent = {
                eventTitle: "button_clicked",
                eventObject: {
                    button: "Sign_In"
                }
            }
            EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

            CALL_API("login", param).then(async (res) => {
                console.log(res)
                setTimeout(() => {
                    setbtnShowLoading(false)
                }, 1 * 1000);

                if (res.errMsg != null) {
                    Reload_API_Alert(res.errMsg).then((res) => {
                        if (res) {
                            btnLoginClicked()
                        }
                    })
                    return
                }

                if (res.status == 1) {
                    saveCurrentUserData(res.data)
                    saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData, res.data)
                    syncUserWithServer().then((res) => {

                    })
                    let currentUser = getCurrentUserData()
                    if (currentUser.user_type == "") {
                        props.navigation.navigate("userTypeSelectionView")
                    }
                    else {
                        if (currentUser.user_type == "missionary") {
                            if (currentUser.is_intro_screen_viewed == 0) {
                                props.navigation.navigate("missionaryAccountSetupInfoView")
                            }
                            else if (!currentUser.missionary_goal) {
                                props.navigation.navigate("missionaryGoalView1")
                            }
                            else if (currentUser.stripe_connect_id == "") {
                                props.navigation.navigate("missionaryGoalView1")
                            }
                            else if (currentUser.is_one_time_fee_taken == 0) {
                                props.navigation.navigate("oneTimeFeeView")
                            }
                            else {
                                props.navigation.navigate("missionaryHomeView")
                            }
                        }
                        else if (currentUser.user_type == "sponsor") {
                            if (currentUser.is_intro_screen_viewed == 0) {
                                props.navigation.navigate("sponsorAccountSetupInfoView")
                            }
                            else if (!currentUser.missionary) {
                                props.navigation.navigate("missionarySelectionListView1")
                            }
                            else if (currentUser.stripe_customer_id == "") {
                                props.navigation.navigate("sponsarGetBankAndCardInfoView1")
                            }
                            else {
                                props.navigation.navigate("sponsarHomeView")
                            }
                        }
                    }
                    //this.props.navigation.navigate("userTypeSelectionView")
                }
                else {
                    setTimeout(function () {
                        Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                    }, 50)
                }

            })

        }
    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    function btnAccountOptionClicked() {
        if (selectedTab == 0) {
            setTimeout(() => {
                setselectedTab(1)
            }, 50);
        }
        else {
            setTimeout(() => {
                setselectedTab(0)
            }, 50);
        }
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
                    console.log("^%^%%^^%^%")
                    console.log(response)
                    console.log("^%^%%^^%^%")
                    // ImgToBase64.getBase64String(response.uri)
                    //     .then(base64String => this.setState({ base64ImageString: base64String }))
                    //     .catch(err => console.log(err));

                    setavatarSource(source.uri)
                    setisAvtarChanged(true)
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

    function btnImagePickerClicked(pickerType) {
        setisImagePickerVisible(false)
        if (pickerType == "Photo") {
            ImagePicker.launchImageLibrary(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setisAvtarChanged(true)
                }
            });
        }
        else if (pickerType == "Camera") {
            ImagePicker.launchCamera(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setisAvtarChanged(true)
                }
            });
        }

    }

    function tosLinkClicked(type) {
        if (type == "terms") {
            props.navigation.navigate("commonWebView1", {
                url: serverConfig.terms_condition_url
            })
        }
        else if (type == "conditions") {
            props.navigation.navigate("commonWebView1", {
                url: serverConfig.privacy_policy_url
            })
        }

    }

    function onRequestCloseResetPasswordModal() {
        Keyboard.dismiss()
        setisPasswordReset(false)
    }

    function btnForgotPasswordClicked() {
        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "forgot_password"
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        props.navigation.navigate("resetPasswordView")
    }

    function btnGoBackClicked() {
        props.navigation.goBack()
    }

    const rf_firstName = useRef(null)
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

                <CardView cardElevation={Platform.OS == "android" ? 4 : 2} style={{ backgroundColor: 'white', flexDirection: 'row', marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => btnTabClicked(0)}
                        activeOpacity={0.7}>
                        <Text style={[styContainer.btnTabStyle, { backgroundColor: selectedTab == 0 ? Theme.colors.sendMeBlue : 'white', color: selectedTab == 0 ? 'white' : Theme.colors.sendMeBlack }]}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => btnTabClicked(1)}
                        activeOpacity={0.7}>
                        <Text style={[styContainer.btnTabStyle, { backgroundColor: selectedTab == 1 ? Theme.colors.sendMeBlue : 'white', color: selectedTab == 1 ? 'white' : Theme.colors.sendMeBlack }]}>Login</Text>
                    </TouchableOpacity>
                </CardView>
                <KeyboardAwareScrollView

                    automaticallyAdjustContentInsets={false}
                    contentContainerStyle={{ paddingTop: 20, alignItems: 'center' }}
                    keyboardShouldPersistTaps={'handled'}
                    style={{ width: '100%' }}>
                    {
                        selectedTab == 0 ? (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{ alignItems: 'center' }}
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
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '47%', alignItems: 'center' }}>
                                        <CustomTextInputView
                                            attrName='firstName'
                                            ref={rf_firstName}
                                            title={"Name"}
                                            value={firstName}
                                            isErrorRedBorder={(firstName.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                            updateMasterState={_updateMasterStateFirstname}
                                            otherTextInputProps={{
                                                placeholder: "First Name",
                                                autoCorrect: false,
                                            }}
                                        />
                                    </View>
                                    <View style={{ width: '47%', alignItems: 'center' }}>
                                        <CustomTextInputView
                                            attrName='lastName'
                                            ref={rf_end_time}
                                            title={" "}
                                            value={lastName}
                                            updateMasterState={_updateMasterStateLastname}
                                            isErrorRedBorder={(lastName.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                            otherTextInputProps={{
                                                placeholder: "Last Name",
                                                autoCorrect: false
                                            }}
                                        />
                                    </View>

                                </View>
                                <View style={{ height: 20 }}></View>
                            </View>
                        ) : (
                            <View></View>
                        )
                    }

                    <CustomTextInputView
                        attrName='email'
                        ref={rf_end_time}
                        title={"Email"}
                        value={email}
                        isErrorRedBorder={(email.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                        keyboardType="email-address"
                        updateMasterState={_updateMasterStateEmail}
                        otherTextInputProps={{
                            placeholder: "Email",
                            autoCorrect: false,
                            autoCapitalize: 'none'
                        }}
                    />
                    <View style={{ height: 20 }}></View>
                    <CustomTextInputView
                        attrName='password'
                        ref={rf_end_time}
                        title={"Password"}
                        value={password}
                        isErrorRedBorder={(password.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                        updateMasterState={_updateMasterStatePassword}
                        otherTextInputProps={{
                            placeholder: "Password",
                            autoCorrect: false,
                            secureTextEntry: true,
                            autoCapitalize: 'none'
                        }}
                    />
                    {
                        selectedTab == 0 ? (
                            <View>
                                <View style={{ height: 20 }}></View>
                                <CustomTextInputView
                                    attrName='confirmPassword'
                                    ref={rf_end_time}
                                    title={"Confirm Password"}
                                    value={confirmPassword}
                                    isErrorRedBorder={(confirmPassword.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                    updateMasterState={_updateMasterStateConfirmPassword}
                                    otherTextInputProps={{
                                        placeholder: "Confirm Password",
                                        autoCorrect: false,
                                        secureTextEntry: true,
                                        autoCapitalize: 'none'
                                    }}
                                />
                                <View style={{ height: 50 }}></View>
                            </View>
                        ) : (
                            <View style={{ marginTop: 5, paddingRight: 0, width: '90%', justifyContent: 'space-between', flexDirection: 'row' }}>
                                <View></View>
                                <TouchableOpacity
                                    onPress={() => btnForgotPasswordClicked()}
                                    activeOpacity={0.7}>
                                    <Text style={{
                                        fontFamily: Theme.fontFamily.regular,
                                        fontSize: Theme.fontSize.small,
                                        color: Theme.colors.sendMeBlack,
                                        padding: 7
                                    }}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }


                </KeyboardAwareScrollView>
                <KeyboardAccessoryView />
                {
                    (selectedTab == 0 && visibleBottomView) ? (
                        <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
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
                                    {"By selecting, I agree to the "}
                                </Text>
                                <Text
                                    onPress={() => tosLinkClicked("terms")}
                                    style={{ textDecorationLine: 'underline', color: Theme.colors.sendMeBlue }}>
                                    {"Terms & Conditions"}
                                </Text>
                                <Text>
                                    {" and "}
                                </Text>
                                <Text
                                    onPress={() => tosLinkClicked("conditions")}
                                    style={{ textDecorationLine: 'underline', color: Theme.colors.sendMeBlue }}>
                                    {"Privacy Policy"}
                                </Text>
                                <Text>.</Text>
                            </Text>

                        </View>
                    ) : (
                        <View></View>
                    )
                }
                {
                    visibleBottomView ? (
                        <View style={{ width: '100%' }}>
                            <View style={{ width: '100%', marginBottom: 5 }}>
                                <CustomButton title={selectedTab == 0 ? "Get Ready" : "Login"}
                                    isLoading={btnShowLoading}
                                    onButtonClicked={btnGetReadyClicked} />
                            </View>
                            <TouchableOpacity
                                onPress={() => btnAccountOptionClicked()}
                                activeOpacity={0.7}
                                style={{ width: '100%', marginBottom: 5, alignItems: 'center' }}>
                                <Text style={{ letterSpacing: 0.4, padding: 10, fontSize: Theme.fontSize.semiSmall1, fontFamily: Theme.fontFamily.regular, color: "#8D9496" }}>
                                    <Text>
                                        {selectedTab == 0 ? "Already have an account? " : "You don't have account? "}
                                    </Text>
                                    <Text style={{ color: Theme.colors.sendMeBlue }}>{selectedTab == 0 ? "Login" : "Sign Up"}</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View></View>
                    )
                }


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

signInView['navigationOptions'] = screenProps => ({
    header: null
})


export default signInView
