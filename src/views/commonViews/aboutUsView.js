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

import Icon from 'react-native-vector-icons/dist/FontAwesome';
import WebView from 'react-native-webview';
import theme from '../../theme/theme';
import * as Progress from 'react-native-progress';

var _this = null
let isViewingFAQOnly = false

const aboutUsView = (props) => {

    isViewingFAQOnly = props.viewingFAQOnly ? props.viewingFAQOnly : false
    const [missionDetails, setmissionDetails] = useState("")
    const [goalToRise, setgoalToRise] = useState("")
    const [qus1_expanded, setqus1_expanded] = useState(false)
    const [qus2_expanded, setqus2_expanded] = useState(false)
    const [qus3_expanded, setqus3_expanded] = useState(false)
    const [arrFaqs, setarrFaqs] = useState([])

    useEffect(() => {
        let arr = []
        let faq1 = {
            title: "What is SendMe.Gives?",
            details: "SendMe.Gives is a mobile platform that allows you to give spare change from daily purchase to a Missionary of your choice.",
            isExpanded: false
        }
        arr.push(faq1)

        let faq2 = {
            title: "How do Round-Ups Work?",
            details: "Round-Ups allow you to round up spare change from your daily purchases. For Example, if you buy a coffee for $3.25, we will automatically round up $0.75 for your Missionary.",
            isExpanded: false
        }
        arr.push(faq2)

        let faq3 = {
            title: "Can I pause Round-Up Payments?",
            details: "Yes. The Sponsor and Missionary and pause Round-Ups anytime from the app.",
            isExpanded: false
        }
        arr.push(faq3)

        let faq4 = {
            title: "Can I make One-Time Gifts?",
            details: "Yes, One-Time gifts can easily be made within the app.",
            isExpanded: false
        }
        arr.push(faq4)

        let faq5 = {
            title: "Are Spare-Change Apps Secure?",
            details: "Yes! Security is essential to everything we do. SendMe.Gives uses the same secure technology as major financial apps and services like Acorns, Venmo, Robinhood, Betterment, Coinbase and Stripe.",
            isExpanded: false
        }
        arr.push(faq5)

        let faq6 = {
            title: "When are Round-Ups given to the Missionary?",
            details: "Your Round-Ups are given to the missionary every other Friday.",
            isExpanded: false
        }
        arr.push(faq6)

        let faq7 = {
            title: "Why are gifts not tax deductible?",
            details: "Simply put, more Missionaries will be able to take advantage of the Round-Up giving.  However, we are considering a tax-deductible option for the future.",
            isExpanded: false
        }
        arr.push(faq7)

        setarrFaqs(arr)
    }, [])


    function btnSideMenuClicked() {
        props.navigation.toggleDrawer()
    }

    // const _updateMasterState = (attrName, value) => {
    //     // this.setState({ [attrName]: value });
    // }

    function btnGetReadyClicked() {
        setselectedTab(1)
    }

    function navigateToBankView() {
        props.navigation.navigate("commonWebView", {
            txt_title: "Bank Details",
            url: "https://www.stripe.com"
        })
    }

    function btnQuestionClicked(item) {
        if (item.isExpanded) {
            item.isExpanded = false
        }
        else {
            item.isExpanded = true
        }
        setqus1_expanded(!qus1_expanded)

    }



    function renderFaqItem({ item, index }) {
        return (
            <CardView cardElevation={2} style={{ width: '100%', alignItems: 'center', }}>

                <View style={{ backgroundColor: 'white', width: '90%', marginTop: 5, marginBottom: 5 }}>
                    <TouchableOpacity
                        onPress={() => btnQuestionClicked(item)}
                        activeOpacity={0.7} style={{ marginTop: 0 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styContainer.pageTitleText, {
                                marginTop: 0,
                                fontSize: Theme.fontSize.semiSmall, flex: 1, padding: 15,

                                color: item.isExpanded ? Theme.colors.sendMeBlue : 'black'
                            }]}>{item.title}</Text>
                            <Image resizeMode="contain" style={{
                                height: RFValue(17),
                                width: RFValue(17), marginRight: isViewingFAQOnly ? 10 : 0
                            }} source={Theme.icons.ic_drop_down}></Image>
                        </View>
                    </TouchableOpacity>
                    {
                        item.isExpanded ? (
                            <Text style={
                                [styContainer.pageSubTitle, { padding: 15, paddingTop: 0, marginTop: -5 }]
                            }>
                                {item.details}
                            </Text>
                        ) : (
                            <View style={{
                                width: '100%'
                            }}></View>
                        )
                    }
                </View>
            </CardView>
        )
    }
    return (
        <SafeAreaView style={styContainer.windowContainer}>
            <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                {
                    isViewingFAQOnly ? (
                        <View></View>
                    ) : (
                        <CardView cardElevation={1} style={styContainer.navigationCustomHeader}>
                            <View style={styContainer.navigationCustomHeaderp}>
                                <View style={styContainer.navigationCustomHeaderq}>
                                    <TouchableOpacity activeOpacity={0.7}
                                        style={styContainer.sideMenuContainerLeft}
                                        onPress={() => btnSideMenuClicked()}
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
                    )
                }

                <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%', marginTop: 10 }}>
                    {
                        isViewingFAQOnly ? (
                            <View></View>
                        ) : (
                            <View>
                                <Text style={styContainer.pageTitleText}>About Us</Text>
                                <View style={{ width: '90%', marginTop: 10 }}>
                                    <Text style={styContainer.goalText}>SendMe is the easiest way to support your favorite missionaries. Support through one-time payments or round up the change from every transaction to send in support each week.</Text>
                                </View>
                            </View>
                        )
                    }
                    {
                        isViewingFAQOnly ? (
                            <View></View>
                        ) : (
                            <Text style={styContainer.pageTitleText}>FAQ's</Text>
                        )

                    }



                    <FlatList keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ paddingTop: isViewingFAQOnly ? 0 : 20, paddingBottom: isViewingFAQOnly ? 0 : 70 }} style={{ width: '100%', flex: 1, marginTop: 5 }}
                        data={arrFaqs}
                        renderItem={renderFaqItem}
                        keyExtractor={(item, index) => index}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />


                </ScrollView>

            </View >
        </SafeAreaView >
    )
}

export default aboutUsView

aboutUsView['navigationOptions'] = screenProps => ({
    header: null
})

