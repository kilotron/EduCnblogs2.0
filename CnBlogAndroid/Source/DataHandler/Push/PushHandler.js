// import * as storage from '../../Storage/storage'
import Config from '../../config'
import * as Service from '../../request/request'
// import { AppRegistry } from 'react-native';
import api from '../../api/api';

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
            let uesrUrl = Config.apiDomain + api.user.info;
            var memberUrl = await Service.Get(uesrUrl).then((jsonData)=>{
                if(jsonData == 'rejected') return null;
                let memberUrl= Config.apiDomain+"api/edu/member/"+jsonData.BlogId+"/"+schoolClassId;
                return memberUrl;
            });
            if(memberUrl == null) continue;
            var membership = await Service.Get(memberUrl).then((jsonData)=>{
                if(jsonData == 'rejected') return -1;
                return jsonData.membership;
            });
            if(membership == -1) continue;

            homeworkMap.schoolClassId = {
                count:homeworkCount,
                membership:membership,
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