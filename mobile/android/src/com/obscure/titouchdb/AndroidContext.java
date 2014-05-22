package com.obscure.titouchdb;

import java.io.File;

import android.app.Activity;

import com.couchbase.lite.Context;
import com.couchbase.lite.NetworkReachabilityManager;

public class AndroidContext implements Context {

    public static final String         LCAT               = "AndroidContext";

    private Activity                   activity;

    private NetworkReachabilityManager networkReachabilityManager = new NetworkReachabilityManager() {
        
        @Override
        public void startListening() {
        }
        
        @Override
        public void stopListening() {
        }
    };

    public AndroidContext(Activity activity) {
        assert activity != null;
        this.activity = activity;
    }

    @Override
    public File getFilesDir() {
        return activity.getFilesDir();
    }

    @Override
    public NetworkReachabilityManager getNetworkReachabilityManager() {
        return networkReachabilityManager;
    }

    @Override
    public void setNetworkReachabilityManager(NetworkReachabilityManager networkReachabilityManager) {
        this.networkReachabilityManager = networkReachabilityManager;
    }

}
