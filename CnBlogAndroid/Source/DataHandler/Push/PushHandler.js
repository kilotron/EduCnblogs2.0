// import * as storage from '../../Storage/storage'
import Config from '../../config'
import * as Service from '../../request/request'
import {requireTime} from '../../request/requireTime.js';
// import { AppRegistry } from 'react-native';
import api from '../../api/api';
import * as UmengPush from '../../umeng/umengPush'
// export class Push{
//     constructor(){
//         this.classes = [];//班级列表
//         this.imgs = [];//班级头像
//         this.homeworkMap ={};
//     }

//     //初始化推送环境，遍历班级和班级下的所有作业
//     async initPush(){
//         // AppRegistry.registerRunnable('PushTask', TaskRun);
//         // AppRegistry.runApplication('PushTask', {});
//         await this.getHomeworkMap();
//         console.log(this.homeworkMap);
//     }

//     //通过遍历班级列表再遍历所有班级的作业列表得到homeworkMap
//     //homeworkMap为json字典，key为班级id,value为json格式的内容
//         //value格式为{count=int,data=[]}
//     async getHomeworkMap(){
//         this.getClassList();
//         // this.getHomeWorkList();
//     }
//     //获取班级列表
//     getClassList(){
//         console.log('getting classList');
//         Service.Get(Config.ClassList).then((jsonData)=>{
//             if(jsonData == 'rejected' || jsonIsEmpty(jsonData)){
//                 //班级列表为空或请求失败则返回
//                 return false;
//             }
//             else{
//                 this.classes = jsonData;
//                 //获取班级头像
//                 let classIndexes = [];
//                 for(var i in this.classes)
//                 {
//                     classIndexes.push(i);
//                 }
//                 return classIndexes.map((classIndex)=>{
//                     return Service.Get(Config.ClassInfo + this.classes[classIndex].schoolClassId)
//                 });
//             }
//         })
//         .then((promises)=>{
//             if(typeof(promises) == 'boolean') return;
//             Promise.all(promises).then((posts)=>{
//                 for(var i in posts)
//                 {
//                     this.imgs = this.imgs.concat(posts[i].icon)
//                 }
//             })
//         })
//         .then(this.getHomeWorkList())
//         .catch((err)=>{
//             console.log(err);
//         });
//     }

//     //获取作业列表
//     getHomeWorkList(){
//         console.log('getting homeworklist');
//         if(this.classes.length != 0){//非空
//             for(var c in this.classes)
//             {
//                 var schoolClassId = c.schoolClassId;
//                 var homeworkCount = 0;
//                 let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+schoolClassId+"/1-12";
//                 // 先获取作业数量，
//                 Service.Get(url).then((jsonData)=>{
//                     if(jsonData!=='rejected')
//                     {
//                         homeworkCount = jsonData.totalCount;
//                     }
//                 }).then(()=>{
//                     //再按作业数量获取作业信息列表
//                     if(homeworkCount != 0){
//                         let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+schoolClassId+"/"+1+"-"+homeworkCount;
//                         Service.Get(url).then((jsonData)=>{
//                             this.homeworkMap[schoolClassId] = {count:homeworkCount,data:jsonData.homeworks};
//                         })
//                     }
//                 })
//                 .catch((err)=>{
//                     console.log(err);
//                 });
                
//             }
//         }
//     }
// }

export async function initPush(){
    await UmengPush.deleteAllTags();
    var homeworkMap = await getHomeWorkList();
    for(var cls in homeworkMap){
        var {classId, memberId, membership, homeworks} = homeworkMap[cls];
        UmengPush.addClassTag(classId);
        for(var i = 0; i < homeworks.length ; i++){
                //是学生的才会提醒，老师、助教暂不提醒作业
            if(membership != 2 && membership != 3){
                
                var {homeworkId, title, deadline, isClosed, isFinished} = homeworks[i];
                let submitUrl = Config.SubmitJudge + memberId + '/' + homeworkId;

                var isSubmitted = await Service.Get(submitUrl).then((bool)=>{
                    return bool;
                }).catch(()=>{return null;});
                if(isSubmitted == null) {continue};

                //已提交、已关闭、已完成的作业需要删除tag
                if(isSubmitted || isClosed || isFinished){
                    UmengPush.deleteHomeworkTag(classId,homeworkId);
                    continue;
                }

                //未提交的作业需要增加tag
                UmengPush.addHomeworkTag(classId,homeworkId);
                var currentTime = await requireTime();
                //如果在截止日期前三天内，推送提醒
                let today = currentTime == -1 ? new Date() : new Date(currentTime); 
                deadline = StringToDate(deadline);
                let remainTime = deadline.getTime() - today.getTime();
                if(remainTime > 0 && remainTime < 3*24*3600*1000){
                    let days = Math.floor(remainTime/(24*3600*1000));
                    let letfTime=remainTime%(24*3600*1000);
                    let hours= Math.floor(letfTime/(3600*1000));
                    letfTime = letfTime%(3600*1000) 
                    let minutes = Math.floor(letfTime/(60*1000));
                    letfTime = letfTime%(60*1000)  
                    let seconds = Math.round(letfTime/1000);
                    var text = '距离作业截止还剩下{days}天{hours}小时{minutes}分，请及时关注！'.format({days:days,hours:hours,minutes:minutes});
                    UmengPush.sendUnicast({
                        ticker:"作业截止提醒",
                        title:"作业《" + title +"》截止提醒",
                        text:text,
                        after_open:"go_custom",
                        custom:{
                            screen:'HomeworkDetail',
                            classId:classId,
                            homeworkId:homeworkId,
                            membership:membership,
                            isFinished:isFinished,
                        }
                    })
                }
            }
        }
    }
}

