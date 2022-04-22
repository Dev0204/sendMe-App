import AsyncStorage from '@react-native-community/async-storage';
import AppConstants from '../module/constantVairable'

export const getDataFromCachedWithKey = (key) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key)
      .then(res => {
        if (res !== null) {
          resolve(JSON.parse(res));
        }
        else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  })
}

export const saveDataToCachedWithKey = (key, data) => {
  AsyncStorage.setItem(key, JSON.stringify(data));
}


export const removeDataFromCachedWithKey = (key) => {
  AsyncStorage.removeItem(key)
}

export const removeAllDataFromCache = () => {
  let allKeys = Object.keys(AppConstants.AsyncKeyLiterals)

  let arrExcludeValues = [
    AppConstants.AsyncKeyLiterals.strIsNappNotesSeenFirstTimeAfterApproved,
    AppConstants.AsyncKeyLiterals.strConfigData,
    AppConstants.AsyncKeyLiterals.kPushToken,
    AppConstants.AsyncKeyLiterals.strInviteContact]

  for (var i = 0; i < allKeys.length; i++) {
    if (!arrExcludeValues.includes(allKeys[i])) {
      AsyncStorage.removeItem(allKeys[i])
    }
  }
}
