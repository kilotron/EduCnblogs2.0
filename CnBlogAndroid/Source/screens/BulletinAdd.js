import MyAdapter from './MyAdapter.js';
import Config from '../config';
import api from '../api/api.js';
import {authData,err_info} from '../config'
import * as Service from '../request/request.js'
import React, { Component} from 'react';
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
    _onPress() {
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
        //let url = 'https://api.cnblogs.com/api/edu/member/register/displayName';
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
                ToastAndroid.show('请求失败！',ToastAndroid.SHORT);
            }
            else if(jsonData.isSuccess)
            {
                ToastAndroid.show('添加成功，请刷新查看！',ToastAndroid.SHORT);
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
        });
    }
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
                    onPress={() => {
                        //console.log('公告内容改为 ' + this.state.bulletinText);
                        this._onPress();
                        }
                    }>
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
