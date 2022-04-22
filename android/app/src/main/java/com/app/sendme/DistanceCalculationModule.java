package com.app.sendme;

import android.location.Location;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

public class DistanceCalculationModule extends ReactContextBaseJavaModule {

    public DistanceCalculationModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "DistanceCalculation";
    }

    @ReactMethod
    public void calculateDistance(Double latA, Double lngA,Double latB, Double lngB ,Callback errorCallback, Callback successCallback) {
        try {
            Location locationA = new Location("point A");
            Location locationB = new Location("point B");

            locationA.setLatitude(latA);
            locationA.setLongitude(lngA);

            locationB.setLatitude(latB);
            locationB.setLongitude(lngB);




            double earthRadius = 6371000; //meters
            double dLat = Math.toRadians(latB - latA);
            double dLng = Math.toRadians(lngB - lngA);
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(Math.toRadians(latA)) * Math.cos(Math.toRadians(latB)) *
                            Math.sin(dLng / 2) * Math.sin(dLng / 2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            float dist = (float) (earthRadius * c);

            System.out.println("-----------");
            System.out.println(dist);
            System.out.println("-----------");


            float[] result = new float[1];

            Location.distanceBetween(latA,lngA,latB,lngB,result);
            double distance  = (double) result[0];

            System.out.println("============");
            System.out.println(distance );
            System.out.println("============");

            successCallback.invoke(distance);
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }


}
