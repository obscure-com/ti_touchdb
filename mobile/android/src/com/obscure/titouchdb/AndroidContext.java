package com.obscure.titouchdb;

import java.io.File;

import android.app.Activity;

import com.couchbase.lite.Context;
import com.couchbase.lite.NetworkReachabilityManager;

public class AndroidContext implements Context {

    private Activity                   activity;

    private NetworkReachabilityManager networkReachabilityManager = new NetworkReachabilityManager() {
        
        @Override
        public void stopListening() {
        }
        
        @Override
        public void startListening() {
        }
    };

    public AndroidContext(Activity activity) {
        assert activity != null;
        this.activity = activity;
    }

    @Override
    public File getFilesDir() {
        return new File(activity.getFilesDir().getAbsolutePath());
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
