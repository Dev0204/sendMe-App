/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
//https://i.diawi.com/MfXwKH
//appcenter codepush release-react -a parth-foundersapproach.com/SendMe-iOS -d Staging
//appcenter codepush release-react -a parth-foundersapproach.com/SendMe-Android -d Staging
import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  Alert,
  Platform
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { createRootSwitchNavigator } from './src/navigation/navrouter'

import CalendarStrip from 'react-native-slideable-calendar-strip'

import AppConstants from './src/module/constantVairable'
import { syncUserWithServer, saveCurrentUserData, CALL_API, getCurrentUserData, Reload_API_Alert, saveConfigurationData, saveCurrentUserToken, getIsLoaderVisible } from './src/api/api';
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey, removeAllDataFromCache } from './src/module/cacheData'

import DeviceInfo from 'react-native-device-info';
import faker from 'faker';
import moment from 'moment';

import SplashScreen from 'react-native-splash-screen'
import CodePush from "react-native-code-push";

import BabyLoader from './src/components/babyLoader'

import { type, Moment } from 'moment';

import * as Animatable from 'react-native-animatable';

import * as Sentry from '@sentry/react-native';

import PushNotification from 'react-native-push-notification';

import PushNotificationIOS from "@react-native-community/push-notification-ios";

import { EventRegister } from 'react-native-event-listeners'
import { MenuProvider } from 'react-native-popup-menu';
import branch, { BranchEvent } from 'react-native-branch'
import analytics from '@react-native-firebase/analytics';

// Sentry.init({
//   dsn: 'https://ec6907c7a93c4c9e963cca656257ef4e@o359406.ingest.sentry.io/5244382',
// });


export type EventType = {
  date: Moment,
  title: string,
  description: string,
  image: string,
};

//const filterEvents = (date: Moment): ?Array<EventType> =>
//FAKE_EVENTS.filter(event => event.date.isSame(date, 'day'));

// Generate fake event data
/*const FAKE_EVENTS: Array<EventType> = (() => {
  const startDay = moment().subtract(5, 'days').startOf('day');
  return [...new Array(64)].map(_ => ({
    date: startDay.add(4, 'hours').clone(),
    title: faker.company.companyName(),
    description: faker.lorem.sentence(),
    // use random dimensions to get random urls
    image: faker.image.nightlife(Math.floor(Math.random() * 200) + 100, Math.floor(Math.random() * 200) + 100),
  }));
})();*/

let _this = null
class App extends Component<Props> {
  constructor(props) {
    super(props);
    _this = this
    this.state = {
      selectedDate: Date,
      // events: filterEvents(moment()),
      isHideBabyLoader: false,
      navigateTo: ""
    }
  }

  componentDidMount() {
    //console.log(DeviceInfo.getBundleId())
    console.disableYellowBox = true
    // removeAllDataFromCache()
    // setTimeout(function () {
    //   SplashScreen.hide();
    // }, 500)

    let objFirebaseEvent = {
      eventTitle: "App_Open",
      eventObject: {}
    }
    this.logFirebaseEvent(objFirebaseEvent)

    EventRegister.addEventListener('logFirebaseEventListener', (data) => {
      _this.logFirebaseEvent(data)
    })
    EventRegister.addEventListener('firebaseSetUserPropertiesListener', (data) => {
      _this.firebaseSetUserProperties()
    })

    removeDataFromCachedWithKey("payout_reminder")
    if (Platform.OS == "ios") {
      PushNotificationIOS.setApplicationIconBadgeNumber(0)
    }
    this.resetAppBadgeListener = EventRegister.addEventListener('resetAppBadgeListener', (data) => {
      if (Platform.OS == "ios") {
        PushNotificationIOS.setApplicationIconBadgeNumber(0)
      }
    })

    this.getConfigurationData()

    // let lastParams = await branch.getLatestReferringParams() // params from last open
    // let installParams = await branch.getFirstReferringParams() // params from original install

  }

