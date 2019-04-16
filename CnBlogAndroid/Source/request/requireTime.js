import {Get} from './request'
//api随时可能更改，因此函数有失效的可能
const taoBaoApi = 'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp';
async function getTaoBaoTime(){
    return new Promise((resolve)=>{
		Get(taoBaoApi).then(
            (jsonData) => {
                if(jsonData.ret[0] == "SUCCESS::接口调用成功"){
                    resolve(jsonData.data.t);
                }
                else{
                    resolve('');
                }
            }
        ).catch(
            ()=>{
                resolve('');
            }
        )
	})
}
/*
苏宁时间api，返回的是时间戳
{
  "api": "mtop.common.getTimestamp",
  "v": "*",
  "ret": [
    "SUCCESS::接口调用成功"
  ],
  "data": {
    "t": "1555331091136"
  }
}
*/
const suNingApi = 'http://quan.suning.com/getSysTime.do';
async function getSuNingTime(){
    return new Promise((resolve)=>{
		Get(suNingApi).then(
            (jsonData) => {
                resolve(jsonData.sysTime1);
            }
        ).catch(
            ()=>{
                resolve('');
            }
        )
	})
}
/*
苏宁时间api
{
  "sysTime2": "2019-04-15 20:17:25",
  "sysTime1": "20190415201725"
}
*/ 
export async function requireTime(){
    var time = '';
    time = await getTaoBaoTime();
    if(time == ''){
        time = await getSuNingTime();
    }
    // alert(time);
    return time == '' ? -1 : Number(time) ;
}