import React, { useMemo } from 'react';
import { StyleSheet, View, Modal, Alert, ActivityIndicator } from 'react-native';
import AppConstants from '../module/constantVairable'

import { getIsLoaderVisible, setIsLoaderVisible, hideAPILoader } from '../api/api'
import Theme from '../theme/theme'

const loader = (props) => {

  useMemo(() => {
    setTimeout(() => {
      if (props.refParentView) {
        if (props.refParentView.state) {
          if (props.refParentView.state.isLoading) {
            hideAPILoader(props.refParentView)
            setTimeout(() => {
              //Alert.alert(AppConstants.StringLiterals.strServerServiceError + ".")
            }, 50);
          }
        }
      }
    }, 1000 * 30);
    changeLoadingState()
  }, []);



  function changeLoadingState() {
    const stateTimer = setTimeout(() => {
      if (props.loading) {
        setIsLoaderVisible(true)
      }
      else {
        setIsLoaderVisible(false)
      }
      clearTimeout(stateTimer)
      changeLoadingState()
    }, 2000);
  }

  return (
    <Modal useNativeDriver={true}
      transparent={true}
      animationType={'none'}
      visible={props.loading}
      onRequestClose={() => { console.log('close modal') }}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            color={Theme.colors.nappBlue}
            animating={props.loading} />
        </View>
      </View>
    </Modal>
  )
}

export default loader

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
})