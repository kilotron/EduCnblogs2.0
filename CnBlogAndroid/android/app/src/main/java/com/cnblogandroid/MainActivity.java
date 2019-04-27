package com.cnblogandroid;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.umeng.PushModule;
import com.umeng.analytics.MobclickAgent;
import com.umeng.message.PushAgent;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CnBlogAndroid";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        PushModule.initPushSDK(this);
        PushAgent.getInstance(this).onAppStart();
        MobclickAgent.setSessionContinueMillis(1000*40);
    }

    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }
}
