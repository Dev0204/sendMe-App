import { StyleSheet, Platform } from 'react-native';
import Theme from '../theme/theme'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default styContainer = StyleSheet.create({

  windowContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  btnDefaultStyle: {
    width: '95%',
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center'
  },
  btnDefaultTitle: {
    fontFamily: Theme.fontFamily.medium,
    fontSize: Theme.fontSize.semiMedium,
    textAlign: 'center',
    color: 'white'
  },
  navigationCustomHeader: {
    width: '100%', height: RFValue(110), backgroundColor: 'white', marginBottom: Platform.OS == "android" ? 0 : 3
  },
  navigationCustomHeaderp: {
    justifyContent: 'center', flex: 1
  },
  navigationCustomHeaderq: {
    justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center'
  },
  navLeftIcon: {
    height: 35,
    width: 35,
    marginLeft: 25
  },
  btnTabStyle: {
    paddingLeft: RFValue(35), paddingRight: RFValue(35), paddingTop: RFValue(10),
    paddingBottom: RFValue(10),
    fontFamily: Theme.fontFamily.regular,
    letterSpacing: 0.5, fontSize: Theme.fontSize.regular
  },
  btnUserSelectionTabStyle: {
    paddingLeft: 40, paddingRight: 40,
    paddingTop: RFValue(10), paddingBottom: RFValue(10),
    width: RFValue(150), height: RFValue(100),
  },
  missionaryGoalStepView: {
    height: 35, width: 35, borderRadius: 17.5,
    backgroundColor: Theme.colors.sendMeBlue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  missionaryGoalStepTextView: {
    fontFamily: Theme.fontFamily.bold,
    letterSpacing: 0.5, fontSize: Theme.fontSize.semiSmall
  },
  sideMenuIcon: {
    height: RFValue(18),
    width: RFValue(35),
  },
  sideMenuContainerLeft: {
    height: RFValue(50),
    width: RFValue(50), marginLeft: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  sideMenuContainerRight: {
    height: RFValue(50),
    width: RFValue(50), marginRight: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  sideMenuItem: {
    alignItems: 'center', width: '100%', height: RFValue(55),
    flexDirection: 'row'
  },
  sideMenuItemSelected: {
    alignItems: 'center', width: '100%', height: RFValue(55),
    flexDirection: 'row', backgroundColor: Theme.colors.sendMeBlue
  },
  sideMenuItemText: {
    marginLeft: 8,
    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
    fontSize: Theme.fontSize.semiSmall1, color: Theme.colors.sendMeBlack

  },
  sideMenuItemTextSelected: {
    marginLeft: 8,
    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
    fontSize: Theme.fontSize.semiSmall1,
    color: 'white'
  },
  sideMenuItemIcon: {
    marginLeft: RFValue(15), height: RFValue(18), width: RFValue(18),
    tintColor: '#787878'
  },
  sideMenuItemIconSelected: {
    marginLeft: RFValue(15),
    tintColor: 'white', height: RFValue(18), width: RFValue(18)
  },
  goalText: {
    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
    fontSize: Theme.fontSize.semiSmall1,
    color: Theme.colors.sendMeGray
  },
  transByText: {
    color: Theme.colors.sendMeGray,
    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
    fontSize: Theme.fontSize.semiSmall,
  },
  pageTitleText: {
    textAlign: 'left', width: '90%', marginTop: 15,
    fontFamily: Theme.fontFamily.bold,
    fontSize: Theme.fontSize.semiRegular,
    letterSpacing: 0.4,
    color: Theme.colors.sendMeBlack
  },
  btnViewMore: {
    padding: 10, paddingBottom: 5, paddingTop: 5,
    color: 'white', fontFamily: Theme.fontFamily.bold,
    fontSize: Theme.fontSize.semiSmall,
    letterSpacing: 0.4,
  },
  stepTitle: {
    fontFamily: Theme.fontFamily.medium, fontSize: Theme.fontSize.semiRegular,
    textAlign: 'center', marginTop: 5, marginBottom: 5,
    letterSpacing: 0.4,
  },
  dashboardTabTitle: {
    fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.small,
    letterSpacing: 0.4, padding: 3, paddingTop: 7, paddingBottom: 7,
  },
  amountDonate: {
    fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.semiRegular,
    letterSpacing: 0.6, padding: 3
  },
  profileName: {
    fontSize: Theme.fontSize.small, fontFamily: Theme.fontFamily.regular,
    color: Theme.colors.sendMeBlack, letterSpacing: 0.4, textAlign: 'center'
  },
  donationAmountParentView: {
    borderColor: '#E7E7E7', borderWidth: 1, backgroundColor: '#F4F6F6',
    paddingTop: 10, paddingBottom: 10, paddingLeft: 25, paddingRight: 25
  },
  donationAmount: {
    fontSize: Theme.fontSize.semiSmall1, fontFamily: Theme.fontFamily.regular,
    letterSpacing: 0.4
  },
  profilePicturePickerText: {
    fontFamily: Theme.fontFamily.regular,
    fontSize: Theme.fontSize.regular,
    color: Theme.colors.sendMeBlue
  },
  profilePicturePickerButton: {
    borderBottomWidth: 0.3,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', height: 40
  },
  feedLoadingText: {
    fontFamily: Theme.fontFamily.regular, letterSpacing: 0.4,
    fontSize: Theme.fontSize.small,
    marginTop: 20
  },
  pageSubTitle: {
    marginTop: 5, width: '100%', fontFamily: Theme.fontFamily.regular,
    fontSize: Theme.fontSize.semiSmall, color: Theme.colors.sendMeGray
  }
});