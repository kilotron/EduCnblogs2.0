package com.cnblogandroid;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.github.alinz.reactnativewebviewbridge.WebViewBridgePackage;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.umeng.DplusReactPackage;
import com.umeng.RNUMConfigure;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.message.IUmengRegisterCallback;
import com.umeng.message.PushAgent;

import java.util.Arrays;
import java.util.List;

import static com.umeng.message.UmengDownloadResourceService.TAG;


public class MainApplication extends Application implements ReactApplication {
  final String umengAppKey = "5cb692ac570df31b8d000cd7";
  final String umengMessageSecret = "b2def4184d6c3bad76c1b5d7235e3398";
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new WebViewBridgePackage(),
            new CookieManagerPackage(),
            new DplusReactPackage()
      );
    }


    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    UMConfigure.setLogEnabled(true);
    // 在此处调用基础组件包提供的初始化函数 相应信息可在应用管理 -> 应用信息 中找到 http://message.umeng.com/list/apps
    // 参数一：当前上下文context；
    // 参数二：应用申请的Appkey（需替换）；
    // 参数三：渠道名称；
    // 参数四：设备类型，必须参数，传参数为UMConfigure.DEVICE_TYPE_PHONE则表示手机；传参数为UMConfigure.DEVICE_TYPE_BOX则表示盒子；默认为手机；
    // 参数五：Push推送业务的secret 填充Umeng Message Secret对应信息（需替换）
    RNUMConfigure.init(this, umengAppKey, "ALL", UMConfigure.DEVICE_TYPE_PHONE, umengMessageSecret);
    PushAgent mPushAgent = PushAgent.getInstance(this);
    mPushAgent.register(new IUmengRegisterCallback() {
      @Override
      public void onSuccess(String deviceToken) {
        //注册成功会返回deviceToken deviceToken是推送消息的唯一标志
        Log.i(TAG,"注册成功：deviceToken：-------->  " + deviceToken);
      }
      @Override
      public void onFailure(String s, String s1) {
        Log.e(TAG,"注册失败：-------->  " + "s:" + s + ",s1:" + s1);
      }
    });
  }
}
