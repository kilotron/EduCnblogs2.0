import Config from '../config';
import api from '../api/api.js';
import { authData, err_info, StorageKey } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component } from 'react';
import { UI } from '../../Source/config';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    AppRegistry,
    TouchableOpacity,
    FlatList,
    Image,
    Alert
} from 'react-native';
import Vote from '../component/Vote';
import VoteCommit from '../component/VoteCommit';
import FoldText from "../component/FoldText";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Echarts from 'native-echarts'
import { ThemeContext } from '../styles/theme-context';
import { Toast } from 'native-base';
import { getHeaderStyle } from '../styles/theme-context';

//import { nodeInternals } from 'stack-utils';
const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');
const extractVoteContentData = require('../DataHandler/VoteContent');

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
// 投票隐私
const Public = 1;
const Anonymous = 2;

/**navigation参数：
 * voteId：投票Id
 * voteCount: 已投票人数
 * callback：删除投票后调用的函数
 */
export default class VoteDetail extends Component {
    /**navigationOptions放在此处，可以在标题栏放一个按钮跳转到另一个页面。 */
    static navigationOptions = ({ navigation }) => ({
        headerTitle: '投票详情',
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
        headerRight: navigation.state.params.privacy === Public ? (
            <TouchableOpacity onPress={() => {
                if (navigation.state.params.voteCount == 0) {
                    Alert.alert('提示', '尚无成员参与投票 (lll￢ω￢) wow~', [
                        { text: '确定', },
                    ]);
                    return;
                }
                if (typeof (navigation.state.params.voteContent) == 'undefined') {
                    ToastAndroid.show('请等待1秒', ToastAndroid.SHORT);
                    return; // voteContent还没有获取到
                }
                navigation.navigate('VoteMemberList', {
                    schoolClassId: navigation.state.params.schoolClassId,
                    voteId: navigation.state.params.voteId,
                    voteContent: navigation.state.params.voteContent,
                });
            }}>
                <Image
                    source={require('../images/nav_i.png')}
                    style={{
                        height: 22,
                        width: 22,
                        marginRight: 12
                    }}
                    tintColor={global.theme.headerTintColor}
                />
            </TouchableOpacity>
        ) : (<View></View>),
    })

    constructor(props) {
        super(props);
        /* 用户在这个班级的成员ID */
        this.memberId = -1;
        this.state = {
            voteId: this.props.navigation.state.params.voteId,

            name: "",
            content: "",
            descriptio: "",
            privacy: "",
            voteCount: 0,
            blogUrl: "", //发布者的blog
            publisher: "",
            publisherId: "",
            schoolClassId: "",
            deadline: null,
            dateAdded: null,
            isFinished: undefined,   // 初始时不显示提交按钮
            isPublisher: undefined,  // 是否发起者
            hasVoted: undefined, // 是否已经投票          
            voteContent: [],/* 每一个投票的题目和选项、图片等信息。*/
            voteData: [],   // 传递给Vote组件的数据
            voteContentId: [], //存放该投票内的所有问题的Id
        }
        this.selectedIds = [],
            this.info = {};
        this.info.complete = false;
        this.info.unselectedNumbers = '所有';
        this.info.selectedNumbers = '';
    }

    _isMounted;
    globalVoteContentId = [];
    globalVoteStatic = []; //所有问题的统计量
    _hasStatic = false; //是否统计过，也就是每个问题的统计是否给出
    globalOptionStatic = [];

    /** 统计投票 */
    testVoteStatic(proArray) { //参数是需要用到的contentId
        if (proArray == null)
            proArray = this.globalVoteContentId;
        var length = proArray.length;
        let voteStaticURL = Config.VoteStatic + this.state.voteId;
        var num = 0; //初始值设为零
        var num_l = 0;
        var varArray2Store = []; //将要返回的数组
        Service.Get(voteStaticURL).then((jsonData) => {
            for (num = 0; num < length; num++) {
                var varContentId = proArray[num]; //取得每个对应的contentId
                var varArray = []; //准备一个空数组
                var useArray = jsonData[varContentId]; //取得该contentId的数组
                for (num_l = 0; num_l < useArray.length; num_l++) {
                    varArray.push(useArray[num_l].recordCount); //将每个选项的投票值存入数组
                }
                varArray2Store.push(varArray); //将每个问题的数组存入
            }
            this.globalVoteStatic = varArray2Store;
            this.testFunction();
            this._hasStatic = true;
        });
    }

