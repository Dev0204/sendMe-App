import React, { useRef, useState, useEffect } from 'react';
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
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE, ISLIVE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import * as Animatable from 'react-native-animatable';

const imgPickerOptions = {
    title: 'Choose Missionary Profile Image From',
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


const missionaryGoalView = (props) => {

    const [selectedTab, setselectedTab] = useState(0)
    const [firstName, setfirstName] = useState("")
    const [lastName, setlastName] = useState("")
    const [ani_validate, setani_validate] = useState(null)
    const [missionLocation, setmissionLocation] = useState("")
    const [missionDetails, setmissionDetails] = useState("")
    const [missionGoal, setmissionGoal] = useState("")
    const [isBtnSubmitClicked, setisBtnSubmitClicked] = useState(false)
    const [isImagePickerVisible, setisImagePickerVisible] = useState(false)
    const [avatarSource, setavatarSource] = useState("")
    const [isAvatarChanged, setisAvatarChanged] = useState(false)
    const [stripeCreateBankAccountUrl, setstripeCreateBankAccountUrl] = useState("")
    const [addBankTitle, setaddBankTitle] = useState("Please wait...")
    const [uploaded_profile_photo_name, setuploaded_profile_photo_name] = useState("")
    const [btnShowLoading, setbtnShowLoading] = useState(false)
    const [paymentDetailAccepted, setpaymentDetailAccepted] = useState(false)
    const [tosAccepted, settosAccepted] = useState(false)
    const currentUser = getCurrentUserData()
    const serverConfig = getConfigurationData()


    useEffect(() => {
        setfirstName(currentUser.display_name)
        if (currentUser.missionary_goal) {
            setmissionDetails(currentUser.missionary_goal.missionary_details + "")
            setmissionLocation(currentUser.missionary_goal.missionary_location + "")
            setmissionGoal(currentUser.missionary_goal.missionary_goal + "")
            setavatarSource(currentUser.missionary_goal.missionary_profile.trim() == "" ? "" : ((ISLIVE ? serverConfig.img_live_base_url : serverConfig.img_dev_base_url) + "/" + currentUser.missionary_goal.missionary_profile))

            setTimeout(() => {
                console.log("~~~~~>>> ", avatarSource)
                if (missionDetails.trim() != "" &&
                    missionLocation.trim() != "" &&
                    missionGoal.trim() != "") {
                    btnTabClicked(1)
                }
            }, 50);
            getCreateBankAccountURL()

        }
    }, [])


    function btnTabClicked(idx) {
        setselectedTab(idx)
    }

    const _updateMasterStateFirstName = (attrName, value) => {
        setfirstName(value)
    }

    const _updateMasterStateMissionLocation = (attrName, value) => {
        setmissionLocation(value)
    }

    const _updateMasterStateMissionDetails = (attrName, value) => {
        setmissionDetails(value)
    }

    const _updateMasterStateMissionGoal = (attrName, value) => {
        setmissionGoal(value)
    }


    function btnGetReadyClicked() {
        Keyboard.dismiss()
        setisBtnSubmitClicked(true)

        if (checkVal(missionLocation) && checkVal(missionDetails)
            && checkVal(missionGoal)) {
            /*if (_this.state.avatarSource == "") {
                Alert.alert("Please add profile photo!")
                return
            }*/

            /*if (_this.state.isAvatarChanged) {
                _this.setState({
                    btnShowLoading: true
                })
                UPLOAD_PROFILE("uploadMissionaryProfilePhoto", {
                    profile_photo: {
                        uri: _this.state.avatarSource,
                        type: "image/png",
                        name: "photo.png",
                    }
                }).then((res) => {
                    console.log(res)
                    _this.setState({
                        btnShowLoading: false
                    })
                    if (res.status == 1) {
                        let profilePhotoName = res.photo_name
                        _this.submitForData(profilePhotoName)
                    }
                    else {
                        setTimeout(function () {
                            Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                        }, 50)
                    }
                })
            }
            else {
                _this.submitForData(currentUser.missionary_goal.missionary_profile)
            }*/
            let goal = missionGoal
            if (goal <= 0 || isNaN(goal)) {
                Alert.alert("Please enter valid goal amount!")
                return
            }

            submitForData()
        }
    }

    function submitForData() {
        let param = {
            missionary_location: missionLocation + "",
            missionary_details: missionDetails + "",
            missionary_goal: missionGoal + ""
            //profile_photo_name: profilePhotoName
        }

        console.log(param)
        setbtnShowLoading(true)
        CALL_API("updateMissionaryGoal", param).then((res) => {
            setTimeout(() => {
                setbtnShowLoading(false)
            }, 1000);
            if (res.errMsg != null) {
                Reload_API_Alert(res.errMsg).then((res) => {
                    if (res) {
                        btnGetReadyClicked()
                    }
                })
                return
            }

            if (res.status == 1) {
                getCreateBankAccountURL()
                setTimeout(() => {
                    setisAvatarChanged(false)
                }, 50);
                syncUserWithServer().then((res) => {
                    if (res) {
                        currentUser = getCurrentUserData()
                    }
                })
            }
            else {
                setTimeout(function () {
                    Alert.alert(AppConstants.errorAlertDefaultTitle, res.msg)
                }, 50)
            }

        })
    }

    function getCreateBankAccountURL() {
        CALL_API("getCreateBankAccountURL", {}, "post").then((res) => {
            if (res.url) {
                setstripeCreateBankAccountUrl(res.url)
                btnTabClicked(1)
            }
            else {
                setTimeout(() => {
                    Reload_API_Alert("Something went wrong. Please try again").then((res) => {
                        if (res) {
                            getCreateBankAccountURL()
                        }
                    })
                }, 50);
            }
        })
    }

    function checkVal(attrName) {
        return attrName.trim().length == 0 ? false : true
    }

    function onRequestCloseImagePickerModal() {
        Keyboard.dismiss()
        setisImagePickerVisible(false)
    }

    function btnGoBackClicked() {
        if (selectedTab == 1) {
            setselectedTab(0)
        }
        else {
            props.navigation.navigate("missionaryAccountSetupInfoView")
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

    function _onMessage(event) {
        if (event.nativeEvent.data.includes("<body>&nbsp;</body>")) {
            syncUserWithServer().then((res) => {
                if (res) {
                    props.navigation.navigate("oneTimeFeeView")
                }
            })
        }
    }

    function btnAcceptPaymentClicked() {
        if (!tosAccepted) {
            setani_validate("shake")
            setTimeout(() => {
                setani_validate(null)
            }, 500);
            return
        }
        setpaymentDetailAccepted(true)
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

    const _webview = useRef(null)
    function webViewLoadEnd(event) {
        // _webview.injectJavaScript("window.ReactNativeWebView.postMessage(document.documentElement.outerHTML)")
        setaddBankTitle('Add Bank Account')
    }

    function btnImagePickerClicked(pickerType) {
        setisImagePickerVisible(false)
        if (pickerType == "Photo") {
            ImagePicker.launchImageLibrary(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setisAvatarChanged(true)
                }
            });
        }
        else if (pickerType == "Camera") {
            ImagePicker.launchCamera(imgPickerOptions, (response) => {
                if (response.uri) {
                    // const source = { uri: response.uri };
                    setavatarSource(response.uri)
                    setisAvatarChanged(true)
                }
            });
        }
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

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: RFValue(130), marginTop: RFValue(-5) }}>
                    <View style={{ position: 'absolute', width: '95%', height: 3, backgroundColor: '#EAEAEA' }}></View>
                    <Image resizeMode="contain" style={{ position: 'absolute', width: RFValue(11) }} source={Theme.icons.ic_step_next_arrow}></Image>
                    <View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setselectedTab(0)}>
                            <CardView cardElevation={Platform.OS == "android" ? 4 : 2} cornerRadius={17.5} style={[styContainer.missionaryGoalStepView, { marginTop: 18, marginRight: 60, backgroundColor: selectedTab == 0 ? Theme.colors.sendMeBlue : 'white' }]}>
                                <Text style={[styContainer.missionaryGoalStepTextView, { color: selectedTab == 0 ? 'white' : "#BBBBBB" }]}>1</Text>
                            </CardView>
                        </TouchableOpacity>
                        <Text style={[styContainer.missionaryGoalStepTextView, { fontFamily: Theme.fontFamily.regular, marginTop: 5, color: selectedTab == 0 ? Theme.colors.sendMeBlue : "#BBBBBB" }]}>STEP</Text>
                    </View>
                    <View>

                        <CardView cardElevation={Platform.OS == "android" ? 4 : 2} cornerRadius={17.5} style={[styContainer.missionaryGoalStepView, { marginTop: 18, backgroundColor: selectedTab == 1 ? Theme.colors.sendMeBlue : 'white' }]}>
                            <Text style={[styContainer.missionaryGoalStepTextView, { color: selectedTab == 1 ? 'white' : '#BBBBBB' }]}>2</Text>
                        </CardView>

                        <Text style={[styContainer.missionaryGoalStepTextView, { fontFamily: Theme.fontFamily.regular, marginTop: 5, color: selectedTab == 1 ? Theme.colors.sendMeBlue : "#BBBBBB" }]}>STEP</Text>
                    </View>
                </View>
                {
                    selectedTab == 0 ? (
                        <KeyboardAwareScrollView
                            automaticallyAdjustContentInsets={false}
                            contentContainerStyle={{ paddingTop: 20, alignItems: 'center' }}
                            keyboardShouldPersistTaps={'handled'}
                            style={{ width: '100%', flex: 1 }}>

                            <View style={{ width: '100%', alignItems: 'center' }}>

                                {/* <View>
                                <TouchableOpacity
                                    onPress={() => this.btnImgProfileClicked()}
                                    activeOpacity={0.7}>
                                    <FastImage resizeMode="contain"
                                        source={{ uri: this.state.avatarSource }}
                                        style={{ borderRadius: RFValue(50), height: RFValue(100), width: RFValue(100), backgroundColor: 'darkgray' }}></FastImage>
                                </TouchableOpacity>
                                <View style={{ position: "absolute", borderRadius: 15, height: 30, width: 30, justifyContent: 'center', alignItems: 'center', bottom: 20, right: 5, backgroundColor: Theme.colors.sendMeBlue }}>
                                    <Icon size={15} name={'camera'} color={'white'} />
                                </View>
                                <Text style={{
                                    fontFamily: Theme.fontFamily.regular,
                                    fontSize: Theme.fontSize.semi_Small,
                                    marginTop: 5
                                }}>Add Profile Image</Text>
                            </View> */}

                                <View pointerEvents={'none'} style={{ flexDirection: 'row' }}>
                                    {/* <View style={{ width: '47%', alignItems: 'center' }}> */}
                                    <CustomTextInputView
                                        attrName='firstName'
                                        title={"Full Name"}
                                        value={firstName}
                                        // isErrorRedBorder={(this.state.firstName.trim().length == 0 && this.state.isBtnSubmitClicked) ? true : false}
                                        updateMasterState={_updateMasterStateFirstName}
                                        otherTextInputProps={{
                                            placeholder: "First Name",
                                            autoCorrect: false,
                                            opacity: 0.7
                                        }}
                                    />
                                    {/* </View> */}
                                    {/* <View style={{ width: '47%', alignItems: 'center' }}>
                                    <CustomTextInputView
                                        attrName='lastName'
                                        title={" "}
                                        value={this.state.lastName}
                                        isErrorRedBorder={(this.state.lastName.trim().length == 0 && this.state.isBtnSubmitClicked) ? true : false}
                                        updateMasterState={this._updateMasterState}
                                        otherTextInputProps={{
                                            placeholder: "Last Name",
                                            autoCorrect: false,
                                            opacity: 0.7
                                        }}
                                    />
                                </View> */}

                                </View>
                            </View>

                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='missionLocation'
                                title={"Mission Location"}
                                value={missionLocation}
                                isErrorRedBorder={(missionLocation.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterStateMissionLocation}
                                otherTextInputProps={{
                                    placeholder: "Enter Location",
                                    autoCorrect: false,
                                    autoCapitalize: 'none'
                                }}
                            />

                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='missionDetails'
                                title={"Mission Details"}
                                value={missionDetails}
                                isErrorRedBorder={(missionDetails.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterStateMissionDetails}
                                otherTextInputProps={{
                                    placeholder: "Enter Details",
                                    autoCorrect: false,
                                    autoCapitalize: 'none'
                                }}
                            />
                            <View style={{ height: 20 }}></View>
                            <CustomTextInputView
                                attrName='missionGoal'
                                title={"Total Goal to Raise"}
                                value={missionGoal}
                                isErrorRedBorder={(missionGoal.trim().length == 0 && isBtnSubmitClicked) ? true : false}
                                updateMasterState={_updateMasterStateMissionGoal}
                                keyboardType="number-pad"
                                otherTextInputProps={{
                                    placeholder: "Enter Goal in $",
                                    autoCorrect: false,
                                    autoCapitalize: 'none'
                                }}
                            />

                            <View style={{ height: 30 }}></View>

                        </KeyboardAwareScrollView>
                    ) : (
                        paymentDetailAccepted ? (
                            <View style={{ flex: 1, width: '100%' }}>
                                <Text style={{
                                    fontFamily: Theme.fontFamily.medium, fontSize: theme.fontSize.semiRegular,
                                    textAlign: 'center', marginTop: 5, marginBottom: 5
                                }}>{addBankTitle}</Text>
                                <WebView
                                    ref={_webview}
                                    onMessage={_onMessage}
                                    style={{ height: '100%', width: '100%', backgroundColor: 'white' }}
                                    source={{ uri: stripeCreateBankAccountUrl }}
                                    onLoadEnd={syntheticEvent => {
                                        webViewLoadEnd(syntheticEvent)
                                        //this.setState({ txt_title: _txt_view_title })
                                    }}
                                    onLoadStart={syntheticEvent => {
                                        setaddBankTitle("Loading...")
                                    }}>
                                </WebView>

                            </View>
                        ) : (
                            <View style={{ flex: 1, width: '100%' }}>
                                <Text style={{ textAlign: 'center', fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.regular, marginTop: 10 }}>Payment Details</Text>
                                <View style={{ flex: 1 }}>
                                    <ScrollView contentContainerStyle={{ paddingBottom: 50 }} style={{ padding: 15, }}>
                                        <Text style={{ fontFamily: Theme.fontFamily.regular, letterSpacing: 0.5, fontSize: Theme.fontSize.small }}>{"- The sponsor's bank account will initiate payments every other Friday for the total amount of spare change rounded up in the account. If the amount is lower than $10, the payment will not process until the account reaches a minimum of $10.\n\n- A sponsor can also send a one-time payment in addition to round up payments at any time.\n\n- The sponsor must pause their payments in order to stop payments from being initiated. If payments are not paused, the payments will be initiated during schedule periods of every other Friday.\n\n- If a missionary, pauses or deactivates there account, the Sponsor's payments will be paused and the payments will not resume unless the account/mission are reactivated.\n\n- The missionary will receive 90% of each payment and 10% will be sent to SendMe to cover Stripe fees, Plaid fees, and admin fees. This is for both round up and one-time payments."}</Text>
                                    </ScrollView>
                                </View>
                                <Animatable.View
                                    animation={ani_validate} style={{ width: '100%', padding: 14, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => btnTosAcceptClicked()}
                                        activeOpacity={0.7}
                                        style={{ height: RFValue(30), width: RFValue(30), justifyContent: 'center', alignItems: 'center' }}>
                                        <CardView cardElevation={1}>
                                            <Image style={{ tintColor: tosAccepted ? 'black' : '#c9c9c9', height: RFValue(22), width: RFValue(22) }} source={tosAccepted ? Theme.icons.ic_checked : Theme.icons.ic_unchecked}></Image>
                                        </CardView>
                                    </TouchableOpacity>
                                    <Text style={{
                                        marginLeft: RFValue(5), letterSpacing: 0.5, flex: 1,
                                        fontFamily: Theme.fontFamily.regular,
                                        fontSize: Theme.fontSize.semiSmall1,
                                        color: Theme.colors.sendMeBlack
                                    }}>
                                        <Text>
                                            {"By selecting this box, I understand and accept the above terms."}
                                        </Text>
                                    </Text>
                                </Animatable.View>
                                <View style={{ marginBottom: 10 }}>
                                    <CustomButton title="Continue"
                                        isLoading={btnShowLoading}
                                        onButtonClicked={btnAcceptPaymentClicked} />
                                </View>
                            </View>
                        )

                    )
                }


                {
                    selectedTab == 1 ? (
                        <View></View>
                    ) : (
                        <View style={{ width: '100%', marginBottom: 10 }}>
                            <CustomButton title="Submit"
                                isLoading={btnShowLoading}
                                onButtonClicked={btnGetReadyClicked} />
                        </View>
                    )
                }

                {
                    selectedTab == 0 ? (
                        <KeyboardAccessoryView />
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
                        <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: Theme.fontFamily.roman, fontSize: Theme.fontSize.medium, marginTop: 14.5 }}>Choose Missionary Profile Image</Text>
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

export default missionaryGoalView


missionaryGoalView['navigationOptions'] = screenProps => ({
    header: null
})