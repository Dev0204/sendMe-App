import { Platform, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AppConstants from '../module/constantVairable'
import { saveDataToCachedWithKey, getDataFromCachedWithKey, removeDataFromCachedWithKey } from '../module/cacheData'
import moment from "moment";
import { EventRegister } from 'react-native-event-listeners';
var serverConfigData = {}
var currentUserData = {}
var stripePublishKey = ""
var currentUserToken = ""

var isLoaderVisible = false

export const CALL_API = (service_name, param = {}, mtdh = 'POST') => {
    return new Promise((resolve, reject) => {

        var headers = {}
        headers["Content-Type"] = "application/json"
        headers["App-Track-Version"] = "v1"
        headers["App-Device-Type"] = Platform.OS
        headers["App-Store-Version"] = '1.0'
        headers["App-Device-Model"] = DeviceInfo.getBrand()
        headers["App-Os-Version"] = DeviceInfo.getDeviceId()
        headers["App-Secret"] = AppConstants.api_dev_secret_key
        //console.log(serverConfigData)
        let url;
        if (service_name.includes("http")) {
            url = service_name
        }
        else {

            if (currentUserData.auth_token) {
                headers["Auth-Token"] = currentUserData.auth_token
            }


            // if (currentUserToken != "") {
            //     headers["Authorization"] = "Bearer " + currentUserToken
            // }
            // if (DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev || DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_iOS) {
            url = (ISLIVE ? serverConfigData.live_base_url : serverConfigData.dev_base_url) + "/Service.php?Service=" + service_name
            // }
            // else if (DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive || DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_iOS) {
            //     url = serverConfigData.nappApiUrl + "/" + service_name
            // }

        }

        console.log("^^^^^^^^^^^^^^^")
        console.log(param)
        console.log(headers)
        console.log(`URL: ${url}`)
        fetch(url, {
            method: mtdh,
            headers: headers,
            body: JSON.stringify(param),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                resolve(responseJson);
            })
            .catch((error) => {
                console.log(error.toString());
                //Alert.alert(error.toString())
                let errParam = {}
                errParam.errMsg = error.toString()
                console.log(errParam)
                resolve(errParam);

            })
    });
}

export const UPLOAD_PROFILE = (service_name, data) => {
    return new Promise((resolve, reject) => {

        var headers = {}
        headers["Content-Type"] = "multipart/form-data"
        headers["App-Track-Version"] = "v1"
        headers["App-Device-Type"] = Platform.OS
        headers["App-Store-Version"] = '1.0'
        headers["App-Device-Model"] = DeviceInfo.getBrand()
        headers["App-Os-Version"] = DeviceInfo.getDeviceId()
        headers["App-Secret"] = AppConstants.api_dev_secret_key

        if (currentUserData.auth_token) {
            headers["Auth-Token"] = currentUserData.auth_token
        }

        let options = {}

        options.headers = headers
        options.method = 'POST'

        let url = (ISLIVE ? serverConfigData.live_base_url : serverConfigData.dev_base_url) + "/Service.php?Service=" + service_name

        options.body = new FormData();
        for (let key in data) {
            options.body.append(key, data[key]);
        }
        setTimeout(() => {
            console.log(`URL: ${url}`)
            console.log(options.body)
            fetch(url, options)
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson)
                    resolve(responseJson);
                })
                .catch((error) => {
                    console.log(error.toString());
                    //Alert.alert(error.toString())
                    let errParam = {}
                    errParam.errMsg = error.toString()
                    console.log(errParam)
                    resolve(errParam);
                })
        }, 1000 * 1.5);

    })
}

export const registerPushTokenId = () => {
    getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.kPushToken).then((resToken) => {
        if (resToken) {
            let param = {
                device_token: resToken,
                device_id: DeviceInfo.getUniqueId(),
                device_type: Platform.OS,
            }
            CALL_API("registerDeviceToken", param, "post").then((res) => {
                if (res) {
                    console.log(res)
                }
            })
        }
    })
}

export const deRegisterPushTokenId = () => {

    getDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.kPushToken).then((resToken) => {
        if (resToken) {

            let param = {
                device_token: resToken,
                device_id: DeviceInfo.getUniqueId()
            }
            CALL_API("deRegisterDeviceToken", param, "post").then((res) => {
                if (res) {
                    console.log(res)
                }
            })
        }
    })
}

export const checkPayoutStatus = () => {

    return new Promise((resolve, reject) => {
        CALL_API("getStripeAccountByID", null, "post").then((res) => {
            let isPayoutEnabled = false
            if (res) {
                if (res.status == 1) {
                    if (res.data.payouts_enabled) {
                        isPayoutEnabled = true
                    }
                }
            }
            resolve(isPayoutEnabled);
        })
    })
}


export const syncUserWithServer = () => {

    return new Promise((resolve, reject) => {
        //currentUserData.id,
        CALL_API("getTokenUser", null, "post").then((res) => {
            if (res) {
                if (res.status == 1) {

                    saveCurrentUserData(res.data)
                    saveDataToCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData, res.data)
                    registerPushTokenId()

                    if (res.data.user_type == "sponsor") {
                        if (!res.data.missionary) {
                            EventRegister.emit("forceMissionarySelectionListener", '')
                        }
                    }

                    resolve({});
                }
                else {
                    removeDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData)
                    EventRegister.emit('performLogoutListener', '')
                    resolve(false);
                }
            }
            else {
                removeDataFromCachedWithKey(AppConstants.AsyncKeyLiterals.strCurrentUserData)
                EventRegister.emit('performLogoutListener', '')
                resolve(false);
            }
        })
    })
}

export var ISLIVE = () => {
    if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_Android) {
        return false
    }
    else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_iOS) {
        return false
    }
    else if (Platform.OS == "android" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_Android) {
        return true
    }
    else if (Platform.OS == "ios" && DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_iOS) {
        return true
    }

}

export const Reload_API_Alert = (msg) => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            Alert.alert(
                AppConstants.StringLiterals.strServerServiceError,
                null,
                [
                    {
                        text: 'Cancel', onPress: () => {
                            resolve(false);
                        }
                    },
                    {
                        text: 'Reload', onPress: () => {
                            resolve(true);
                        }
                    },

                ],
                { cancelable: true },
            );
        }, 50)
    })
}

export var saveConfigurationData = (data) => {
    serverConfigData = data
    // if (DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev || DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyDev_iOS) {
    stripePublishKey = serverConfigData.stripePublishableKeyDev
    // }
    // else if (DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive || DeviceInfo.getBundleId() == AppConstants.StringLiterals.strBundleKeyLive_iOS) {
    //     stripePublishKey = serverConfigData.stripePublishableKey
    // }
}

export var getConfigurationData = (data) => {
    return serverConfigData
}

export var getStripePublishKey = () => {
    return stripePublishKey
}



export var saveCurrentUserData = (data) => {
    currentUserData = data
}

export var getCurrentUserData = () => {
    if (currentUserData) {
        return currentUserData
    }
    else {
        return {}
    }
}

export var saveCurrentUserToken = (token) => {
    currentUserToken = token
}

export var getCurrentUserToken = () => {
    return currentUserToken
}

export var getIsLoaderVisible = () => {
    return isLoaderVisible
}

export var setIsLoaderVisible = (val) => {
    //console.log("setIsLoaderVisible => " + val)
    isLoaderVisible = val
}
export var currencyFormat = (num) => {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
export var hideAPILoader = (refView) => {
    if (refView) {
        refView.setState({
            isLoading: false
        })
    }
}

