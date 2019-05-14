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
    ScrollView,
    TouchableOpacity,
} from 'react-native';
const screenWidth= MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const navigationHeaderHeight = 45;
const Teacher = 2;
const TA = 3;

// 该页面使用navigate参数为classId
export default class BulletinEdition extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            height: navigationHeaderHeight,
            elevation: 1,
            backgroundColor: global.theme.headerBackgroundColor,
        },
        headerTintColor: global.theme.headerTintColor,
        headerRight: (
            navigation.state.params.membership == Teacher ||
            navigation.state.params.membership == TA 
            ? (
                <TouchableOpacity style={{marginRight:18}} onPress={()=>{alert('编辑公告')}}>
                    <Text style={{color: global.theme.headerTintColor, fontSize: 18}}>编辑</Text>
                </TouchableOpacity>)
            : (null)),
    })

    constructor(props){
        super(props);
        this.state={
            schoolClassId: this.props.navigation.state.params.schoolClassId,
            bulletinText: this.props.navigation.state.params.bulletinText,
            bulletinId: this.props.navigation.state.params.bulletinId,
            membership: this.props.navigation.state.params.membership,
        };
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
            }
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
    /* 单击修改后的响应函数 */
    _onPress = ()=>{
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
        let url = Config.BulletinEdit + this.state.bulletinId;
        Service.UserAction(url, body, 'PATCH').then((response)=>{
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
                this.props.navigation.state.params.callback();
                this.props.navigation.goBack();
            }
            else if(jsonData.isSuccess)
            {
                ToastAndroid.show('修改成功',ToastAndroid.SHORT);
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
            console.log(error);
            ToastAndroid.show(err_info.NO_INTERNET ,ToastAndroid.SHORT);
            this.props.navigation.state.params.callback();
            this.props.navigation.goBack();
        });
    };
    render() {
        return (
            <View style = {[styles.container,{backgroundColor:global.theme.backgroundColor}]}>
                <ScrollView style={styles.detailView}
                    contentContainerStyle={styles.contentContainer}
                >
                    <Text style={[styles.bulletinDetail,{color:global.theme.textColor}]}
                        selectable={true}
                        selectionColor={global.theme.selectionColor}
                    >{this.state.bulletinText}</Text>
                    <TouchableOpacity style={[styles.commitBtn, {
                            backgroundColor:global.theme.buttonColor,
                            borderColor: global.theme.buttonBorderColor,
                        }]} onPress={()=>{this.props.navigation.goBack()}}>
                        <Text style={[styles.commitBtnText, {color: global.theme.buttonTextColor}]}>完成</Text>
                    </TouchableOpacity>
                </ScrollView>
               {/*} <View style={styles.detailView}>
                    <TextInput style={[styles.bulletinDetail,{color:global.theme.textColor}]} multiline={true}
                        onChangeText= {(text)=>
                            this.setState({bulletinText: text})
                            }
                        defaultValue={this.state.bulletinText}
                        editable={(this.state.membership==2||this.state.membership==3)?true: false}
                        >
                    </TextInput>
                        </View>*/}

            </View>
        );
    }
/*
    render() {
        return (
            <View style = {[styles.container,{backgroundColor:global.theme.backgroundColor}]}>
                <View style={styles.detailView}>
                    <TextInput style={[styles.bulletinDetail,{color:global.theme.textColor}]} multiline={true}
                        onChangeText= {(text)=>
                            this.setState({bulletinText: text})
                            }
                        defaultValue={this.state.bulletinText}
                        editable={(this.state.membership==2||this.state.membership==3)?true: false}
                        >
                    </TextInput>
                </View>
                {
                    (this.state.membership==2||this.state.membership==3)?
                    (
                        <TouchableOpacity style={[styles.commitBtn, {
                                backgroundColor:global.theme.buttonColor,
                                borderColor: global.theme.buttonBorderColor,
                            }]} onPress={this._onPress}>
                            <Text style={[styles.commitBtnText, {color: global.theme.buttonTextColor}]}>修改公告</Text>
                        </TouchableOpacity>
                    )
                    : (null)
                }
            </View>
        );
    }*/
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
        flexDirection: 'column',
        marginLeft: 0,
        marginRight: 2, // 滚动条离屏幕右边缘有一点距离
        marginTop: 0,
        marginBottom: 0,
    },
    commitBtn: {
        flex: 0,
        width: 0.25*screenWidth,
        height: 0.1*screenWidth,
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 25,
        borderWidth: 0.75,
        borderRadius: 4,
    },
    commitBtnText: {
        fontSize: 18,
        textAlign:'center',
    },
    promptText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 15,
        marginBottom: 10, 
    },
    bulletinDetail: {
        flex: 1,
        color: 'black',
        fontSize: 17,
        lineHeight: 33,
        marginRight: 10,
        marginLeft: 18,
    },
    contentContainer: {
        flexGrow: 1,    // ScrollView的contentContainerStyle
    },
});
