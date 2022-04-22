import Rect from 'react'
import { Text, Platform } from 'react-native'

import { fromRight, fromBottom } from 'react-navigation-transitions';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator, createDrawerNavigator } from 'react-navigation';

import AppLandingView from '../views/appLandingView'
import SignInView from '../views/signin/signInView'
import UserTypeSelection from '../views/signin/userTypeSelectionView'
import MissionaryGoalView from '../views/missionary/missionaryGoalView'

import MissionaryFeedView from '../views/missionary/missionaryFeedView'
import MissionaryDashboardView from '../views/missionary/missionaryDashboardView'
import MissionaryProfileView from '../views/missionary/missionaryProfileView'
import CommonWebView from '../views/commonViews/commonWebview'
import AboutUsView from '../views/commonViews/aboutUsView'
import SettingsView from '../views/commonViews/settingsView'
import MissionarySelectionListView from '../views/sponsar/missionarySelectionListView'
import MissionaryGoalProfileView from '../views/sponsar/missionaryGoalProfleView'
import SponsarGetBankAndCardInfoView from '../views/sponsar/sponsarGetBankAndCardInfoView'

import SponsarDashboardView from '../views/sponsar/sponsarDashboardView'
import SponsarMyMissionaryView from '../views/sponsar/sponsarMyMissionaryView'
import SponsorProfileView from '../views/sponsar/sponsorProfileView'
import OneTimeDonationView from '../views/sponsar/oneTimeDonationView'
import MissionarySponsorView from '../views/missionary/missionarySponsorsView'

import DrawerContentView from '../views/drawer_content/drawerContentView'
import UpdateProfileView from '../views/signin/updateProfileView'

import OneTimeFeeView from '../views/missionary/oneTimeFeeView'

import ResetPasswordView from '../views/signin/resetPasswordView'
import ShareView from '../views/sharing/shareView'
import AdminHomeView from '../views/adminViews/adminHomeView'
import AdminAllMissionaryListView from '../views/adminViews/adminAllMissionaryListView'
import AdminMissionaryProfileView from '../views/adminViews/adminMissionaryProfileView'
import MissionaryAccountSetupInfoView from '../views/missionary/missionaryAccountSetupInfoView';
import SponsorAccountSetupInfoView from '../views/sponsar/sponsorAccountSetupInfoView';
import CouponListView from '../views/adminViews/couponListView';

export const landingScreenStack = createStackNavigator({
  AppLandingView: {
    screen: AppLandingView,
  },
  signInView: {
    screen: SignInView
  },
  userTypeSelection: {
    screen: UserTypeSelection
  },
  missionaryGoalView: {
    screen: MissionaryGoalView
  },
  commonWebView1: {
    screen: CommonWebView
  },
  resetPasswordView: {
    screen: ResetPasswordView
  },
  missionaryGoalProfileView2: {
    screen: MissionaryGoalProfileView
  },

}, {
  transitionConfig: () => Platform.OS === "android" ? fromRight() : 'default',
})

export const SponserHomeNavStack = createStackNavigator({
  sponsarDashboardView: {
    screen: SponsarDashboardView
  },
  sponsarMyMissionaryView: {
    screen: SponsarMyMissionaryView
  },
  sponsorProfileView: {
    screen: SponsorProfileView
  },
  oneTimeDonationView: {
    screen: OneTimeDonationView
  },
  missionarySelectionListView2: {
    screen: MissionarySelectionListView
  },
  missionaryGoalProfileView1: {
    screen: MissionaryGoalProfileView
  },
  settingsView: {
    screen: SettingsView
  },
  commonWebView: {
    screen: CommonWebView
  },
  aboutUsView: {
    screen: AboutUsView
  },
  updateProfileView: {
    screen: UpdateProfileView
  },
  adminHomeView: {
    screen: AdminHomeView
  },
  adminAllMissionaryListView: {
    screen: AdminAllMissionaryListView
  },
  adminMissionaryProfileView: {
    screen: AdminMissionaryProfileView
  },
  couponListView: {
    screen: CouponListView
  }
})

export const MissionaryHomeNavStack = createStackNavigator({
  missionaryDashboardView: {
    screen: MissionaryDashboardView
  },
  missionaryFeedView: {
    screen: MissionaryFeedView
  },
  missionaryProfileView: {
    screen: MissionaryProfileView
  },
  commonWebView: {
    screen: CommonWebView
  },
  aboutUsView: {
    screen: AboutUsView
  },
  settingsView: {
    screen: SettingsView
  },
  missionarySelectionListView: {
    screen: MissionarySelectionListView
  },
  missionaryGoalProfileView: {
    screen: MissionaryGoalProfileView
  },
  sponsarGetBankAndCardInfoView: {
    screen: SponsarGetBankAndCardInfoView
  },
  missionarySponsorView: {
    screen: MissionarySponsorView
  },
  updateProfileView: {
    screen: UpdateProfileView
  },
  shareView: {
    screen: ShareView
  },
  adminHomeView: {
    screen: AdminHomeView
  },
  adminAllMissionaryListView: {
    screen: AdminAllMissionaryListView
  },
  adminMissionaryProfileView: {
    screen: AdminMissionaryProfileView
  },
  couponListView: {
    screen: CouponListView
  }
}, {
  transitionConfig: () => Platform.OS === "android" ? fromRight() : 'default',
})

export const MissionarySelectionNavStack = createStackNavigator({
  missionarySelectionListView: {
    screen: MissionarySelectionListView
  },
  missionaryGoalProfileView: {
    screen: MissionaryGoalProfileView
  },
})

const MissionaryHomeViewDrawer = createDrawerNavigator({
  Home: MissionaryHomeNavStack,
}, {
  contentComponent: DrawerContentView,
  edgeWidth: 3
  // drawerLockMode:'locked-closed'  
})

const SponsarHomeViewDrawer = createDrawerNavigator({
  Home: SponserHomeNavStack,
}, {
  contentComponent: DrawerContentView,
  // drawerLockMode:'locked-closed'  
})

export const SponsarGetBankAndCardInfoView2 = createStackNavigator({
  SponsarGetBankAndCardInfoView: {
    screen: SponsarGetBankAndCardInfoView
  },
  commonWebView: {
    screen: CommonWebView
  },
})

//Main: { screen:({navigation}) => <MyStack screenProps={drawerNavigation:navigation}/> }

export const createRootSwitchNavigator = (strInitialRouteName = "landingScreen") => {
  return createSwitchNavigator(
    {
      landingScreen: {
        screen: landingScreenStack
      },
      missionaryHomeView: {
        screen: MissionaryHomeViewDrawer
      },
      sponsarHomeView: {
        screen: SponsarHomeViewDrawer
      },
      userTypeSelectionView: {
        screen: UserTypeSelection
      },
      missionaryGoalView1: {
        screen: MissionaryGoalView
      },
      missionarySelectionListView1: {
        screen: MissionarySelectionNavStack
      },
      sponsarGetBankAndCardInfoView1: {
        screen: SponsarGetBankAndCardInfoView2
      },
      missionaryAccountSetupInfoView: {
        screen: MissionaryAccountSetupInfoView
      },
      sponsorAccountSetupInfoView: {
        screen: SponsorAccountSetupInfoView
      },
      oneTimeFeeView: {
        screen: OneTimeFeeView
      }
    },
    {
      initialRouteName: strInitialRouteName,
    }
  )
}