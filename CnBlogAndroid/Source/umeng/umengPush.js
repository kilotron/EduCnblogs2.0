import PushUtil from './PushUtil'

import { md5 } from "../DataHandler/md5";
import {requireTime} from '../request/requireTime';
import * as Service from '../request/request.js';
import * as Push from '../DataHandler/Push/PushHandler';
//umeng相关参数，详见文档
export const umengConfig = {
    urlHead:'http://msg.umeng.com/api/',
	appkey:'5cb692ac570df31b8d000cd7',
	appMasterSecret:'0qvlibhfma68xe5xe9untjujsilwlf14',
	messageType:{
		unicast:'unicast',
		listcast:'listcast',
		filecast:'filecast',
		broadcast:'broadcast',
		groupcast:'groupcast',
		customizedcast:'customizedcast',
	},
	displayType:{
		notification:'notification',
		message:'message',
	},
	requireType:{
		send:'send',
		getStatus:'status',
		cancel:'cancel',
		uploadFile:'upload',
    },
}
/*
params : 关于通知消息内容和样式的参数，json格式,内部属性如下：

ticker:必填，通知栏提示文字
title:必填，通知标题
text:必填，通知文字描述


// 可选部分，用于自定义通知图标:

"icon":"xx",    // 可选，状态栏图标ID，R.drawable.[smallIcon]，
// 如果没有，默认使用应用图标。
// 图片要求为24*24dp的图标，或24*24px放在drawable-mdpi下。
// 注意四周各留1个dp的空白像素
"largeIcon":"xx",    // 可选，通知栏拉开后左侧图标ID，R.drawable.[largeIcon]，
// 图片要求为64*64dp的图标，
// 可设计一张64*64px放在drawable-mdpi下，
// 注意图片四周留空，不至于显示太拥挤
"img": "xx",    // 可选，通知栏大图标的URL链接。该字段的优先级大于largeIcon。
                // 该字段要求以http或者https开头。

// 自定义通知声音:
"sound": "xx",    // 可选，通知声音，R.raw.[sound]。
                // 如果该字段为空，采用SDK默认的声音，即res/raw/下的
                // umeng_push_notification_default_sound声音文件。如果
                // SDK默认声音文件不存在，则使用系统默认Notification提示音。

// 自定义通知样式:
"builder_id": xx,    // 可选，默认为0，用于标识该通知采用的样式。使用该参数时，
                    // 开发者必须在SDK里面实现自定义通知栏样式。

// 通知到达设备后的提醒方式，注意，"true/false"为字符串
"play_vibrate":"true/false",    // 可选，收到通知是否震动，默认为"true"
"play_lights":"true/false",        // 可选，收到通知是否闪灯，默认为"true"
"play_sound":"true/false",        // 可选，收到通知是否发出声音，默认为"true"

// 点击"通知"的后续行为，默认为打开app。
"after_open": "xx",    // 可选，默认为"go_app"，值可以为:
                    //   "go_app": 打开应用
                    //   "go_url": 跳转到URL
                    //   "go_activity": 打开特定的activity
                    //   "go_custom": 用户自定义内容。
"url": "xx",    // 当after_open=go_url时，必填。
                // 通知栏点击后跳转的URL，要求以http或者https开头
"activity":"xx",    // 当after_open=go_activity时，必填。
                    // 通知栏点击后打开的Activity
"custom":"xx"/{}    // 当display_type=message时, 必填
                    // 当display_type=notification且
                    // after_open=go_custom时，必填
                    // 用户自定义内容，可以为字符串或者JSON格式。
*/
export function sendUnicast(params){
    //单播通知，用于对本设备的推送
    unicastBody(params).then((postBody)=>{
        //后续对postBody的扩展放到这里写
        if(postBody != null) sendCast(postBody);
    });
}

/*
目前开放的筛选字段

- “app_version”(应用版本)
- “channel”(渠道)
- “device_model”(设备型号)
- “province”(省)
- “tag”(用户标签)
- “country”(国家和地区) //“country”和”province”的类型定义请参照 附录J
- “language”(语言)
- “launch_from”(一段时间内活跃)
- “not_launch_from”(一段时间内不活跃)

支持逻辑上的and(与), or(或), not(非)操作, 以及这些操作的组合。

*/
export function sendGroupcast(params, filter){
    //组播通知，用于对filter过滤后的设备组推送
    groupcastBody(params, filter).then((postBody)=>{

        if(postBody != null) sendCast(postBody);
    });
}

export function closePush(){
    PushUtil.disablePush((ret)=>{
        console.log(ret);
    });
}

export function openPush(){
    PushUtil.enablePush((ret)=>{
        console.log(ret);
    });
}
// function addTag(tag){
//     //为该设备添加一个tag，变量tag为字符串
//     //若成功则返回0，若失败返回状态码
//     PushUtil.addTag(tag,(code,remain) =>{
//         if(code == 200){
//             return(remain);
//         }else{ 
//             console.log(remain);
//             return(code);
//         }
//     });
// }


// function deleteTag(tag){
//     //为该设备删除一个tag，变量tag为字符串
//     //若成功则返回0，若失败返回状态码
//     PushUtil.deleteTag(tag,(code,remain) =>{
//         if(code == 200){
//             return (remain);
//         }else{ 
//             console.log(remain);
//             return(code);
//         }
//     });
// }


