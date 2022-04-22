import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import NappSubmitButton from '../components/uiComponents'
import Theme from '../theme/theme'
import styContainer from '../styles/commonStyle';
import FitImage from 'react-native-fit-image';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height + (Platform.OS === "ios" ? + 20 : 0));
import { CALL_API, Reload_API_Alert, saveCurrentUserData, getCurrentUserData, getConfigurationData } from '../api/api';
import BabyLoader from '../components/babyLoader'
import AppConstants from '../module/constantVairable'
import { saveDataToCachedWithKey, getDataFromCachedWithKey } from '../module/cacheData'
import PlaidLink from 'react-native-plaid-link-sdk';
import CustomButton from '../components/customButton';
import { EventRegister } from 'react-native-event-listeners'
import * as RNIap from 'react-native-iap';

var configData = {}

const appLandingView = (props) => {

    const [isBabyLoaderShowing, setisBabyLoaderShowing] = useState(false)
    const [kDoRender, setkDoRender] = useState(false)

    configData = getConfigurationData()

    useEffect(() => {
        const rnipconnect = async () => {
            const result = await RNIap.initConnection();

            navigateToViewMissionaryListenerLandingStack = EventRegister.addEventListener('navigateToViewMissionaryListenerLandingStack', (data) => {
                props.navigation.navigate("missionaryGoalProfileView2", {
                    branch_missionary_id: data.branch_missionary_id
                })
            })

        }
        rnipconnect();
        return () => {
            EventRegister.removeEventListener(navigateToViewMissionaryListenerLandingStack)
        }
    }, [])


    function btnGetStartedClicked() {
        props.navigation.navigate("signInView")
    }

    async function btnInAppClicked() {
        const itemSkus = Platform.select({
            ios: [
                'com.fa.sendme.onetimefee'
            ],
            android: [
                'com.app.sendme.dev.onetimefee'
            ]
        });
        console.log(itemSkus)

        try {
            const products = await RNIap.getProducts(itemSkus);
            console.log("aaaa")
            Alert.alert("Total in app count: " + products.length + "")
            console.log(products)

        } catch (err) {
            console.log(err); // standardized err.code and err.message available
        }

    }

    function btnLoginClicked() {
        props.navigation.navigate("signInView", {
            initSignIn: true
        })
    }

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                <Image resizeMode="contain"
                    source={Theme.icons.img_splashscreen}
                    style={{ flex: 1, width: '88%', }} />
                <View style={{ width: '100%', marginBottom: 5 }}>
                    <CustomButton title="Get Started"
                        onButtonClicked={() => btnGetStartedClicked()} />
                </View>

                {/* <View style={{ width: '100%', marginBottom: 5 }}>
                <CustomButton title="In App Purchase"
                    onButtonClicked={this.btnInAppClicked} />
            </View> */}

                <TouchableOpacity
                    onPress={() => btnLoginClicked()}
                    activeOpacity={0.7}
                    style={{ width: '100%', marginBottom: 5, alignItems: 'center' }}>
                    <Text style={{ letterSpacing: 0.4, padding: 10, fontSize: Theme.fontSize.semiSmall1, fontFamily: Theme.fontFamily.regular, color: "#8D9496" }}>
                        <Text>
                            {"Already have an account? "}
                        </Text>
                        <Text style={{ color: Theme.colors.sendMeBlue }}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

appLandingView['navigationOptions'] = screenProps => ({
    header: null
})


export default appLandingView
