import MyAdapter from './MyAdapter.js';
import Config from '../config';
import api from '../api/api.js';
import {authData,err_info} from '../config'
import * as Service from '../request/request.js'
import React, { Component} from 'react';
import * as umengPush from '../umeng/umengPush'
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ToastAndroid,
    Button,
} from 'react-native';
const screenWidth= MyAdapter.screenWidth;
// 该页面使用navigate参数为classId
export default class BulletinAdd extends Component {
    constructor(props){
        super(props);
        this.state={
            schoolClassId: this.props.navigation.state.params.schoolClassId,
            bulletinText: '',
        };
    }

    sendBulletinCast(classId,content){
        let className = this.props.navigation.state.params.className;
        let params = {
            ticker:"班级公告更新《"+ className +"》",
            title:"班级公告更新《"+ className +"》",
            text:content,
        }
        castId = classId;
        let filter = {
            "where":
            {
                "and":
                [
                    {"tag":castId}
                ]
            }
        }
        umengPush.sendGroupcast(params,filter);
    }
    /* 单击发布后的响应函数 */
    _onPress = ()=> {
        if (this.state.bulletinText === '')
        {
            ToastAndroid.show('公告内容不可为空',ToastAndroid.SHORT);
            return ;
        }
        let postBody = {
            schoolClassId: this.state.schoolClassId,
            content: this.state.bulletinText,
        }
        let body = JSON.stringify(postBody);
        let url = Config.BulletinPublish;
        Service.UserAction(url, body, 'POST').then((response)=>{
            if(response.status!==200)
            {
                return null;
            }
            else{
                return response.json();
            }
        }).then((jsonData)=>{
            if(jsonData===null)
            {
                ToastAndroid.show('请求失败！您可能不是该班级的教师或助教，无此权限！',ToastAndroid.SHORT);
            }
            else if(jsonData.isSuccess)
            {
                ToastAndroid.show('添加公告成功！',ToastAndroid.SHORT);
                this.sendBulletinCast(postBody.schoolClassId,postBody.content);
                /* 调用回调函数更新公告列表 */
                this.props.navigation.state.params.callback();
                this.props.navigation.goBack();
            }
            else if(jsonData.isWarning)
            {
                ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
            }
            else
            {
                ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
            }
        }).catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET ,ToastAndroid.SHORT);
            this.props.navigation.state.params.callback();
            this.props.navigation.goBack();
        });
    };

    render() {
        return (
            <View style = {styles.container}>
                <View style={styles.detailView}>
                    <Text style={styles.promptText}>公告内容</Text>
                    <TextInput style={styles.bulletinDetail} multiline={true}
                        onChangeText= {(text)=>
                            this.setState({bulletinText: text})
                            }
                        defaultValue={this.state.bulletinText}>
                    </TextInput>
                </View>
                <View  style= {{
                      width:0.35*screenWidth,
                      alignSelf: 'center', }}
                >
                    <Button style={styles.commitBtn}
                        title='添加公告'
                        onPress={ this._onPress}>
                    </Button>
                </View>
            </View>
        );
  }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex:1,
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
    },
    detailView:{
        flex: 8,
    },
    commitBtn: {
        flex: 1,
    },
    promptText: {
        fontSize: 16,
        color: 'gray',
    },
    bulletinDetail: {
        flex: 1,
        borderColor: 'gray',
        textAlignVertical: 'top',
        borderRadius: 10,
    },
});
