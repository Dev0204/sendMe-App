import React, { useEffect, useState } from 'react';
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
import * as Animatable from 'react-native-animatable';
import { CALL_API, syncUserWithServer, getCurrentUserData, getConfigurationData, Reload_API_Alert, UPLOAD_PROFILE } from '../../api/api';
import FastImage from 'react-native-fast-image';
import { saveDataToCachedWithKey } from '../../module/cacheData';
import AboutUsView from '../commonViews/aboutUsView';
import { EventRegister } from 'react-native-event-listeners';

var currentUser = {}
let serverConfig = {}
const missionaryAccountSetupInfoView = (props) => {

    const [btnLoading, setbtnLoading] = useState(false)
    const [tosAccepted, settosAccepted] = useState(false)
    const [ani_validate, setani_validate] = useState(null)
    const [isShowingFAQ, setisShowingFAQ] = useState(false)
    currentUser = getCurrentUserData()
    serverConfig = getConfigurationData()

    function btnContinueClicked() {
        if (!tosAccepted) {
            setani_validate("shake")
            setTimeout(() => {
                setani_validate(null)
            }, 500);
            return
        }

        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "missionary_setup_account_continue"
            }
        }

        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)

        setbtnLoading(true)
        CALL_API("updateIntroScreenViewStatus").then((res) => {
            syncUserWithServer().then((res) => {
                setbtnLoading(false)
                props.navigation.navigate("missionaryGoalView1")
            })
        })
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

    function btnGoBackClicked() {
        props.navigation.navigate("userTypeSelectionView")
    }

    function onFAQClicked() {
        let objFirbaseEvent = {
            eventTitle: "button_clicked",
            eventObject: {
                button: "missionary_faq_setup_account_screen"
            }
        }
        EventRegister.emit("logFirebaseEventListener", objFirbaseEvent)
        setisShowingFAQ(true)
    }

    function onRequestCloseTerms() {
        setisShowingFAQ(false)
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
                <Text style={{
                    fontSize: Theme.fontSize.semiMedium, textAlign: 'center',
                    fontFamily: Theme.fontFamily.bold, letterSpacing: 0.8, marginTop: 20
                }}>Set-up Account</Text>
                <View style={{ flex: 1, alignItems: 'center', padding: 10, marginTop: 0 }}>
                    <ScrollView>

                        <Text style={{
                            fontSize: Theme.fontSize.semiRegular,
                            padding: 10, fontFamily: Theme.fontFamily.light,
                            letterSpacing: 0.8, marginTop: 5
                        }}>{"SendMe allows you to set-up a missionary profile to accept gifts to support your mission. Any sponsor can sign up to round up spare change to the nearest dollar for each transaction they make, which will be sent to you as a payment every other Friday. Also, the sponsors can send one-time payments directly to your bank account. You can send updates to all your sponsors with updates of your progress and mission. We want to be the easiest way for you to raise money for your mission from your sponsors.\nFor more details check out our "}
                            <Text onPress={() => onFAQClicked()} style={{ color: Theme.colors.sendMeBlue, textDecorationLine: 'underline' }}>FAQs.</Text>
                            <Text>
                                {"\n\nStep 1 - Set-up Missionary Profile\nStep 2 - Add Bank Account\nStep 3 - One-time Account Fee Set-up"}
                            </Text>
                        </Text>
                    </ScrollView>
                </View>
                <View style={{ width: '100%', marginBottom: 10 }}>
                    <Animatable.View
                        animation={ani_validate} style={{ width: '100%', padding: 14, flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 10 }}>
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
                                {"By selecting this box, I agree to Set-up account."}
                            </Text>

                        </Text>
                    </Animatable.View>
                    <CustomButton title="Continue"
                        isLoading={btnLoading}
                        onButtonClicked={btnContinueClicked} />
                </View>

            </View>

            <Modal useNativeDriver={true}
                transparent={true}
                animationType={'fade'}

                visible={isShowingFAQ}
                onRequestClose={() => { onRequestCloseTerms() }}>
                <View style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'center' }}>

                    <View style={{ borderRadius: 10, backgroundColor: 'white', width: '90%', alignSelf: 'center', height: '80%' }}>

                        <View style={{ alignItems: 'center', padding: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
                            <View style={{ height: 35, width: 35 }}></View>
                            <Text style={{
                                textAlign: 'center', fontFamily: Theme.fontFamily.regular,
                                fontSize: Theme.fontSize.semiMedium
                            }}>FAQs</Text>
                            <TouchableOpacity onPress={() => onRequestCloseTerms()} style={{ height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    style={{ height: 25, width: 25 }}
                                    source={Theme.icons.ic_close}></Image>
                            </TouchableOpacity>
                        </View>


                        <View style={{ flex: 1, width: '100%' }}>
                            <AboutUsView viewingFAQOnly={true} />
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView >
    )
}

export default missionaryAccountSetupInfoView

missionaryAccountSetupInfoView['navigationOptions'] = screenProps => ({
    header: null
})