  askPushNotification() {

    PushNotification.configure({

      largeIcon: "ic_launcher",
      smallIcon: "ic_stat_name",

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
        saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.kPushToken, token.token)
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        //Alert.alert("notification received")
        getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData).then((res) => {
          if (res) {
            let nData = {}
            if (Platform.OS == "android") {
              if (notification.foreground) {
                nData.type = notification.type
                nData.title = notification.notification.title
                nData.body = notification.notification.body
                nData.notificationID = notification.id
                _this.notificationShowForegroundMessage(nData)
              }
              else {
                _this.performNavigation(notification.type)
              }
            }
            else if (Platform.OS == "ios") {
              _this.performNavigation(notification.data.aps.alert.custom_data.type)
            }
            if (Platform.OS == "ios") {
              notification.finish("backgroundFetchResultNoData");
            }
          }
        })
      },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "867090062479",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true
    });
  }


  firebaseSetUserProperties() {
    getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData).then((res) => {
      if (res) {

        analytics().setUserId(res.user_id)
        analytics().setUserProperties({
          user_name: res.display_name,
          email: res.email,
          user_type: res.user_type
        })
      }
    })
  }

  logFirebaseEvent(data) {
    var strTitle = data.eventTitle.split(' ').join('_')
    strTitle = strTitle.split('-').join('_')
    strTitle = strTitle.split('&').join('_')
    analytics().logEvent(strTitle, data.eventObject)
    console.log("----logFirebaseEvent---")
    console.log(data)
  }

  notificationShowForegroundMessage(nData) {
    let body = ""
    let title = ""
    if (nData.title) {
      title = nData.title
    }

    if (nData.body) {
      body = nData.body
    }

    if (title != "" && body != "") {
      Alert.alert(title, body, [
        { text: "Cancel", style: "cancel" },
        { text: "View", onPress: () => { _this.performNavigation(nData.type) } },
      ], { cancelable: true })

    }

  }

  performNavigation(type) {
    console.log("performNavigation_ " + type + " ==>" + Platform.OS)
    if (type == "new_post") {
      EventRegister.emit("drawerNotificationNavigationListener", {
        eventType: "new_post"
      })
    }
    else if (type == "missionary_selected") {
      EventRegister.emit("drawerNotificationNavigationListener", {
        eventType: "missionary_selected"
      })
    }
    else if (type == "dontation_received") {
      EventRegister.emit("drawerNotificationNavigationListener", {
        eventType: "dontation_received"
      })
    }
    else if (type == "missionary_raising_paused") {
      EventRegister.emit("drawerNotificationNavigationListener", {
        eventType: "missionary_raising_paused"
      })
    }
  }


  getConfigurationData() {
    CALL_API(AppConstants.StringLiterals.strServerConfigurationURL).then((res) => {
      if (res.errMsg == null) {
        saveConfigurationData(res)
        saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strConfigData, res)
        console.log(res)
        _this.checkUserProfileState()
        setTimeout(() => {
          _this.askPushNotification()
        }, 1000);
      }
      else {
        Reload_API_Alert(res.errMsg).then((res) => {
          if (res) {
            _this.getConfigurationData()
          }
        })
      }
    })
  }

  checkUserProfileState() {
    getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData).then((res) => {
      if (res) {
        saveCurrentUserData(res)
        console.log("---user_data----")
        console.log(res)
        console.log("-------")

        syncUserWithServer().then(async (res) => {
          if (res) {
            let currentUser = getCurrentUserData()
            if (currentUser.user_type == "") {
              this.setState({
                navigateTo: "userTypeSelectionView"
              })
            }
            else {
              if (currentUser.user_type == "missionary") {

                if (currentUser.is_intro_screen_viewed == 0) {
                  this.setState({
                    navigateTo: "missionaryAccountSetupInfoView"
                  })
                }
                else if (!currentUser.missionary_goal) {
                  this.setState({
                    navigateTo: "missionaryGoalView1"
                  })
                }
                else if (currentUser.stripe_connect_id == "") {
                  this.setState({
                    navigateTo: "missionaryGoalView1"
                  })
                }
                else if (currentUser.is_one_time_fee_taken == 0) {
                  this.setState({
                    navigateTo: "oneTimeFeeView"
                  })
                }
                else {
                  this.setState({
                    navigateTo: "missionaryHomeView"
                  })
                }
              }
              else if (currentUser.user_type == "sponsor") {
                if (currentUser.is_intro_screen_viewed == 0) {
                  this.setState({
                    navigateTo: "sponsorAccountSetupInfoView"
                  })
                }
                else if (!currentUser.missionary) {
                  this.setState({
                    navigateTo: "missionarySelectionListView1"
                  })
                }
                else if (currentUser.stripe_customer_id == "") {
                  this.setState({
                    navigateTo: "sponsarGetBankAndCardInfoView1"
                  })
                }
                else {
                  this.setState({
                    navigateTo: "sponsarHomeView"
                  })
                }
              }
              else {
                removeAllDataFromCache()
                this.setState({
                  navigateTo: "landingScreen"
                })
              }
            }
          }
          else {
            removeAllDataFromCache()
            this.setState({
              navigateTo: "landingScreen"
            })
          }
        })
        this.setState({
          navigateTo: ""
        })
      }
      else {
        removeAllDataFromCache()
        this.setState({
          navigateTo: "landingScreen"
        })
      }

      setTimeout(function () {
        SplashScreen.hide();
      }, 2000)

    })

    setTimeout(() => {
      _this.subscribeBranchLink()
    }, 4 * 1000);

  }

  subscribeBranchLink() {

    branch.subscribe(({ error, params, uri }) => {
      if (error) {
        // console.error('Error from Branch: ' + error)
        return
      }
      console.log("Branch Param")
      console.log(params)

      if (params["+clicked_branch_link"]) {
        missionaryId = params["missionary_id"]
        getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData).then((res) => {
          if (res) {

            if (res.user_type == "sponsor") {
              EventRegister.emit("navigateToViewMissionaryListener", {
                branch_missionary_id: missionaryId
              })
            }
          }
          else {
            EventRegister.emit("navigateToViewMissionaryListenerLandingStack", {
              branch_missionary_id: missionaryId
            })
          }
        })
        // saveDataToCachedWithKey("branch_missionary_id", missionaryId)
        // EventRegister.emit("branchLinkClickedListener", {
        //   missionaryId: missionaryId
        // })
      }
      // params will never be null if error is null
    })


  }

  render() {
    if (this.state.navigateTo == "") {
      return (
        <View style={{ flex: 1 }}>
        </View>
      )
    }
    const Layout = createRootSwitchNavigator(this.state.navigateTo)
    return (

      <View style={{ flex: 1 }}>
        <MenuProvider>
          <Layout />
        </MenuProvider>
      </View>
    )
  }

}

