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

import FoldText from "react-native-fold-text";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;

// 传入voteID作为参数
export default class VoteDetail extends Component {
    /**navigationOptions放在此处，可以在标题栏放一个按钮跳转到另一个页面。 */
    static navigationOptions = ({ navigation }) => ({
        headerTintColor: 'white',
        headerTitle: '投票详情',
        headerStyle: {
            height: 40,
            backgroundColor: UI.TOP_COLOR,
        },
        headerTitleStyle: {
            fontSize: 18,
        },
        headerRight: (
            <TouchableOpacity onPress={() => {
                navigation.navigate('VoteMemberList', {
                    schoolClassId: navigation.state.params.schoolClassId,
                    voteId: navigation.state.params.voteId,
                });
            }}>
                <Image
                    source={require('../images/nav_i.png')}
                    style={{
                        height: 22,
                        width: 22,
                        marginRight: 12
                    }}
                />
            </TouchableOpacity>
        ),
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
            voteCount: "",
            blogUrl: "", //发布者的blog
            publisher: "",
            publisherId: "",
            schoolClassId: "",
            deadline: null,
            dateAdded: null,
            isFinished: "",

            /**是否已经投票 */
            hasVoted: undefined,

            /* 每一个投票的题目和选项、图片等信息。*/
            voteContent: [],

            voteData: [],   // 传递给Vote组件的数据

        }
        this.selectedIds = [],
        this.info = {};
        this.info.complete = false;
        this.info.unselectedNumbers = '所有';
        this.info.selectedNumbers = '';
    }

    _isMounted;

