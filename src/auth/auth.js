import { AsyncStorage } from "react-native";
import {kUserPayload} from '../constantVairable'

export const onSignOut = () => AsyncStorage.removeItem(kUserPayload);

export const isSignedIn = () => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(kUserPayload)
        .then(res => {
          if (res !== null) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(err => reject(err));
    });
  };

  export const getObjUser = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem(kUserPayload)
        .then(res => {
            if (res !== null)
            {
                //console.log(JSON.parse(res));
                resolve(JSON.parse(res));
            }
            else
            {
                console.log("FAIL TO GET USER OBJECT");
                resolve(false);
            }
        })
        .catch(err => reject(err));
    })
  }
