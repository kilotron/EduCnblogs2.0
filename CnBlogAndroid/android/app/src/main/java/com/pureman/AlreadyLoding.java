package com.cnblogandroid;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by user on 2017/5/2.
 */

public class AlreadyLoding extends ReactContextBaseJavaModule{
    Context context;
    private static final String TAG = "AlreadyLoding";
    public AlreadyLoding(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "alreadyloding";
    }
    /**
     * 当RN端加载完毕发送广播通知原声端
     *
     */
    @ReactMethod
    public void haveLoding() {
        Log.e(TAG,"广播发送成功");
        Intent intent = new Intent();
        intent.setAction("com.alreadyLoding");      //设置Action
        intent.putExtra("msg", "接收动态注册广播成功！");      //添加附加信息
        context.sendBroadcast(intent);
    }
}