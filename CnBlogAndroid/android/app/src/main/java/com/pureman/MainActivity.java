package com.pureman;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.umeng.PushModule;
import com.umeng.analytics.MobclickAgent;
import com.umeng.message.PushAgent;

public class MainActivity extends ReactActivity {
    private static Activity mCurrentActivity;
    ReactContext reactcontext;
//    String title = "Login";
    String jumpTo;
    private static final String TAG = "MainActivity";
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CnBlogAndroid";
    }

    public static Activity getCurrentActivity() {
        return mCurrentActivity;
    }

    private void setCurrentActivity(Activity activity) {
        mCurrentActivity = activity;
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        PushModule.initPushSDK(this);
        MobclickAgent.setSessionContinueMillis(1000*40);
        PushAgent.getInstance(this).onAppStart();
//
//        IntentFilter dynamic_filter = new IntentFilter();
//        dynamic_filter.addAction("com.cnblogandroid");            //添加动态广播的Action
//        registerReceiver(myReceiver, dynamic_filter);             // 注册自定义动态广播消息
//        Intent intent = getIntent();                               //接受广播传入的信息
//        if(intent!=null){
//            jumpTo=intent.getStringExtra("extraMap");
//        }

    }

    @Override
    public void onResume() {
        super.onResume();
        setCurrentActivity(this);
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }

//    public static void sendEvent(ReactContext reactContext, String eventName, String params) {
//        System.out.println("reactContext=" + reactContext);
//        Log.e("aaaa", "我执行了");
//        reactContext
//                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                .emit(eventName, params);
//    }
//    /**
//     *
//     * 广播
//     * 如果收到已经加载完成的信息并且收到了推送信息就跳转
//     */
//    private BroadcastReceiver myReceiver = new BroadcastReceiver() {
//
//        @Override
//        public void onReceive(Context context, Intent intent) {
//            if (intent.getAction().equals("com.alreadyLoding")) {    //动作检测
//                String msg = intent.getStringExtra("msg");
//                ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();
//                if(jumpTo!=null){
//                    sendEvent(reactContext, "push", jumpTo);
//                }
//
//            }
//
//        }
//    };

}
