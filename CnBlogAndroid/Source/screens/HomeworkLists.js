import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config';
import * as Service from '../request/request.js';
import MyAdapter from './MyAdapter.js';
import HeaderNoBackComponent from './HeaderNoBackComponent.js'
import React, { Component} from 'react';
import {StorageKey} from '../config'
import {err_info} from '../config'
import {flatStyles} from '../styles/styles'
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    ToastAndroid,
    TouchableHighlight,
    TextInput,
    FlatList,SectionList,
    TouchableOpacity,
} from 'react-native';
import Toast from 'teaset/components/Toast/Toast';
import {requireTime} from '../request/requireTime.js';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');
const relativeTime = require('../DataHandler/DateHandler');

export default class HomeworkLists extends Component {
    constructor(props){
        super(props);
        this.state = {
            homeworks: [],
            counts: 0,      //作业数量
            membership: 1,
            finishedcount: 0,
            isRequestSuccess: false,
            classId:this.props.classId,
            blogId:0,
            currentTime:-1,
        }
    }
    // 标志位
    _isMounted;
    componentWillUnmount = ()=>{
        this._isMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            homeworks: [],
            counts: 0,
            finishedcount: 0,
            isRequestSuccess:false,
            classId:nextProps.classId,
        });
        this.UpdateDataNext(nextProps.classId);
        // this.componentWillMount();
    }

    //应该传进来班级ID作为属性
    componentWillMount = ()=>{
        requireTime().then((result)=>{
            this.setState({currentTime:result});
            // 先设标志位为true，表示组件未卸载
            this._isMounted = true;
            let classId = this.state.classId;
            let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+classId+"/1-12";
            // 先获取作业数量，再按作业数量获取作业信息列表
            Service.Get(url).then((jsonData)=>{
                if(jsonData!=='rejected')
                {
                    this.setState({
                        isRequestSuccess: true,
                    })
                    if(this._isMounted)
                    {
                        this.setState({
                            counts: jsonData.totalCount,
                        });
                    }
                }
            }).then(()=>{
                global.storage.save({key:StorageKey.HOMEWORK_COUNT,data:this.state.counts});
            })
            .then(()=>{
                let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+classId+"/"+1+"-"+this.state.counts;
                Service.Get(url).then((jsonData)=>{
                    if(this._isMounted&&this.state.isRequestSuccess){
                        this.setState({
                            homeworks: jsonData.homeworks,
                        });
                    }
                })
                .then(()=>{
                    var c = 0;
                    for(var i in this.state.homeworks)
                    {
                        let today = this.state.currentTime == -1 ? new Date() : new Date(this.state.currentTime); // 当前日期
                        let _startday = this.state.homeworks[i].startTime; // 作业开始日期
                        let startday = this.StringToDate(_startday);
                        if(this.state.homeworks[i].isFinished===false && today >= startday)
                            c++;
                    }
                    if(this._isMounted)
                    {
                        this.setState({
                            finishedcount: c,
                        })
                    }
                })
                .then(()=>{
                    global.storage.save({key:StorageKey.CLASS_HOMEWORK,data:this.state.homeworks});
                })
                .then(()=>{
                    let url1 = Config.apiDomain + api.user.info;
                    Service.Get(url1).then((jsonData)=>{
                        let url2= Config.apiDomain+"api/edu/member/"+jsonData.BlogId+"/"+this.state.classId;
                        Service.Get(url2).then((jsonData)=>{
                            if(this._isMounted && jsonData!=='rejected'){
                                this.setState({
                                    blogId: jsonData.blogId,
                                    membership: jsonData.membership,
                                })
                            }
                        })
                    })
                    .then(()=>{
                        global.storage.save({key : StorageKey.MEMBER_SHIP,data : this.state.membership});
                    })
                })
            })
            .catch((error)=>{
                global.storage.load({key : StorageKey.HOMEWORK_COUNT})
                .then((ret)=>{
                    this.setState({
                        counts : ret,
                    })
                })
                .then(()=>{
                    global.storage.load({key : StorageKey.CLASS_HOMEWORK})
                    .then((ret)=>{
                        this.setState({
                            homeworks: ret,
                        })
                    })
                })
                .then(()=>{
                    global.storage.load({key : StorageKey.MEMBER_SHIP})
                    .then((ret)=>{
                        this.setState({
                            membership: ret,
                        })
                    })
                })
            })
        });
    };
    UpdateData=()=>{
        this.setState({
            homeworks: [],
            counts: 0,
            finishedcount: 0,
            isRequestSuccess:false,
        });
        this.componentWillMount();
    };
    UpdateDataNext=(Id)=>{
        // 先设标志位为true，表示组件未卸载
        this._isMounted = true;
        let classId = Id;
        let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+classId+"/1-12";
        // 先获取作业数量，再按作业数量获取作业信息列表
        Service.Get(url).then((jsonData)=>{
            if(jsonData!=='rejected')
            {
                this.setState({
                    isRequestSuccess: true,
                })
                if(this._isMounted)
                {
                    this.setState({
                        counts: jsonData.totalCount,
                    });
                }
            }
        }).then(()=>{
            global.storage.save({key:StorageKey.HOMEWORK_COUNT,data:this.state.counts});
        })
        .then(()=>{
            let url = Config.apiDomain + api.ClassGet.homeworkList + "/false/"+classId+"/"+1+"-"+this.state.counts;
            Service.Get(url).then((jsonData)=>{
                if(this._isMounted&&this.state.isRequestSuccess){
                    this.setState({
                        homeworks: jsonData.homeworks,
                    });
                }
            })
            .then(()=>{
                var c = 0;
                for(var i in this.state.homeworks)
                {
                    let today = new Date(); // 当前日期
                    let _startday = this.state.homeworks[i].startTime; // 作业开始日期
                    let startday = this.StringToDate(_startday);
                    if(this.state.homeworks[i].isFinished===false && today >= startday)
                        c++;
                }
                if(this._isMounted)
                {
                    this.setState({
                        finishedcount: c,
                    })
                }
            })
            .then(()=>{
                global.storage.save({key:StorageKey.CLASS_HOMEWORK,data:this.state.homeworks});
            })
            .then(()=>{//这个then用来获得membership
                let url1 = Config.apiDomain + api.user.info;//获取当前登录用户信息，用来获取博客Id
                Service.Get(url1).then((jsonData)=>{
                    //根据博客Id获取成员信息，以获取membership
                    let url2= Config.apiDomain+"api/edu/member/"+jsonData.BlogId+"/"+this.state.classId;
                    Service.Get(url2).then((jsonData)=>{
                        if(this._isMounted && jsonData!=='rejected'){
                            this.setState({
                                blogId: jsonData.blogId,
                                membership: jsonData.membership,
                            })
                        }
                    })
                })
                .then(()=>{
                    global.storage.save({key : StorageKey.MEMBER_SHIP,data : this.state.membership});
                })
            })
        })
        .catch((error)=>{
            global.storage.load({key : StorageKey.HOMEWORK_COUNT})
            .then((ret)=>{
                this.setState({
                    counts : ret,
                })
            })
            .then(()=>{
                global.storage.load({key : StorageKey.CLASS_HOMEWORK})
                .then((ret)=>{
                    this.setState({
                        homeworks: ret,
                    })
                })
            })
            .then(()=>{
                global.storage.load({key : StorageKey.MEMBER_SHIP})
                .then((ret)=>{
                    this.setState({
                        membership: ret,
                    })
                })
            })
        })
    };
    _onPress = ()=>{
        let url = Config.apiDomain + api.user.info;
        if (this.state.membership==2||this.state.membership==3)
            this.props.navigation.navigate('HomeworkPost',{
                classId: this.state.classId,
                blogId:this.state.blogId,
                callback:this.UpdateData,
            });
        else
        {
            ToastAndroid.show("您没有权限，只有老师和助教才能发布作业哦！",ToastAndroid.SHORT);
        }
    };
    _renderItem = (item)=>{
        let item1 = item;
        var title = item1.item.title;//作业标题
        var description = item1.item.description;//作业描述
        var deadline = (item1.item.deadline != null ? item1.item.deadline :"Tundefine");//作业截止日期
        var url = item1.item.url;//作业地址
        var Id = item1.item.key;//作业Id
        var isFinished = item1.item.isFinished;
        var isClosed = item1.item.isClosed;

        return (
            <View style={[flatStyles.cellWithBorder, {backgroundColor: global.theme.backgroundColor}]}>
                <TouchableOpacity
                    //url:作业url，如示例的'/campus/bjwzxy/test/homework/9'
                    onPress = {()=>this.props.navigation.navigate('HomeworkDetail',{
                                url: url, 
                                Id: Id,
                                classId: this.state.classId, 
                                isFinished: isFinished,
                                membership:this.state.membership,
                                callback:this.UpdateData,
                                //编辑作业所需参数
                                blogId:this.state.blogId,
                                })}
                    style = {[HomeworkStyles.container, {backgroundColor: global.theme.backgroundColor}]}
                >
                    <Text style= {isClosed ? [HomeworkStyles.greyTitleTextStyle, {color: global.theme.homeworkGrayTitleColor}] : [HomeworkStyles.titleTextStyle, {color: global.theme.homeworkTitleColor}]}>
                        {HTMLSpecialCharsDecode(title)}
                    </Text>
                    <Text numberOfLines={3} style= {[HomeworkStyles.abstractTextStyle, {color: global.theme.textColor}]}>
                        {HTMLSpecialCharsDecode(description)}
                    </Text>
                    <Text style= {isClosed ? [HomeworkStyles.closedInformationTextStyle, {color: global.theme.homeworkClosedTimeTextColor}] : (isFinished ? [HomeworkStyles.outdateInformationTextStyle, {color: global.theme.homeworkFinishedTimeTextColor}] : [HomeworkStyles.informationTextStyle, {color: global.theme.homeworkUnfinishedTimeTextColor}])}>
                        {'截止于: ' + relativeTime(deadline)}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    _sectionHeader = (info)=>{
        return (
            <View style={HomeworkStyles.sectionHeaderViewStyle}>
                <Text style={[HomeworkStyles.sectionHeaderTextStyle, {color: global.theme.homeworkSectionHeaderTextColor}]}>{info.section.key}</Text>
            </View>
        );
    }

    StringToDate = (day)=>{
        // YYYY-MM-DDTHH:MM:SS
        if(day == null)
            return new Date();
        let s1 = day.split('T')[0];
        let s2 = day.split('T')[1];
        let YMD = s1.split('-');
        let HMS = s2.split(':');
        return new Date(Number(YMD[0]),Number(YMD[1])-1,Number(YMD[2]),Number(HMS[0]),Number(HMS[1]),Number(HMS[2].substring(0,2)));
    }
    generateAddButton(){
        if(this.state.membership == 2 || this.state.membership == 3){
            return(
                <TouchableHighlight 
                    underlayColor={global.theme.addUnderlayColor}
                    activeOpacity={0.5}
                    style={{
                        position:'absolute',
                        bottom:20,
                        right:10, 
                        backgroundColor: global.theme.addBackgroundColor,
                        width: 52, 
                        height: 52, 
                        borderRadius: 26,
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        margin: 20}} 
                        onPress={this._onPress} >
                    
                    <Text
                        style= {{
                            fontSize: 30,
                            color: global.theme.addTextColor,
                            textAlign: 'center',
                            fontWeight: '100',
                        }}
                    >
                        +
                    </Text>
                    
                </TouchableHighlight>
            );
        }
        else return;
    }
    render() {
        var data = [];//未结束作业
        var FinishedData = [];//已结束作业
        var closedData = [];//已关闭作业
        var dataSize = 0;
        for(var i in this.state.homeworks)
        {
            let today = this.state.currentTime == -1 ? new Date() : new Date(this.state.currentTime); // 当前日期
            let _startday = this.state.homeworks[i].startTime; // 作业开始日期
            let startday = this.StringToDate(_startday);
            if(_startday == null || today >= startday)//只显示已开始的作业
            {
                if(this.state.homeworks[i].isClosed){
                    closedData.push(
                        {
                            key: this.state.homeworks[i].homeworkId,//作业ID
                            title: this.state.homeworks[i].title,//作业标题
                            url: this.state.homeworks[i].url,//作业网址
                            description: this.state.homeworks[i].description,//作业描述
                            deadline: this.state.homeworks[i].deadline,//作业截止日期
                            isFinished: this.state.homeworks[i].isFinished,// 作业是否结束
                            isClosed:this.state.homeworks[i].isClosed,
                        }
                    )
                }
                else if(this.state.homeworks[i].isFinished){
                    FinishedData.push(
                        {
                            key: this.state.homeworks[i].homeworkId,//作业ID
                            title: this.state.homeworks[i].title,//作业标题
                            url: this.state.homeworks[i].url,//作业网址
                            description: this.state.homeworks[i].description,//作业描述
                            deadline: this.state.homeworks[i].deadline,//作业截止日期
                            isFinished: this.state.homeworks[i].isFinished,// 作业是否结束
                            isClosed:this.state.homeworks[i].isClosed,
                        }
                    )
                }
                else{
                    data.push(
                        {
                            key: this.state.homeworks[i].homeworkId,//作业ID
                            title: this.state.homeworks[i].title,//作业标题
                            url: this.state.homeworks[i].url,//作业网址
                            description: this.state.homeworks[i].description,//作业描述
                            deadline: this.state.homeworks[i].deadline,//作业截止日期
                            isFinished: this.state.homeworks[i].isFinished,// 作业是否结束
                            isClosed:this.state.homeworks[i].isClosed,
                        }
                    )
                    dataSize++;
                }
            }
        }
        return (
        <View
            style= {{
                flexDirection: 'column',
                flex: 1,
                backgroundColor: global.theme.backgroundColor,
            }}
        >
            <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)', }}/>
            <View
                style= {{
                    flexDirection: 'row',
                    justifyContent:'flex-start',
                    alignItems: 'flex-start',
                    alignSelf: 'stretch',
                    flex:1,
                }}
            >
                <SectionList
                    extraData={this.state}
                    sections={[
                        {key:'未结束:'+dataSize, data:data},
                        {key:'已结束', data:FinishedData},
                        {key:'已关闭',data:closedData},
                    ]}
                    renderSectionHeader = {this._sectionHeader}
                    renderItem={this._renderItem}
                    onRefresh = {this.UpdateData}
                    refreshing= {false}
                />
            </View>
            {this.generateAddButton()}
      </View>
    );
  }
}

