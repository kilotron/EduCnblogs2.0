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
    Image,
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
import * as umengPush from '../umeng/umengPush'
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
            formatType: 2,
            answerCount: 0,
            membership: this.props.navigation.state.params.membership,
            Id:0,
            classId:0,
            isShowInHome:false,
            originContent:'',
            isClosed:false,
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
                    originContent:jsonData.content,
                    convertedContent: jsonData.convertedContent,
                    title: jsonData.title,
					formatType: jsonData.formatType,
                    answerCount: jsonData.answerCount,
                    Id:Id,
                    classId:classId,
                    startTime:jsonData.startTime,
                    deadline:jsonData.deadline,
                    isShowInHome:jsonData.isShowInHome,
                    isClosed:jsonData.isClosed,
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
					formatType: ret.formatType,
                    answerCount: ret.answerCount,
                })
			})
		})
    }
    
    closeHomework =()=>{
        let url = Config.HomeWorkClose + this.state.classId + '/' + this.state.Id;
        let body = JSON.stringify(
            {
                blogId:this.props.navigation.state.params.blogId,
                homeworkId:this.state.Id,
                schoolClassId:this.state.classId
            });
        Alert.alert(
            '关闭作业'+this.state.title,
            '确定要关闭吗？',
            [
                {text: '取消'},
                {text: '确认关闭', onPress: ()=>{
                    console.log(url);
                    Service.UserAction(url, body, 'PATCH')
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
                            ToastAndroid.show("请求失败，未知错误",ToastAndroid.SHORT);
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
                blogId:this.props.navigation.state.params.blogId,
                homeworkId:this.state.Id,
                schoolClassId:this.state.classId
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
                            ToastAndroid.show("请求失败，未知错误",ToastAndroid.SHORT);
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
    remind = ()=>{
        this.editView.show();
        let params = {
            ticker:'作业提交提醒',
            title:"作业《" + this.state.title +"》截止提醒",
            text:'老师/助教提醒您提交作业，请及时关注！（已提交请忽略）'
        }
        castId = this.state.classId + '_' + this.state.Id;
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
    renderBottomBar(Id,isFinished,classId,answerCount){
        isClosed = this.state.isClosed;
        if(this.state.membership === 1){
            return(
                <View style = {styles.bottom}>
                    <TouchableOpacity
                        onPress = {()=>this.props.navigation.navigate('Submitted',{Id: Id})}
                        style = {styles.touchbutton}
                        >
                        <View style={styles.subListIconStyle}>
                            <Image source =
                            {require('../images/list.png')}
                            style = {styles.subListImagestyle}/>
                            <Text style = {styles.subListTextStyle}>({answerCount}人提交)</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {(isFinished || isClosed) == true ? ()=>{} : 
                                ()=>this.props.navigation.navigate('HomeworkSubmit',{homeworkId: Id, classId: classId})}
                        style = {styles.touchbutton}
                        activeOpacity = {(isFinished || isClosed) == true ? 1 : 0.2}
                        >
                        <Image source =
                        {(isFinished || isClosed) == true ? require('../images/submitUnable.png') : require('../images/submit.png')}
                        style = {styles.imagestyle}/>
                    </TouchableOpacity>
                </View>
            )
        }
        else {
            return(
                <View style = {styles.bottom}>
                    <TouchableOpacity
                        onPress = {()=>this.props.navigation.navigate('Submitted',{Id: Id})}
                        style = {styles.touchbutton}
                        >
                        <View style={styles.subListIconStyle}>
                            <Image source =
                            {require('../images/list.png')}
                            style = {styles.subListImagestyle}/>
                            <Text style = {styles.subListTextStyle}>({answerCount}人提交)</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress = {
                            ()=>{
                                if(this.state.formatType !== 1){
                                    ToastAndroid.show('暂不支持markdown格式的编辑!',ToastAndroid.SHORT);
                                }
                                var editPack = {
                                    homeworkId: Id, 
                                    operatorInfo:{
                                        schoolClassId:classId,
                                        blogId:this.props.navigation.state.params.blogId,
                                    },
                                    title:this.state.title,
                                    startTime:this.state.startTime,
                                    deadline:this.state.deadline,
                                    // content:this.state.convertedContent == null ? this.state.originContent : this.state.convertedContent,
                                    content:this.state.originContent,
                                    formatType:this.state.formatType,
                                    isShowInHome:this.state.isShowInHome,
                                    callback:this.componentWillMount,
                                }
                                // editPack = this.cutContent(editPack);
                                this.props.navigation.navigate('HomeworkEdition',editPack)
                            }
                        }
                        style = {styles.touchbutton}
                        >
                        <Image source =
                        {require('../images/edit.png')}
                        style = {styles.imagestyle}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.touchbutton}
                        activeOpacity = {(isFinished || isClosed) == true ? 1 : 0.2}
                        onPress = {(isFinished || isClosed) == true ? ()=>{} : ()=>{this.closeHomework()}}
                        >
                        <Image source =
                        {(isFinished || isClosed) == true ? require('../images/closeUnable.png') : require('../images/closeAble.png')}
                        style = {styles.imagestyle}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.touchbutton}
                        onPress = {this.removeHomework}
                        >
                        <Image source =
                        {require('../images/delete.png')}
                        style = {styles.imagestyle}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.touchbutton}
                        onPress = {this.remind}
                        >
                        <Image source =
                        {require('../images/dinosaur.jpg')}
                        style = {styles.imagestyle}/>
                    </TouchableOpacity>
                </View>
            )
        }
    }
    
    render(){        
        let {url, Id, classId, isFinished} = InfoHandler(this.props.navigation.state.params);
        let {content, convertedContent, title, formatType,isShowInHome, answerCount} = ContentHandler(this.state);
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
 
    touchbutton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        // width: height/14,
        height: height/14,
    },
    imagestyle: {
        width: height/18,
        height: height/22,
        resizeMode: 'stretch',
    },
    subListIconStyle:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    subListImagestyle:{
        width: height/18,
        height: height/24,
        resizeMode: 'stretch',
    },
    subListTextStyle:{
        fontSize: 12,
        textAlign: 'center', 
        color: 'black'
    },
})