var codePushDeploymentKey = ""
if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_Android) {
  codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_DEV_Android //Staging
}
else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_iOS) {
  codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_DEV_iOS //Staging
}
else if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_Android) {
  codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_LIVE_Android //LIVE
}
else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_iOS) {
  codePushDeploymentKey = AppConstants.StringLiterals.strCodePushKey_LIVE_iOS //LIVE
}

let codePushOptions = { deploymentKey: codePushDeploymentKey, checkFrequency: CodePush.CheckFrequency.ON_APP_START, installMode: CodePush.InstallMode.IMMEDIATE };
console.log(codePushOptions)
App = CodePush(codePushOptions)(App);
export default App;

/**
 * it means we should give a basic stack navigation list to actions , and point out your current index.

Now I am in View B, previousView is A, I want to go C which has goback button that can goBack to A.

   //  view B:
   const resetAction = NavigationActions.reset({
        index: 1,  // it means change state to C which can goBack to previousView A
        actions: [
          NavigationActions.navigate({ routeName: 'A'}),
          NavigationActions.navigate({ routeName: 'C', params: {id: "***"}}),
        ]
   })
   this.props.navigation.dispatch(resetAction);
after that, view B will be disappear, and view C can goBack to view A.
@leejms @buncismamen @yash2code
 */