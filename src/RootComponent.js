/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useEffect, useFocusEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    BackHandler,
    Dimensions, ToastAndroid
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './navigator/stack/StackNavigation';
import { useDispatch } from 'react-redux';
import { Constant } from './common/Constant'
import { navigationRef } from './navigator/stack/StackNavigation';
import RNExitApp from "react-native-exit-app";
import I18n from './common/language/i18n'
import signalRManager from './common/SignalR';

let time = 0;

export default () => {

    const [forceUpdate, setForceUpdate] = useState(false);
    const [deviceType, setDeviceType] = useState("");
    const [orientaition, setOrientaition] = useState("");
    const dispatch = useDispatch();

    const isPortrait = () => {
        const dim = Dimensions.get("screen");
        return dim.height >= dim.width ? Constant.PORTRAIT : Constant.LANDSCAPE;
    }

    const msp = (dim, limit) => {
        return (dim.scale * dim.width) >= limit || (dim.scale * dim.height) >= limit;
    }

    const isTablet = () => {
        const dim = Dimensions.get("screen");
        return ((dim.scale < 2 && msp(dim, 1000) || (dim.scale >= 2 && msp(dim, 1900)))) ? Constant.TABLET : Constant.PHONE;
    }

    useEffect(() => {
        // signalRManager.init()
        I18n.locale = "vi";
        setForceUpdate(!forceUpdate);
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })
    }, [])


    const clickBack = () => {
        if (time + 1000 > new Date().getTime()) {
            RNExitApp.exitApp();
        } else {
            time = new Date().getTime();
            let thongbao = "Nhấn back 2 lần nữa để thoát";
            ToastAndroid.show(thongbao, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
    }

    // const backButtonHandler = useCallback(() => {
    //     console.log(navigationRef.current, 'back buttom');
    //     if (navigationRef.current.getRootState().index == 1) {
    //         clickBack()
    //         return true
    //     }
    // }, [])



    // useEffect(() => {
    //     BackHandler.addEventListener("hardwareBackPress", backButtonHandler);

    //     return () => {
    //         BackHandler.removeEventListener("hardwareBackPress", backButtonHandler);
    //     };
    // }, [backButtonHandler]);

    const handleChange = () => {
        setDeviceType(isTablet)
        setOrientaition(isPortrait)
        console.log("isTablet ", isTablet());
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })
    }

    useEffect(() => {
        Dimensions.addEventListener('change', handleChange)
        return () => {
            Dimensions.removeEventListener('change', handleChange)
        }
    })

    return (

        <NavigationContainer ref={navigationRef}>
            <StackNavigation />
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({

});

