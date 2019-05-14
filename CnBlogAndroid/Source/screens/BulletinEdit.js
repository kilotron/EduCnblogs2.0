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
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {getHeaderStyle} from '../styles/theme-context';

const screenWidth= MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;

/**navigation需要传递参数：
 * createNew: true(发布新公告)、false(编辑已有公告)
 * schoolClassId：
 * bulletinId：提交修改公告所需要的参数，createNew为true需要提供此参数
 * bulletinText：修改公告需要公告原来的内容，createNew为true需要提供此参数
 * className: 班级名
 * callback(text)：修改公告完毕后调用的函数,参数是修改后的公告内容
 */
export default class BulletinEdit extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerStyle: getHeaderStyle(), 
        headerTitle: navigation.state.params.createNew ? '创建新公告' : '编辑公告',
        headerTintColor: global.theme.headerTintColor,
        headerRight: (
            <TouchableOpacity style={{marginRight:18}} onPress={()=>{
                navigation.state.params.commit()
            }}>
                <Text style={{color: global.theme.headerTintColor, fontSize: 18}}>完成</Text>
            </TouchableOpacity>
        ),
    })

    constructor(props){
        super(props);
        this.state = this.props.navigation.state.params.createNew ? {
            schoolClassId: this.props.navigation.state.params.schoolClassId,
            bulletinText: '',
        } : {
            schoolClassId: this.props.navigation.state.params.schoolClassId,
            bulletinText: this.props.navigation.state.params.bulletinText,
            bulletinId: this.props.navigation.state.params.bulletinId,
        };
        this.props.navigation.setParams({commit: this._onPress});
    }

    sendBulletinCast(classId,content){
        let className = this.props.navigation.state.params.className;
        let params = {
            ticker:"班级公告修改《"+ className +"》",
            title:"班级公告修改《"+ className +"》",
            text:content,
            after_open:"go_custom",
            custom:{
                screen:'BulletinEdition',
            } /* 这里可能需要修改，公告编辑页面名字是BulletinEdit,公告显示页面名字是BulletinDisplay
                修改后可删掉这个注释。*/
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

    /* 提交公告函数 */
    _onPress = ()=>{
        let createNew = this.props.navigation.state.params.createNew;
        if (this.state.bulletinText === '')
        {
            ToastAndroid.show('公告内容不可为空',ToastAndroid.SHORT);
            return ;
        }
        let body = JSON.stringify({
            schoolClassId: this.state.schoolClassId,
            content: this.state.bulletinText,
        });
        let url = createNew ? Config.BulletinPublish : Config.BulletinEdit + this.state.bulletinId; 

        Service.UserAction(url, body, createNew ? 'POST' : 'PATCH').then((response)=>{
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
                this.props.navigation.state.params.callback(this.state.bulletinText);
                this.props.navigation.goBack();
            }
            else if(jsonData.isSuccess)
            {
                ToastAndroid.show(createNew ? '发布成功' : '修改成功',ToastAndroid.SHORT);
                this.sendBulletinCast(this.state.schoolClassId, this.state.bulletinText);
                /* 调用回调函数更新公告列表 */
                this.props.navigation.state.params.callback(this.state.bulletinText);
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
            alert(error)
            console.log(error);
            ToastAndroid.show(err_info.NO_INTERNET ,ToastAndroid.SHORT);
            this.props.navigation.state.params.callback(this.state.bulletinText);
            this.props.navigation.goBack();
        });
    };

    render() {
        return (
            <View style = {[styles.container,{backgroundColor:global.theme.backgroundColor}]}>
                <TextInput style={[styles.bulletinDetail,{color:global.theme.textColor}]} 
                    multiline={true}
                    onChangeText= {(text)=> {
                        this.setState({bulletinText: text});
                    }}
                    defaultValue={this.state.bulletinText}
                    editable={true}
                    autoFocus={true}    // 自动弹出键盘
                    underlineColorAndroid={'transparent'} // 去掉下划线
                    selectionColor={global.theme.selectionColor}
                >
                </TextInput>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bulletinDetail: {
        flex: 1,
        color: 'black',
        fontSize: 17,
        lineHeight: 33,
        marginRight: 10,
        marginLeft: 18,
        padding: 0,
    },
});