//对所有班级获取作业列表
export async function getHomeWorkList(){
    try{
        var classes = await getClassList();
        var homeworkMap = {};
        if(classes == null || classes.length == 0) return {}; 
        for(var c = 0 ; c < classes.length; c++ ){
            var schoolClassId = classes[c].schoolClassId;
            var homeworkCount = 0;
            
            let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+schoolClassId+"/1-2";
            homeworkCount = await Service.Get(url).then((jsonData)=>{
                if(jsonData == 'rejected') return -1;
                else{
                    return jsonData.totalCount;
                }
            });
            //当前班级的作业请求失败或没有作业则继续下一个
            if(homeworkCount <= 0) continue;
            url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+schoolClassId+"/"+1+"-"+homeworkCount;
            //得到当前班级所有的作业
            var homeworks = await Service.Get(url).then((jsonData)=>{
                if(jsonData == 'rejected') return {};
                else return jsonData.homeworks;
            });
            if(jsonIsEmpty(homeworks)) continue;
            //获取用户所在班级的权限
            let userUrl = Config.apiDomain + api.user.info;
            var memberUrl = await Service.Get(userUrl).then((jsonData)=>{
                if(jsonData == 'rejected') return null;
                let memberUrl= Config.apiDomain+"api/edu/member/"+jsonData.BlogId+"/"+schoolClassId;
                return memberUrl;
            });
            if(memberUrl == null) continue;
            //	身份（1.学生、2.老师、3.助教）
            var memberInfo = await Service.Get(memberUrl).then((jsonData)=>{
                if(jsonData == 'rejected') return {};
                return jsonData;
            });
            if(jsonIsEmpty(memberInfo)) continue;

            homeworkMap[schoolClassId] = {
                classId:schoolClassId,
                count:homeworkCount,
                memberId:memberInfo.memberId,
                membership:memberInfo.membership,
                homeworks:homeworks
            }
        }
        return homeworkMap;
    }catch(err){
        console.log(err);
    }
}
//获取班级列表
export async function getClassList(){
    try{
        var classes = await Service.Get(Config.ClassList).then((jsonData)=>{
            if(jsonData == 'rejected' || jsonIsEmpty(jsonData)){
                //班级列表为空或请求失败则返回
                return {};
            }
            else{
                return(jsonData);
            }
        });
        if(jsonIsEmpty(classes)) return null;
        let classIndexes = [];
        for(var i in classes){
            classIndexes.push(i);
        }
        var promises = classIndexes.map((classIndex)=>{
            return Service.Get(Config.ClassInfo + classes[classIndex].schoolClassId);
        })
        var posts = await Promise.all(promises);

        var index = 0;
        for(var i in posts)
        {
            classes[classIndexes[index++]].icon = posts[i].icon;
        }
        return classes;
    }catch(err){
        console.log(err);
    }  
}

function jsonIsEmpty(jsonData){
    for(var x in jsonData){
        return false;
    }
    return true;
}

function StringToDate(day){
    // YYYY-MM-DDTHH:MM:SS
    if(day == null)
        return new Date();
    let s1 = day.split('T')[0];
    let s2 = day.split('T')[1];
    let YMD = s1.split('-');
    let HMS = s2.split(':');
    return new Date(Number(YMD[0]),Number(YMD[1])-1,Number(YMD[2]),Number(HMS[0]),Number(HMS[1]),Number(HMS[2].substring(0,2)));
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}