    componentWillMount = () => {
        this._isMounted = true;
        let contenturl = Config.VoteDetail + this.state.voteId;
        let voteContentURL = Config.VoteContent + this.state.voteId;
        let usersURL = Config.UsersInfo;
        var varUserId = 0;
        var varVoteContentId = []; //voteContentId的存放

        Service.Get(usersURL).then((jsonData) => {
            varUserId = jsonData.BlogId; //先获取当前登录用户的信息
        }).then(() => {
            Service.Get(contenturl).then((jsonData) => {
                if (jsonData !== 'rejected') {
                    if (this._isMounted) {
                        this.setState({
                            name: jsonData.name, //测试
                            content: jsonData.content,
                            descriptio: jsonData.descriptio,
                            privacy: jsonData.privacy,
                            voteCount: jsonData.voteCount,
                            blogUrl: jsonData.blogUrl, //发布者的blog
                            publisher: jsonData.publisher,
                            publisherId: jsonData.publisherId,// 发布者博客ID
                            schoolClassId: jsonData.schoolClassId,
                            deadline: jsonData.deadline,
                            dateAdded: jsonData.dateAdded,
                            isFinished: jsonData.isFinished,
                            isPublisher: jsonData.publisherId == varUserId,
                        })
                    }
                    // 为显示投票成员设置
                    this.props.navigation.setParams({
                        schoolClassId: jsonData.schoolClassId,
                        privacy: jsonData.privacy,
                    });
                }
            })
                .then(() => {
                    Service.Get(voteContentURL)
                        .then((jsonData) => {
                            if (jsonData !== 'rejected') {
                                if (this._isMounted) {

                                    var num_x = 0;
                                    for (num_x = 0; num_x < jsonData.length; num_x++) { //提取该问题中所有的contentId
                                        varVoteContentId.push(jsonData[num_x].voteContentId);
                                    }
                                    this.globalVoteContentId = varVoteContentId;
                                    this.setState({ voteContent: jsonData });
                                    this.setState({ voteData: extractVoteContentData(jsonData) });
                                }

                                this.testVoteStatic();
                                // 传递votenContent到显示投票成员页面
                                this.props.navigation.setParams({ voteContent: jsonData });
                            }
                        })
                        .then(() => {
                            this._getVoteState(); // 获取用户是否已经投票。
                        })
                        .catch((err) => {
                            // 无网络连接
                        })
                })
                .catch((err) => {/* 无网络连接*/ });
        })

    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    _renderVoteFooter() {
        /* 1)投票未完成，2)还未投票，且3)不是自己发起的投票的情况下显示提交按钮
         * 如果是自己发起的投票，则显示删除按钮。
         * isFinished, hasVoted, isPublisher初始值是undefined，这里需要与false相比较*/
        if (this.state.isPublisher) {
            return (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert('提示', '确定要删除投票吗？', [
                            { text: '取消', onPress: () => { } },
                            { text: '确定删除', onPress: () => { this._delete() } },
                        ])
                    }}
                >
                    <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
            )
        }
        if (this.state.isFinished === false && this.state.hasVoted === false
            && this.state.isPublisher === false) {
            return (
                <TouchableOpacity
                    style={[styles.submitButton, {backgroundColor:global.theme.backgroundColor}]}
                    onPress={this._submit.bind(this)}
                >
                    <Text style={[styles.submitText, {textColor:global.theme.textColor}]}>提交</Text>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    }

    _renderVoteHeader() {
        if (typeof (this.state.isFinished) == "undefined" || typeof (this.state.hasVoted) == "undefined"
            || typeof (this.state.isPublisher) == "undefined") {
            // 等待3个状态都获取后再显示，不然可能显示的文字会从'已经截止了！'变成'已经投过票了'。
            return null;
        }
        let text = '';
        if (this.state.isFinished && !this.state.hasVoted) {
            text = '已经截止了！';
        } else if (this.state.hasVoted) {
            text = '已经投过票了！';
        } else if (this.state.isPublisher) {
            text = '这是你发起的投票哦~'
        }
        if (this.state.isFinished || this.state.hasVoted || this.state.isPublisher) {
            return (
                <View style={styles.hasVotedView}>
                    <Text style={[styles.hasVotedText, { color: global.theme.headerTintColor }]}>{text}</Text>
                </View>
            )
        }
        return null;
    }

    /** 点击删除按钮调用此函数删除投票。 */
    _delete() {
        let voteDeleteURL = Config.VoteDelete + this.state.schoolClassId + '/' + this.state.voteId;
        Service.UserAction(voteDeleteURL, '', 'DELETE')
            .then((response) => {
                if (response.status !== 200) {
                    return null;
                }
                else {
                    return response.json();
                }
            })
            .then((jsonData) => {
                if (jsonData.isSuccess) {
                    ToastAndroid.show('删除成功！', ToastAndroid.SHORT);
                    this.props.navigation.state.params.callback();
                    this.props.navigation.goBack();
                } else if (jsonData.isWarning) {
                    Alert.alert('提示', jsonData.message);
                } else { //jsonData.isError
                    ToastAndroid.show('删除失败，请重试');
                }
            })
            .catch((error) => { });
    }

    /**点击提交按钮调用此函数提交问卷。 */
    _submit() {
        if (!this.info.complete) {
            Alert.alert('提示', '请完成所有投票内容');
            return;
        }
        let commitURL = Config.VoteCommit + this.state.voteId;
        let postBody = {
            schoolClassId: this.state.schoolClassId,
            voteOptionIds: this.selectedIds,
        }
        postBody = JSON.stringify(postBody);
        Service.UserAction(commitURL, postBody, 'POST')
            .then((response) => {
                if (response === 'rejected') {
                    return null; // 提示信息由UserAction输出
                }
                if (response.status !== 200) {
                    return null;
                }
                return response.json(); // 返回的是Promise对象
            })
            .then((jsonData) => {
                if (jsonData.isSuccess) {
                    Alert.alert('提示', '投票成功');
                    this._getVoteState();   // 刷新界面
                    this.props.navigation.setParams({ voteCount: 1 });
                } else if (jsonData.isWarning) {
                    Alert.alert('提示', jsonData.message);
                } else { // if (jsonData.isError)
                    Alert.alert('错误', '投票失败');
                }
            })
            .catch((error) => {
                ToastAndroid.show(err_info.NO_INTERNET, ToastAndroid.SHORT);
            });
    }

    /**判断用户是否已经投票过了。是则设置this.state.hasVoted=true */
    _getVoteState() {
        let user_url = Config.apiDomain + api.user.info;
        let data = extractVoteContentData(this.state.voteContent);
        Service.Get(user_url)
            .then((jsonData) => {
                var memberIdURL = Config.apiDomain + api.ClassGet.blogID2Mem +
                    jsonData.BlogId + '/' + this.state.schoolClassId;
                return Service.Get(memberIdURL)
            })
            .then((jsonData) => {
                this.memberId = jsonData.memberId;
                let voteIsCommitedURL = Config.VoteIsCommited + this.memberId +
                    '/' + this.state.voteId;
                return Service.Get(voteIsCommitedURL)
            })
            .then((_hasVoted) => {
                if (this._isMounted) {
                    this.setState({
                        hasVoted: _hasVoted,
                    })
                }
            })
            .catch(error => { });

        return data;
    }

    DateFormat = (date) => {
        if (date == null)
            return null;
        let s1 = date.split('T')[0];
        let s2 = date.split('T')[1].split('.')[0];
        return (s1 + '  ' + s2);
    }

    /** 测试方法 */
    /**
     * 参数为一个数组Array，里面的参数是每个问题的投票数目数组
     */
    testFunction() {
        var proArray = this.globalVoteStatic;
        if (proArray == null || proArray.length == 0) return;
        var length = proArray.length; //先求出length的长度，代表有几个问题
        var num = 0;
        var varOptions = [];
        for (num = 0; num < length; num++) {
            var varArray = proArray[num]; //对应下标的数组
            var varLength = varArray.length; //其长度
            var num_l = 0;
            var varData2Use = []; //放入y轴的数组
            for (num_l = 0; num_l < varLength; num_l++) {
                varData2Use.push('op' + (num_l + 1));
            }
            const option = {
                //color : 'red',
                title: {
                    text: '投票统计',
                    textStyle: { color: global.theme.textColor }
                },
                tooltip: {},
                legend: {
                    data: ['票数']
                },
                yAxis: {
                    data: varData2Use,
                    axisLabel: {
                        textStyle: {
                            color: global.theme.textColor,
                        }
                    },
                },
                xAxis: {
                    axisLabel: {
                        textStyle: {
                            color: global.theme.textColor,
                        }
                    },
                },
                series: [{
                    color: [global.theme.headerTintColor],
                    name: '数量',
                    type: 'bar',
                    data: varArray,
                    barWidth: 30,
                }]
            };
            varOptions.push(option);
        }
        this.globalOptionStatic = varOptions; //赋值
    }

    /** 返回图表 */
    /**
     * 
     * @param {*} num 
     * 返回一个问题的统计图视图
     * 
     * num是具体问题在该投票中的序号，下标从0开始
     * 
     */
    testReturnEchart(num) {
        return (
            <View>
                <Echarts option={this.globalOptionStatic[num]}
                //height={300}
                />
            </View>
        )
    }

    render() {
        let voteDisabled = this.state.hasVoted || this.state.isFinished || this.state.isPublisher;
        if (this.state.content == "" || this._hasStatic == false) {
            return null;
        }
        return (
            <View style={{ flex: 1, backgroundColor: global.theme.backgroundColor }}>
                <KeyboardAwareScrollView>
                    {/** header组件 */}
                    <View style={[styles.header, { backgroundColor: global.theme.backgroundColor }]}>

                        <Text style={[styles.headerText, { color: global.theme.textColor }]}>
                            {this.state.name}
                        </Text>
                    </View>

                    {/** detail组件 */}
                    {/** 用于存放如publisher和privacy等信息 */}
                    <View style={[styles.detail, { backgroundColor: global.theme.backgroundColor }]}>
                        <Text style={[styles.publisherText, { color: global.theme.headerTintColor }]} >
                            {this.state.publisher + '\n'}
                        </Text>
                        <Text style={[styles.detailText, { color: global.theme.textColor }]} >
                            {'发布于: ' + this.DateFormat(this.state.dateAdded) + '\n'}
                            {'结束于: ' + this.DateFormat(this.state.deadline) + '\n'}
                            {this.state.privacy == 1 ? '公开投票' : '匿名投票'}
                        </Text>
                    </View>

                    {/** content组件 */}

                    <View style={[styles.content, { backgroundColor: global.theme.backgroundColor }]}>
                        <FoldText
                            style={[{ color: global.theme.textColor }]}
                            maxLines={5} //
                            text={HTMLSpecialCharsDecode(this.state.content)}
                        />
                    </View>
                    {
                        this.state.hasVoted ? (
                            <VoteCommit
                                memberId={this.memberId}
                                voteId={this.state.voteId}
                                voteContent={this.state.voteContent}
                                headerComponent={this._renderVoteHeader.bind(this)}
                                displayStats={true}
                                voteStats={this.globalOptionStatic}
                            />
                        ) : (
                                <Vote
                                    data={this.state.voteData}
                                    recvSelectedIds={(ids, info) => {
                                        this.selectedIds = ids;
                                        this.info = info;
                                    }}
                                    headerComponent={this._renderVoteHeader.bind(this)}
                                    footerComponent={this._renderVoteFooter.bind(this)}
                                    disabled={voteDisabled}
                                    displayStats={this.state.isPublisher && this.state.voteCount > 0}
                                    voteStats={this.globalOptionStatic}
                                />
                            )
                    }
                </KeyboardAwareScrollView>
            </View>
        )
    }
}

const buttonWidthRatio = 0.2;
const buttonHeightRatio = 0.1;

const styles = StyleSheet.create({
    contentText: {
        marginVertical: 10,
        marginHorizontal: 10,
        textAlign: 'left',
        fontSize: 16,
        color: '#2c2c2c',
    },
    content: {
        //alignItems : 'center',
        justifyContent: 'center',
        borderColor: 'grey',
        borderStyle: null,
        borderWidth: 0.5,
        //marginVertical: 20,
        marginTop: 20,
    },
    detail: {
        margin: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    detailText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#2c2c2c',
    },
    publisherText: {
        textAlign: 'center',
        fontSize: 18,
        color: 'blue',
    },
    headerText: {
        fontWeight: '900',//字体粗细 加粗
        textAlign: 'center',
        fontSize: 22,
        color: '#2c2c2c',
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    submitButton: {
        flex: 1,
        height: (buttonHeightRatio * screenWidth),
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        backgroundColor: 'white',
        borderColor: '#0077FF',
        borderWidth: 1,
        borderRadius: 4,
    },
    submitText: {
        fontSize: 16,
        color: '#0077FF',
    },
    deleteButton: {
        flex: 1,
        height: buttonHeightRatio * screenWidth,
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        backgroundColor: 'white',
        borderColor: '#FD3B2F',
        borderWidth: 1,
        borderRadius: 4,
    },
    deleteText: {
        fontSize: 16,
        color: '#FD3B2F',
    },
    hasVotedView: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 50,
        alignItems: 'center',
    },
    hasVotedText: {
        fontSize: 16,
        color: '#0077FF',
    },
})

/*
1.获取投票内容：
请求方式：GET
请求地址：https://api.cnblogs.com/api/edu/vote/contents/{voteId}
Body参数名 类型  必需  描述  示例 e.g.
voteId  number  是   投票Id    1

返回
Body参数名 描述  类型
voteContentId   投票内容Id  number
title   内容标题    string
voteMode    模式（1.单选、2.多选、3.排名）  number
picture 图片链接    string
voteId  投票Id    number
voteOptions 投票选项列表  array
voteOptions.voteOptionId    投票选项Id  number
voteOptions.option  投票选项    string

2.参与投票；
请求方式：POST
请求地址：https://api.cnblogs.com/api/edu/vote/commit/{voteId}

Body示例：
{
    "schoolClassId": 1,
    "voteOptionIds": [ 3,5 ]
}

Body参数名 类型  必需  描述  示例 e.g.
voteId  number  是   投票Id
schoolClassId   number  是   操作人班级Id
voteOptionIds   array   是   投票选项Id列表

详细说明：
返回值“isWarning”为true时，则对应“message”字段中的内容
返回示例：
{
    "isSuccess": true,
    "isWarning": false,
    "isError": false,
    "message": null
}

3.根据博客Id获取成员信息

请求方式：GET

请求地址：https://api.cnblogs.com/api/edu/member/{blogId}/{schoolClassId}

Body参数名 类型  必需  描述  示例 e.g.
blogId  string  是   博客Id    10000
schoolClassId   string  是   班级Id    1
返回示例：

{
    "memberId": 60,
    "studentNo": "1513933002",
    "realName": "胡玲碧",
    "schoolClassId": 8,
    "membership": 1,
    "dateAdded": "2017-08-31T17:35:11.9467634"
}

Body参数名 描述  类型
memberId    成员Id    number
studentNo   学号  string
realName    真实姓名    string
schoolClassId   班级Id    number
membership  身份（1.学生、2.老师、3.助教）  number
dateAdded   创建时间    datetime

4.获取当前登录用户信息

请求方式：GET

请求地址：https://api.cnblogs.com/api/users

Header参数名   类型  必需  描述  示例 e.g.
Authorization   string  是       Bearer your access_token
详细说明：

获取当前登录用户信息
返回示例：

{
  "UserId": "4566ea6b-f2b3",
  "SpaceUserId": 2,
  "BlogId": 3,
  "DisplayName": "sample string 4",
  "Face": "sample string 5",
  "Avatar": "sample string 6",
  "Seniority": "sample string 7",
  "BlogApp": "sample string 8"
}

Body参数名 描述  类型
UserId  用户id    string
SpaceUserId 用户显示名称id    number
BlogId  博客id    number
DisplayName 显示名称    string
Face    头像url   string
Avatar  头像url   string
Seniority   园龄  string
BlogApp 博客名 string

5.判断是否参与投票

请求方式：GET

请求地址：https://api.cnblogs.com/api/edu/vote/iscommitted/{memberId}/{voteId}

Body参数名 类型  必需  描述  示例 e.g.
memberId    number  是   成员Id    1
voteId  number  是   投票Id    1
返回示例：

false

6.获取成员投票项

请求方式：GET

请求地址：https://api.cnblogs.com/api/edu/vote/committed/options/{memberId}/{voteId}

Body参数名 类型  必需  描述  示例 e.g.
memberId    number  是   成员Id    1
voteId  number  是   投票Id    1
返回示例：

{
    "1": [
        "一般，我会写好的"
    ]
}

Body参数名 描述  类型
1   投票内容Id  array

7.删除投票

请求方式：DELETE

请求地址：https://api.cnblogs.com/api/edu/vote/remove/{schoolClassId}/{voteId}

详细说明：
返回值“isWarning”为true时，则对应“message”字段中的内容
返回示例：
{
    "isSuccess": true,
    "isWarning": false,
    "isError": false,
    "message": null
}

*/


