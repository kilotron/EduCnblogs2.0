package com.cnblogandroid;

import android.app.Application;
import android.app.Notification;
import android.content.Context;
import android.util.Log;
import android.os.Handler;
import android.widget.RemoteViews;
import android.widget.Toast;

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
import com.umeng.message.UTrack;
import com.umeng.message.MsgConstant;
import com.umeng.message.UmengMessageHandler;
import com.umeng.message.UmengNotificationClickHandler;
import com.umeng.message.entity.UMessage;

import java.util.Arrays;
import java.util.List;


import static com.umeng.message.UmengDownloadResourceService.TAG;


public class MainApplication extends Application implements ReactApplication {
    private static final String umengAppKey = "5cb692ac570df31b8d000cd7";
  private static final String umengMessageSecret = "b2def4184d6c3bad76c1b5d7235e3398";
  private static final String TAG = MainApplication.class.getName();
  private Handler handler;
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
    // PushAgent mPushAgent = PushAgent.getInstance(this);
    // mPushAgent.register(new IUmengRegisterCallback() {
    //   @Override
    //   public void onSuccess(String deviceToken) {
    //     //注册成功会返回deviceToken deviceToken是推送消息的唯一标志
    //     Log.i(TAG,"注册成功：deviceToken：-------->  " + deviceToken);
    //   }
    //   @Override
    //   public void onFailure(String s, String s1) {
    //     Log.e(TAG,"注册失败：-------->  " + "s:" + s + ",s1:" + s1);
    //   }
    // });
    initUpush();
  }

  private void initUpush() {
    PushAgent mPushAgent = PushAgent.getInstance(this);
    handler = new Handler(getMainLooper());

    //sdk开启通知声音
    mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SDK_ENABLE);
    // sdk关闭通知声音
    //		mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);
    // 通知声音由服务端控制
    //		mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SERVER);

    //		mPushAgent.setNotificationPlayLights(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);
    //		mPushAgent.setNotificationPlayVibrate(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);


    UmengMessageHandler messageHandler = new UmengMessageHandler() {
        /**
         * 自定义消息的回调方法
         */
        @Override
        public void dealWithCustomMessage(final Context context, final UMessage msg) {

            handler.post(new Runnable() {

                @Override
                public void run() {
                    // TODO Auto-generated method stub
                    // 对自定义消息的处理方式，点击或者忽略
                    boolean isClickOrDismissed = true;
                    if (isClickOrDismissed) {
                        //自定义消息的点击统计
                        UTrack.getInstance(getApplicationContext()).trackMsgClick(msg);
                    } else {
                        //自定义消息的忽略统计
                        UTrack.getInstance(getApplicationContext()).trackMsgDismissed(msg);
                    }
                    Toast.makeText(context, msg.custom, Toast.LENGTH_LONG).show();
                }
            });
        }

        /**
         * 自定义通知栏样式的回调方法
         */
//        @Override
//        public Notification getNotification(Context context, UMessage msg) {
//            switch (msg.builder_id) {
//                case 1:
//                    Notification.Builder builder = new Notification.Builder(context);
//                    RemoteViews myNotificationView = new RemoteViews(context.getPackageName(), R.layout.notification_view);
//                    myNotificationView.setTextViewText(R.id.notification_title, msg.title);
//                    myNotificationView.setTextViewText(R.id.notification_text, msg.text);
//                    myNotificationView.setImageViewBitmap(R.id.notification_large_icon, getLargeIcon(context, msg));
//                    myNotificationView.setImageViewResource(R.id.notification_small_icon, getSmallIconId(context, msg));
//                    builder.setContent(myNotificationView)
//                        .setSmallIcon(getSmallIconId(context, msg))
//                        .setTicker(msg.ticker)
//                        .setAutoCancel(true);
//
//                    return builder.getNotification();
//                default:
//                    //默认为0，若填写的builder_id并不存在，也使用默认。
//                    return super.getNotification(context, msg);
//            }
//        }
    };
    mPushAgent.setMessageHandler(messageHandler);

    /**
     * 自定义行为的回调处理，参考文档：高级功能-通知的展示及提醒-自定义通知打开动作
     * UmengNotificationClickHandler是在BroadcastReceiver中被调用，故
     * 如果需启动Activity，需添加Intent.FLAG_ACTIVITY_NEW_TASK
     * */
    UmengNotificationClickHandler notificationClickHandler = new UmengNotificationClickHandler() {
        @Override
        public void dealWithCustomAction(Context context, UMessage msg) {
            Toast.makeText(context, msg.custom, Toast.LENGTH_LONG).show();
        }
    };
    //使用自定义的NotificationHandler，来结合友盟统计处理消息通知，参考http://bbs.umeng.com/thread-11112-1-1.html
    //CustomNotificationHandler notificationClickHandler = new CustomNotificationHandler();
    mPushAgent.setNotificationClickHandler(notificationClickHandler);


    //注册推送服务 每次调用register都会回调该接口
    mPushAgent.register(new IUmengRegisterCallback() {
        @Override
        public void onSuccess(String deviceToken) {
            Log.i(TAG, "推送注册成功，device token: " + deviceToken);
        }

        @Override
        public void onFailure(String s, String s1) {
            Log.i(TAG, "register failed: " + s + " " + s1);
        }
    });
} 
}