    componentWillMount = () => {
        this._isMounted = true;
        let contenturl = Config.VoteDetail + this.state.voteId;
        let voteContentURL = Config.VoteContent + this.state.voteId;

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
                        publisherId: jsonData.publisherId,
                        schoolClassId: jsonData.schoolClassId,
                        deadline: jsonData.deadline,
                        dateAdded: jsonData.dateAdded,
                        isFinished: jsonData.isFinished,
                    })
                }
                // 为显示投票成员设置
                this.props.navigation.setParams({ schoolClassId: jsonData.schoolClassId });
            }
        })
        .then(() => {
            Service.Get(voteContentURL)
            .then((jsonData) => {
                if (jsonData !== 'rejected') {
                    if (this._isMounted) {
                        this.setState({voteContent: jsonData});
                        this.setState({voteData: this.extractData(jsonData)});
                    }
                }
            })
            .then(() => {
                this._getVoteState(); // 获取用户是否已经投票。
            })
            .catch((err) => {
                alert('error');
            })
        })
        .catch((err)=>{alert('error')});
    }

    componentDidMount = () => {
        //this._isMounted = true;
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    extractData(voteContent) {
        let result = [];
        let cnt = 1;    // 题目序号
        for (let i in voteContent) {
            let vote = {};
            vote.serialNumber = cnt;
            if (voteContent[i].voteMode == 1) {
                vote.type = 'Single';
            } else if (voteContent[i].voteMode == 2) {
                vote.type = 'Multiple';
            } else {
                alert('未实现的投票模式');
                return result;
            }
            vote.title = voteContent[i].title;
            vote.imageSource = voteContent[i].picture;
            vote.options = [];
            for (let j in voteContent[i].voteOptions) {
                let option = {};
                option.id = voteContent[i].voteOptions[j].voteOptionId;
                option.text = voteContent[i].voteOptions[j].option;
                option.selected = false;
                vote.options.push(option);
            }
            vote.contentId = voteContent[i].voteContentId;
            result.push(vote);
            cnt++;
        }
        return result;
    }

    _renderSubmitButton() {
        if (this.state.hasVoted == false) {
            return (
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={this._submit.bind(this)}
                >
                    <Text style={styles.submitText}>
                        提交
                    </Text>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    }

    _renderHasVotedBanner() {
        if (this.state.hasVoted) {
            return (
                <View style={styles.hasVotedView}>
                    <Text style={styles.hasVotedText}>已经投过票了</Text>
                </View>
            )
        }
        return null;
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
        let memberId = -1;
        let data = this.extractData(this.state.voteContent);
        Service.Get(user_url)
        .then((jsonData) => {
            var memberIdURL = Config.apiDomain + api.ClassGet.blogID2Mem + 
            jsonData.BlogId + '/' + this.state.schoolClassId;
            return Service.Get(memberIdURL)
        })
        .then((jsonData) => {
            memberId = jsonData.memberId;
            let voteIsCommitedURL = Config.VoteIsCommited + memberId +
                    '/' + this.state.voteId;
             return Service.Get(voteIsCommitedURL)
        })
        .then((_hasVoted) => {
            if (this._isMounted) {
                this.setState({
                    hasVoted: _hasVoted,
                })
            }
            if (!_hasVoted) {
                return null;
            }
            // 获取投票选项
            let committedOptionsURL = Config.VoteCommittedOptions + memberId + 
                '/' + this.state.voteId;
            return Service.Get(committedOptionsURL)
        })
        .then((jsonData) => {
            if (jsonData == null) {
                return; // 没有投票
            }
            for (let voteContentId in jsonData) {
                let selectedOptionsText = jsonData[voteContentId];
                for (let i in data) { // data是转换后的，可以提供给Vote组件的数据
                    if (voteContentId != data[i].contentId) {
                        continue;
                    }
                    // 对于相同的题目
                    let options = data[i].options;
                    for (let j in options) {
                        for (let k in selectedOptionsText) {
                            // 如果某个选项被选中
                            if (selectedOptionsText[k] == options[j].text) {
                                // 则设置其selected为true
                                options[j].selected = true;
                            }
                        }
                    }
                }
            }
            if (this._isMounted) {
                this.setState({voteData: data});
            }
        })
        .catch(error => {});
        
        return data;
    }

    DateFormat = (date) => {
        if (date == null)
            return null;
        let s1 = date.split('T')[0];
        let s2 = date.split('T')[1].split('.')[0];
        return (s1 + '  ' + s2);
    }

    render() {
        if(this.state.content!="")
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <KeyboardAwareScrollView>
                    {/** header组件 */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {this.state.name}
                        </Text>
                    </View>

                    {/** detail组件 */}
                    {/** 用于存放如publisher和privacy等信息 */}
                    <View style={styles.detail}>
                        <Text style={styles.publisherText} >
                            {this.state.publisher + '\n'}
                        </Text>
                        <Text style={styles.detailText} >
                            {'发布于: ' + this.DateFormat(this.state.dateAdded) + '\n'}
                            {'结束于: ' + this.DateFormat(this.state.deadline) + '\n'}
                            {this.state.privacy == 1 ? '公开投票' : '匿名投票'}
                        </Text>
                    </View>

                    {/** content组件 */}

                    <View style={styles.content}>
                            <FoldText
                                //HTMLSpecialCharsDecode(this.state.content)
                                maxLines={5} //
                                text={HTMLSpecialCharsDecode(this.state.content)}
                            />
                    </View>

                    <Vote
                        data={this.state.voteData}
                        recvSelectedIds={(ids, info) => {
                            this.selectedIds = ids;
                            this.info = info;
                        }}
                        headerComponent={this._renderHasVotedBanner.bind(this)}
                        footerComponent={this._renderSubmitButton.bind(this)}
                        disabled={this.state.hasVoted}
                    />
                </KeyboardAwareScrollView>
            </View>
        )
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View>
                    {/** header组件 */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {this.state.name}
                        </Text>
                    </View>

                    {/** detail组件 */}
                    {/** 用于存放如publisher和privacy等信息 */}
                    <View style={styles.detail}>
                        <Text style={styles.publisherText} >
                            {this.state.publisher + '\n'}
                        </Text>
                        <Text style={styles.detailText} >
                            {'发布于: ' + this.DateFormat(this.state.dateAdded) + '\n'}
                            {'结束于: ' + this.DateFormat(this.state.deadline) + '\n'}
                            {this.state.privacy == 1 ? '公开投票' : '匿名投票'}
                        </Text>
                    </View>

                    {/** content组件 */}
                </View>
                <Vote
                    data={this.state.voteData}
                    recvSelectedIds={(ids, info) => {
                        this.selectedIds = ids;
                        this.info = info;
                    }}
                    headerComponent={this._renderHasVotedBanner.bind(this)}
                    footerComponent={this._renderSubmitButton.bind(this)}
                    disabled={this.state.hasVoted}
                />
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
        justifyContent: 'flex-start',
        borderColor: UI.TOP_COLOR,
        borderStyle: null,
        borderWidth: 0.5,
        marginTop: 20,
    },
    detail: {
        margin: 20,
        height: 60,
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
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitButton: {
        flex: 1,
        height: buttonHeightRatio * screenWidth,
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        backgroundColor: 'white',
        borderColor: '#0077FF',
        borderWidth: 0.5,
        borderRadius: 4,
    },
    submitText: {
        fontSize: 16,
        color: '#0077FF',
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
Body参数名	类型	必需	描述	示例 e.g.
voteId	number	是	投票Id	1

返回
Body参数名	描述	类型
voteContentId	投票内容Id	number
title	内容标题	string
voteMode	模式（1.单选、2.多选、3.排名）	number
picture	图片链接	string
voteId	投票Id	number
voteOptions	投票选项列表	array
voteOptions.voteOptionId	投票选项Id	number
voteOptions.option	投票选项	string

2.参与投票；
请求方式：POST
请求地址：https://api.cnblogs.com/api/edu/vote/commit/{voteId}

Body示例：
{
    "schoolClassId": 1,
    "voteOptionIds": [ 3,5 ]
}

Body参数名	类型	必需	描述	示例 e.g.
voteId	number	是	投票Id
schoolClassId	number	是	操作人班级Id
voteOptionIds	array	是	投票选项Id列表

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

Body参数名	类型	必需	描述	示例 e.g.
blogId	string	是	博客Id	10000
schoolClassId	string	是	班级Id	1
返回示例：

{
    "memberId": 60,
    "studentNo": "1513933002",
    "realName": "胡玲碧",
    "schoolClassId": 8,
    "membership": 1,
    "dateAdded": "2017-08-31T17:35:11.9467634"
}

Body参数名	描述	类型
memberId	成员Id	number
studentNo	学号	string
realName	真实姓名	string
schoolClassId	班级Id	number
membership	身份（1.学生、2.老师、3.助教）	number
dateAdded	创建时间	datetime

4.获取当前登录用户信息

请求方式：GET

请求地址：https://api.cnblogs.com/api/users

Header参数名	类型	必需	描述	示例 e.g.
Authorization	string	是		Bearer your access_token
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

Body参数名	描述	类型
UserId	用户id	string
SpaceUserId	用户显示名称id	number
BlogId	博客id	number
DisplayName	显示名称	string
Face	头像url	string
Avatar	头像url	string
Seniority	园龄	string
BlogApp	博客名	string

5.判断是否参与投票

请求方式：GET

请求地址：https://api.cnblogs.com/api/edu/vote/iscommitted/{memberId}/{voteId}

Body参数名	类型	必需	描述	示例 e.g.
memberId	number	是	成员Id	1
voteId	number	是	投票Id	1
返回示例：

false

6.获取成员投票项

请求方式：GET

请求地址：https://api.cnblogs.com/api/edu/vote/committed/options/{memberId}/{voteId}

Body参数名	类型	必需	描述	示例 e.g.
memberId	number	是	成员Id	1
voteId	number	是	投票Id	1
返回示例：

{
    "1": [
        "一般，我会写好的"
    ]
}

Body参数名	描述	类型
1	投票内容Id	array

*/