const HomeworkStyles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        alignSelf: 'stretch',
        marginLeft: 0.03*screenWidth,
        marginRight: 0.04*screenWidth,
    },
    titleTextStyle:{
        fontSize: 18,
        color: '#000000',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 2,
        fontWeight: 'bold',
    },
    greyTitleTextStyle:{
        fontSize: 18,
        color: '#dcdcdc',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 2,
        fontWeight: 'bold',
    },
    abstractTextStyle:{
        fontSize: 14,
        color:'rgb(70,70,70)',
        textAlign: 'left',
        marginBottom: 8,
        lineHeight: 25
    },
    informationTextStyle:{
        alignSelf: "flex-end",
        fontSize: 10,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8
    },
    outdateInformationTextStyle:{
        alignSelf: "flex-end",
        fontSize: 10,
        color: 'red',
        textAlign: 'center',
        marginBottom: 8,
    },
    closedInformationTextStyle:{
        alignSelf: "flex-end",
        fontSize: 10,
        color: '#dcdcdc',
        textAlign: 'center',
        marginBottom: 8,
    },
    sectionHeaderStyle:{
        height:3,
        justifyContent:'center',
    },
    sectionHeaderViewStyle:{
        justifyContent:'center',
        alignItems:'center',
        height:screenHeight/20,
    },
    sectionHeaderTextStyle:{
        textAlign:'center',
        fontSize:18,
        color:'#2c2c2c',
        // fontWeight:10,
    },
});
