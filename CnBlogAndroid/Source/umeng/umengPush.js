import {umengConfig} from '../config'
import PushUtil from './PushUtil'

import md5, { hex_md5 } from "react-native-md5";
/*关于url的常量
format: pushUrl + pushType + ?sign=mysign
*/
const urlHead = 'http://msg.umeng.com/api/'
const requireType = {
    send:'send',
    getStatus:'status',
    cancel:'cancel',
    uploadFile:'upload',
}
/*
该函数用于:计算签名并得到最后的请求url
关于签名：
    为了确保用户发送的请求不被更改，我们设计了签名算法。该算法基本可以保证请求是合法者发送且参数没有被修改，但无法保证不被偷窥。 签名生成规则：

    - 提取请求方法method（POST，全大写）；
    - 提取请求url信息，包括Host字段的域名(或ip:端口)和URI的path部分。注意不包括path的querystring。比如http://msg.umeng.com/api/send 或者 http://msg.umeng.com/api/status;
    - 提取请求的post-body；
    - 拼接请求方法、url、post-body及应用的app_master_secret；
    - 将D形成字符串计算MD5值，形成一个32位的十六进制（字母小写）字符串，即为本次请求sign（签名）的值；sign=MD5($http_method$url$post-body$app_master_secret);

*/
//输入：请求的类型(消息发送,状态查询,消息取消,文件上传),请求体(json格式传入)
function getUrl(type, postBody){
    let appMasterSecret=umengConfig.appMasterSecret;
    const method = 'POST';
    let url = urlHead + type;
    //md5加密
    let rawString = method + url + JSON.stringify(postBody) + appMasterSecret;
    let sign = hex_md5(rawString);

    return (url + '?sign=' + sign);
}

//获取deviceToken，可能仅当pushAgent注册后才能成功获取
function getDeviceToken(){
    PushUtil.getDeviceToken((deviceToken)=>{
        console.log(deviceToken);
        return deviceToken;
    });
}




export function testPush(){
    console.log(getUrl(requireType.send,"假body"));
}