import React, { Component } from 'react';
import { SafeAreaView, SectionList, ScrollView, View, UIManager, Dimensions, FlatList, Platform, Keyboard, Alert, AsyncStorage, TextInput, Text, Button, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';

import {NativeModules} from 'react-native';
var DistanceCalculation = NativeModules.DistanceCalculation;

import moment from "moment";

function Item({ title }) {
    return (
        <View style={styles.item}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

let nappPostdata = require('../Resources/nappData.json');
class SectionListDemo extends Component {
    static navigationOptions = {
        header: null,

    }

    constructor(props) {
        super(props);
        this.state = {
            resData: []
        }
    }

    componentDidMount() {
        //console.log(nappPostdata)
        let finalObj = {}
        let arrData = []
        nappPostdata.forEach((gig) => {
            //console.log(gig)
            //const dt = gig.time_start.split('T')[0]

            var localDate = new Date(gig.time_start);
            const date = moment(localDate).format("YYYY-MM-DDTHH:mm:ss").split('T')[0]
            if (finalObj[date]) {
                finalObj[date].push(gig);
            } else {
                finalObj[date] = [gig];
            }
        })

        let allKeys = Object.keys(finalObj)
        let arr = []
        allKeys.forEach((key) => {

            let obj = {
                'title': key,
                'data': finalObj[key]
            };
            arr.push(obj)
        })
        
        this.setState({ resData: arr })

    }

    renderHeader = ({ section }) => {
        return (
            <Text style={styles.header}>{section.title}</Text>
        )
    }

    itemClicked(item)
    {
        
    }

    renderItem = ({ item }) => {
        
        DistanceCalculation.calculateDistance(39.354858,-76.635792,39.416076,-76.615444,(err) => {
            console.log(err)
        },(msg)=>{
            console.log(msg)
        })
        var localStartDate = new Date(item.time_start);
        const dateStart = moment(localStartDate).format("h:mm a")

        var localEndDate = new Date(item.time_end);
        const dateEnd = moment(localEndDate).format("h:mm a")

        return (
            <View style={styles.item}>
                <TouchableOpacity
                onPress={()=>this.itemClicked(item)}
                >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ paddingRight: 10 }}>
                        {/* <Image style={{ height: 50, width: 50 }}
                            resizeMode='contain' source={require('../Resources/imageAssets/img_dummy.jpg')}></Image> */}
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                        <Text>{item.posted_by.full_name ? item.posted_by.full_name : ''}</Text>
                        <Text>{dateStart} - {dateEnd}</Text>
                        <Text>{item.posted_by.city}, {item.posted_by.state} ({item.posted_by.zip})</Text>
                    </View>
                </View>
                </TouchableOpacity>
            </View>
        )
    }

    onViewableItemsChanged = ({ viewableItems, changed }) => {
        //console.log("Visible items are", viewableItems);
        //console.log("Changed in this iteration", changed);
    }

    render() {

        return (
            <SafeAreaView style={{ flex: 1 }}>
                <SectionList
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 50
                    }}
                    sections={this.state.resData}
                    keyExtractor={(item, index) => item + index}
                    renderItem={this.renderItem}
                    stickySectionHeadersEnabled={true}
                    renderSectionHeader={this.renderHeader}
                />
            </SafeAreaView>
        )
    }

}
export default SectionListDemo
const styles = StyleSheet.create({

    item: {
        backgroundColor: '#f9c2ff',
        padding: 10,
        marginVertical: 8,
    },
    header: {
        fontSize: 32,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 24,
    },
});