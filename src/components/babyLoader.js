import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Modal, Image,
    ActivityIndicator, Animated, Easing
} from 'react-native';
import Theme from '../theme/theme'
const BabyLoader = props => {
    const {
        loading,
        ...attributes
    } = props;
    var animatedValue1 = new Animated.Value(0)

    var scaleImg = animatedValue1.interpolate({
        inputRange: [0, 1.2],
        outputRange: [0.8, 1.5]
    })

    const createAnimation = function (value, duration, easing, delay = 0) {
        return Animated.timing(
            value,
            {
                toValue: 1,
                duration,
                easing,
                delay
            }
        )
    }

    Animated.loop(
        Animated.sequence([
            createAnimation(animatedValue1, 1500, Easing.linear()),
            Animated.timing(animatedValue1, {
                toValue: 0,
                duration: 1700
            })
        ]),
        {
            iterations: -1
        }
    ).start()

    return (
        <Modal useNativeDriver={true}
            transparent={true}
            animationType={'none'}
            visible={loading}
            onRequestClose={() => { console.log('close modal') }}>
            <View style={styles.modalBackground}>
                <Animated.Image resizeMode="contain"
                    style={{
                        tintColor: Theme.colors.nappBlue, transform: [
                            { scale: scaleImg }]
                    }}
                    source={Theme.icons.ic_baby_face}></Animated.Image>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff'
    }
});

export default BabyLoader;