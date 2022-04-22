import React, { useState } from 'react';
import { Dimensions, SafeAreaView, View, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet, TextComponent } from 'react-native';

import Theme from '../../theme/theme'
import styContainer from '../../styles/commonStyle';
import FitImage from 'react-native-fit-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { FloatingTitleTextInputField } from '../floatingTextLib/floating_title_text_input_field';

import AppConstants from '../../module/constantVairable'
import { saveDataToCachedWithKey, getDataFromCachedWithKey } from '../../module/cacheData'
import { ScrollView } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import CardView from 'react-native-cardview';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

let _txt_view_title = ""
let _url = ""
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

const commonWebview = (props) => {

    _txt_view_title = 'Please wait...'//this.props.navigation.getParam('txt_title', '')
    _url = props.navigation.getParam('url', '')
    const [txt_title, settxt_title] = useState(_txt_view_title)
    const [isLoaded, setisLoaded] = useState(false)

    function btnBackClicked() {
        props.navigation.goBack()
    }

    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <StatusBar backgroundColor="white" barStyle="dark-content" hidden={false} />
            {/* Custome header */}
            <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                <View style={styContainer.navigationCustomHeaderp}>
                    <View style={styContainer.navigationCustomHeaderq}>
                        <TouchableOpacity activeOpacity={0.7}
                            style={styContainer.sideMenuContainerLeft}
                            onPress={() => btnBackClicked()}
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
                txt_title == "" ? (
                    <View></View>
                ) : (
                    <Text style={{ fontFamily: Theme.fontFamily.regular, letterSpacing: 0.8, fontSize: Theme.fontSize.regular, marginTop: 5, marginBottom: 5 }}>Loading...</Text>
                )
            }
            <WebView style={{ width: screenWidth, height: screenHeight, backgroundColor: 'white' }}
                source={{ uri: _url }}
                onLoadEnd={syntheticEvent => {
                    settxt_title("")
                    //this.setState({ txt_title: _txt_view_title })
                }}
                onLoadStart={syntheticEvent => {
                    if (!isLoaded) {
                        settxt_title("Loading...")
                        setisLoaded(true)
                    }

                }}>
            </WebView>

        </SafeAreaView >
    )
}

export default commonWebview

commonWebview['navigationOptions'] = screenProps => ({
    header: null
})


