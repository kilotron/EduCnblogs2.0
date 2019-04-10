import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,StorageKey} from '../config';
import * as Service from '../request/request.js';
import React, { Component } from 'react';
import { 
    Platform,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Dimensions,
    WebView,
    Alert,
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
const { height, width } = Dimensions.get('window');
const HtmlDecode = require('../DataHandler/HomeworkDetails/HtmlDecode');
const ContentHandler = require('../DataHandler/HomeworkDetails/ContentHandler');
const InfoHandler = require('../DataHandler/HomeworkDetails/InfoHandler');
export default class HomeWorkDetail extends Component{
    constructor(props){
        super(props);
        this.state = {
            content: '',
            convertedContent: '',
            title: '',
            formatTyle: 1,
            answerCount: 0,
            membership: this.props.navigation.state.params.membership,
            Id:0,
            classId:0,
        }
    }
    _isMounted;
    componentWillUnmount = ()=>{
        this._isMounted = false;
    };
    componentWillMount = ()=>{
        this._isMounted = true;
        let {Id, classId} = this.props.navigation.state.params;
		let url = Config.HomeWorkDetail + Id;
        Service.Get(url).then((jsonData)=>{
            if(jsonData !== 'rejected' && this._isMounted)
            {
                this.setState({
                    content: jsonData.content,
                    convertedContent: jsonData.convertedContent,
                    title: jsonData.title,
					formatTyle: jsonData.formatTyle,
                    answerCount: jsonData.answerCount,
                    Id:Id,
                    classId:classId,
                    startTime:jsonData.startTime,
                    deadline:jsonData.deadline,
                    IsShowInHome:jsonData.IsShowInHome,
                })
            }
        })
		.then(()=>{
			global.storage.save({key : StorageKey.HOMEWORKDETAIL+Id,data : this.state});
		})
		.catch((err)=>{
			ToastAndroid.show(err_info.NO_INTERNET, ToastAndroid.SHORT);
			global.storage.load({key:StorageKey.HOMEWORKDETAIL+Id})
			.then((ret)=>{
				this.setState({
                    content: ret.content,
                    convertedContent: ret.convertedContent,
                    title: ret.title,
					formatTyle: ret.formatTyle,
                    answerCount: ret.answerCount,
                })
			})
		})
    }
    
    closeHomework =()=>{
        let url = Config.HomeWorkClose + this.state.classId + '/' + this.state.Id;
        Alert.alert(
            '关闭作业'+this.state.title,
            '确定要关闭吗？',
            [
                {text: '取消'},
                {text: '确认关闭', onPress: ()=>{
                    console.log(url);
                    Service.UserAction(url, '', 'PATCH')
                    .then((response)=>{
                        if(response.status !== 200){
                            console.log(response.status);
                            return null;
                        }
                        else
                            return response.json();
                    })
                    .then((jsonData)=>{
                        if(jsonData==null)
                            ToastAndroid.show("请求失败，您的身份可能不对！",ToastAndroid.SHORT);
                        else if(jsonData.isSuccess)
                        {
                            ToastAndroid.show('成功关闭作业',ToastAndroid.SHORT);
                            this.props.navigation.state.params.callback();
                            this.props.navigation.goBack();
                        }
                        else if(jsonData.isWarning)
                            ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
                        else
                            ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                    }).catch((error)=>{
                        ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT);
                        console.log(error);
                    })
                }},
            ]
        )
    }

    removeHomework =()=>{
        let url = Config.HomeWorkRemove + this.state.classId + '/' + this.state.Id;
        let body = JSON.stringify(
            {
                homeworkId:'' + this.state.Id,
                schoolClassId:'' + this.state.classId
            });
        Alert.alert(
            '删除作业'+this.state.title,
            '确定要删除吗？',
            [
                {text: '取消'},
                {text: '确认删除', onPress: ()=>{
                    console.log(url);
                    console.log(body);
                    Service.UserAction(url, body, 'DELETE')
                    .then((response)=>{
                        if(response.status !== 200){
                            console.log(response.status);
                            return null;
                        }
                        else
                            return response.json();
                    })
                    .then((jsonData)=>{
                        if(jsonData==null)
                            ToastAndroid.show("请求失败，您的身份可能不对！",ToastAndroid.SHORT);
                        else if(jsonData.isSuccess)
                        {
                            ToastAndroid.show('成功删除作业',ToastAndroid.SHORT);
                            this.props.navigation.state.params.callback();
                            this.props.navigation.goBack();
                        }
                        else if(jsonData.isWarning)
                            ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
                        else
                            ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                    }).catch((error)=>{
                        ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT);
                        console.log(error);
                    })
                }},
            ]
        )
    }

    renderBottomBar(Id,isFinished,classId,answerCount){
        if(this.state.membership === 1){
            return(
                <View style = {styles.bottom}>
                    <TouchableOpacity
                    onPress = {()=>this.props.navigation.navigate('Submitted',{Id: Id})}
                    style = {styles.button}
                    >
                        <Text style = {{fontSize: 15, textAlign: 'center', color: 'white'}}>
                            已提交列表({answerCount}人)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {isFinished == true ? ()=>{} : 
                                ()=>this.props.navigation.navigate('HomeworkSubmit',{homeworkId: Id, classId: classId})}
                        style = {isFinished == true ? styles.buttonGrey : styles.button}
                        activeOpacity = {isFinished == true ? 1 : 0.2}
                        >
                        <Text style = {styles.buttonText}>
                            选择并提交作业
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else {
            return(
                <View style = {styles.bottom}>
                    <TouchableOpacity
                    onPress = {()=>this.props.navigation.navigate('Submitted',{Id: Id})}
                    style = {styles.button2}
                    >
                        <Text style = {styles.buttonText}>
                            已提交列表({answerCount}人)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {
                            ()=>{
                                var editPack = {
                                    homeworkId: Id, 
                                    operatorInfo:{
                                        schoolClassId:classId,
                                        blogId:this.props.navigation.state.params.blogId,
                                    },
                                    title:this.state.title,
                                    startTime:this.state.startTime,
                                    deadline:this.state.deadline,
                                    content:this.state.content,
                                    formatTyle:this.state.formatTyle,
                                    IsShowInHome:this.state.IsShowInHome,
                                }
                                this.props.navigation.navigate('HomeworkEdition',editPack)
                            }
                        }
                        style = {styles.button2Orange}
                        >
                        <Text style = {styles.buttonText}>
                            编辑作业
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {isFinished == true ? ()=>{} : ()=>{this.closeHomework()}}
                        style = {isFinished == true ? styles.button2Grey : styles.button2DarkGrey}
                        activeOpacity = {isFinished == true ? 1 : 0.2}
                        >
                        <Text style = {styles.buttonText}>
                            关闭作业
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {()=>{this.removeHomework()}}
                        style = {styles.button2Red}
                        >
                        <Text style = {styles.buttonText}>
                            删除作业
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
    
    render(){        
        let {url, Id, classId, isFinished} = InfoHandler(this.props.navigation.state.params);
        let {content, convertedContent, title, formatTyle, answerCount} = ContentHandler(this.state);
        return(
            <View style = {styles.container}>
                <View
                    style= {{
                        alignSelf: 'stretch',
                        flex:1,
                    }}
                >
                    <WebView
                        source={{html: content, baseUrl: ''}}
                        style={{height: height-40}}
                        startInLoadingState={true}
                        domStorageEnabled={true}
                        javaScriptEnabled={true}
                        scalesPageToFit={true}
                        onError = {()=>Alert.alert('网络异常，请稍后再试！')}
                    />
                </View>
                <View style = {{height: 1, backgroundColor: 'rgb(204,204,204)', alignSelf:'stretch'}}/>
                {this.renderBottomBar(Id,isFinished,classId,answerCount)}  
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        flex:1,
        alignSelf: 'stretch',
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: height/16,
        alignSelf: 'stretch',
        backgroundColor: 'white'
    },
    button:{
        width: width/2.2,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007acc',
        borderRadius: 8,
    },
    buttonGrey:{
        width: width/2.8,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dcdcdc',
        borderRadius: 8,
    },
    button2:{
        width: width/5,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007acc',
        borderRadius: 8,
    },
    button2Orange:{
        width: width/5,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f96b36',
        borderRadius: 8,
    },
    button2Grey:{
        width: width/5,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dcdcdc',
        borderRadius: 8,
    },
    button2DarkGrey:{
        width: width/5,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#424242',
        borderRadius: 8,
    },
    button2Red:{
        width: width/5,
        height: height/18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff0000',
        borderRadius: 8,
    },
    buttonText:{fontSize: 15, textAlign: 'center', color: 'white'},
})