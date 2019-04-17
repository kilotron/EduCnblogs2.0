import { NativeModules } from 'react-native';

const UMTJ = NativeModules.UMAnalyticsModule;
export const umengEventId = {
    logInEvent: '0',
};
export const onPageStart = pageName => {
  //用于统计单个自定义页面的起始和onPageEnd同时使用，不可单独使用
  return UMTJ.onPageStart(pageName);
};
export const onPageEnd = pageName => {
  //用于统计单个Activity页面结束时间
  return UMTJ.onPageEnd(pageName);
};
export const onEvent = eventId => {
  //用于统计自定义事件的发生次数
  console.log('次数统计+1:' + eventId);
  return UMTJ.onEvent(eventId);
};
export const onEventWithLable = ({eventId, label}) => {
  //用于统计自定义事件的发生次数 可传参数进去

  return UMTJ.onEventWithLable(eventId, label);
};
/*
接口说明，详见https://developer.umeng.com/docs/66632/detail/67587
手动页面统计接口
AnalyticsUtil.onPageStart(pageName);

pageName 页面名称
AnalyticsUtil.onPageEnd(pageName);

pageName 页面名称
自定义事件
AnalyticsUtil.onEvent(eventId);

AnalyticsUtil.onEventWithLable(eventId,eventLabel);

AnalyticsUtil.onEventWithMap(eventId,eventData);

AnalyticsUtil.onEventWithMapAndCount(eventId,eventData,eventNum);

AnalyticsUtil.onEventObject(eventId,eventData);

eventId 为当前统计的事件ID
eventLabel 为分类标签
eventData 为当前事件的属性和取值（键值对），不能为空，如：{name:”umeng”,sex:”man”}
eventNum 用户每次触发的数值的分布情况，如事件持续时间、每次付款金额等
账号的统计
AnalyticsUtil.profileSignInWithPUID(puid);

puid 用户账号ID.长度小于64字节
AnalyticsUtil.profileSignInWithPUIDWithProvider(provider,puid);

provider： 账号来源。 puid： 用户账号ID。长度小于64字节.
AnalyticsUtil.profileSignOff()；

账号登出时需调用此接口，调用之后不再发送账号相关内容
预置事件属性接口
AnalyticsUtil.registerPreProperties(property);

注册预置事件属性。property 事件的超级属性（可以包含多对“属性名-属性值”）,如：{name:”umeng”,sex:”man”}
AnalyticsUtil.unregisterPreProperty(propertyName);

注销预置事件属性。propertyName，要注销的预置事件属性名。
AnalyticsUtil.getPreProperties(context);

获取预置事件属性, 返回包含所有预置事件属性的JSONObject。
AnalyticsUtil.clearPreProperties();

清空全部预置事件属性。
设置关注事件是否首次触发
AnalyticsUtil.setFirstLaunchEvent(eventList);

eventList 只关注eventList前五个合法eventID.只要已经保存五个,此接口无效,如：[“list1”,”list2”,”list3”]

*/