// function listTag(){
//     //展示该设备绑定的所有tag
//     //若成功则返回一个包含所有tag的数组,若失败则返回状态码
//     return await PushUtil.listTag((code,result) =>{
//         if(code == 200){
//             return(result);
//         }
//         else return(code);
//     })
// }

export function addHomeworkTag(classId,homeworkId){
    return PushUtil.addTag(classId + "_" + homeworkId,()=>{});
}

export function deleteHomeworkTag(classId,homeworkId){
    return PushUtil.deleteTag(classId + "_" + homeworkId,()=>{});
}

export function deleteAllTags(){
    PushUtil.listTag((code,result)=>{
        if(code == 200){
            for(var i = 0; i < result.length; i++){
                PushUtil.deleteTag(result[i],()=>{});
            }
        }
    })
}

export async function testPush(){
    //单播测试
    sendUnicast({ticker:"ticker",title:"title" + (new Date()).getTime(),text:"text"}); 
    // sendUnicast({title:"title" + (new Date()).getTime(),text:"text"});

    //组播测试
    // body = {ticker:"ticker",title:"title" + (new Date()).getTime(),text:"[groupcast]text"};
    // filter = {
    //     "where": 
    //     {
    //         "and": 
    //         [
    //             {"tag":"test tag"}
    //         ]
    //     }
    // }
    // sendGroupcast(body,filter);
    
    // Push.getHomeWorkList().then((list)=>{console.log(list);});

    // deleteAllTags();
    // PushUtil.listTag((code,result)=>{
    //     console.log(result);
    // });
    // deleteHomeworkTag(1,2);
    // PushUtil.listTag((code,result)=>{
    //     console.log(result);
    // });
    // Push.initPush();
    // PushUtil.enablePush((ret)=>{
    //     console.log(ret);
    // });
    // PushUtil.disablePush((ret)=>{
    //     console.log(ret);
    // });
}



/*关于url的函数
format: pushUrl + pushType + ?sign=mysign
*/

function getUrl(type, postBody){
    /*
    该函数用于:计算签名并得到最后的请求url，用于给自己
    关于签名：
        为了确保用户发送的请求不被更改，我们设计了签名算法。该算法基本可以保证请求是合法者发送且参数没有被修改，但无法保证不被偷窥。 签名生成规则：

        - 提取请求方法method（POST，全大写）；
        - 提取请求url信息，包括Host字段的域名(或ip:端口)和URI的path部分。注意不包括path的querystring。比如http://msg.umeng.com/api/send 或者 http://msg.umeng.com/api/status;
        - 提取请求的post-body；
        - 拼接请求方法、url、post-body及应用的app_master_secret；
        - 将D形成字符串计算MD5值，形成一个32位的十六进制（字母小写）字符串，即为本次请求sign（签名）的值；sign=MD5($http_method$url$post-body$app_master_secret);

    */
    //输入：请求的类型(消息发送,状态查询,消息取消,文件上传),请求体(json格式传入)
    let appMasterSecret=umengConfig.appMasterSecret;
    const method = 'POST';
    let url = umengConfig.urlHead + type;
    //md5加密
    let rawString = (method + url + JSON.stringify(postBody) + appMasterSecret);
    let sign = md5(rawString);
    
    return (url + '?sign=' + sign);
}



function sendCast(postBody){
    requireTime().then((result)=>{
        let timestamp = (result == -1 ? (new Date()).getTime() : result) +"";
        postBody.timestamp = timestamp;
        let url = getUrl(umengConfig.requireType.send,postBody);
        Service.RawUserAction(url,JSON.stringify(postBody),'POST').then((result)=>{
            result.json().then((jsonData)=>{
                if(jsonData.ret == "SUCCESS"){
                    let id = postBody.type == 'unicast' ? jsonData.data.msg_id : jsonData.data.task_id;
                    console.log(id)
                    return id;
                }
                else{
                    console.log(jsonData.data.error_msg);
                    return jsonData.data.error_code;
                }
            }) 
        }).catch((err)=>{
            console.log(err);
            return -1;
        })
    });
}


function checkBody(params){
    return (params.hasOwnProperty('ticker') && 
            params.hasOwnProperty('title') && 
            params.hasOwnProperty('text'));
}


async function unicastBody(params){
    let displayType = umengConfig.displayType.notification;
    if(!checkBody(params)) {
        console.log('body参数错误');
        return null;
    }
    let payload = {
        "display_type":displayType,
        "body":params,
    }
    let postBody = {
        "appkey":umengConfig.appkey,
        "type":umengConfig.messageType.unicast,
        "production_mode":"false",
        "payload":payload,
        "description":"单播"
    }
    await PushUtil.getDeviceToken((deviceToken)=>{
        postBody.device_tokens = deviceToken;
    });
    return postBody;
}

async function groupcastBody(params, filter){
    let displayType = umengConfig.displayType.notification;
    if(!checkBody(params)) {
        console.log('body参数错误');
        return null;
    }
    if(filter == null || JSON.stringify(filter) == "{}"){
        console.log('filter参数错误');
        return null;
    }
    let payload = {
        "display_type":displayType,
        "body":params,
    }
    let postBody = {
        "appkey":umengConfig.appkey,
        "type":umengConfig.messageType.groupcast,
        "production_mode":"false",
        "payload":payload,
        "description":"组播",
        "filter":filter
    }
    
    return postBody;
}

