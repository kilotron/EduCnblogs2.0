import Config from '../config';
import api from '../api/api.js';
import { authData, err_info, StorageKey } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component } from 'react';
import {UI} from '../../Source/config';
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

import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import CheckBox from 'react-native-check-box';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

// 传入voteID作为参数
export default class VoteDetail extends Component {
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

            /**复选框是否选中的标记。根据参与投票的API，每个班级的voteOptionId是唯一的，
               那么，对某一个的投票来说，voteOptionId也是唯一的，因此，用voteOptionId作为
               复选框(也可作为单选框)的标识。一个isChecked的示例：
               [123: {isChecked: false, option: '单选选项1', exclusiveOptionIds: [124], indexOfThis: 0}, 
                124: {isChecked: true, option: '单选选项2', exclusiveOptionIds: [123], indexOfThis: 1},
                125: {isChecked: true, option: '复选选项1'},
                126: {isChecked: true, option: '复选选项2'},]，
               其中，123、124都是voteOptionId。
               isChecked：该选项是否选中，
               option：选项内容
               exclusiveOptionIds：一个单选题里的相互排斥的选项们，多选不需要该属性
               indexOfThis: 单选题中，选项的编号（从零开始） */
            isChecked: new Map(), 
        }
        /**每道题的所有选项ID为一组，用于检查是否完成所有问题。 
          例如[1: {ids: [123, 124], selectedIndex: 0, isRadioButton: true}, 
          2: {ids: [125,126], isRadioButton:false}]
          其中1、2是voteContentId,[123, 124]、[125, 126]是同一题目的所有选项voteOptionId
          selectedIndex是单选题中被选中选项的编号，从0开始，为null表示什么都没选中。*/
        this.buttonGroups = new Map();
    }

    /**此函数只在获取投票内容后调用一次，来初始化state isChecked。
     * 函数调用后，所有的选项都加入到this.state.isChecked中，可通过此变量获得
     * 被选中的选项。
     */
    _isCheckedInit() {
        for (var i in this.state.voteContent) {
            var voteOptions = this.state.voteContent[i].voteOptions;
            var isRadioButton = this.state.voteContent[i].voteMode == 1;// 是否为单选
            var voteContentId = this.state.voteContent[i].voteContentId;//题目ID
            var aButtonGroup = [];
            if (isRadioButton) {
                this.buttonGroups.set(voteContentId, {ids: aButtonGroup, selectedIndex: null, isRadioButton: true});
            } else {
                this.buttonGroups.set(voteContentId, {ids: aButtonGroup, isRadioButton: false});
            }
            var idx = 0;
            for (var j in voteOptions) {
                aButtonGroup.push(voteOptions[j].voteOptionId);
                var data = {};
                data.isChecked = false;
                data.option = voteOptions[j].option;
                data.voteOptionId = voteOptions[j].voteOptionId;
                this.state.isChecked.set(data.voteOptionId, data);
                if (isRadioButton) {
                    data.indexOfThis = idx;
                    // 将同一组的其他选项加入data.exclusiveOptionIds中
                    data.exclusiveOptionIds = [];
                    for (var k in voteOptions) {
                        if (voteOptions[k].voteOptionId != voteOptions[j].voteOptionId) {
                            data.exclusiveOptionIds.push(voteOptions[k].voteOptionId);
                        }
                    }
                }
                idx++;
            }
        }
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
            }
        })
        .then(() => {
            Service.Get(voteContentURL)
            .then((jsonData) => {
                if (jsonData !== 'rejected') {
                    if (this._isMounted) {
                        this.setState({voteContent: jsonData}, () => {
                            this._isCheckedInit();
                        });
                    }
                }
            })
            .catch((err) => {
                alert('error');
            })
        })
        .then(() => {
            this._getVoteState(); // 获取用户是否已经投票。
        })
        .catch((err)=>{});
    }

    componentDidMount = () => {
        //this._isMounted = true;
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    /**一道题的序号、标题和图片 */
    _renderItemHeader({item, index}) {
        return (
            <View style={styles.voteItemHeaderView}>
                <Text style={styles.voteItemTitleText}>{(index+1) + '. ' + item.title}</Text>
                {
                    item.picture == null ? (null) : (
                        <Image
                            style={styles.voteItemImage}
                            source={{uri:item.picture}}
                            resizeMode='contain'
                            alignSelf='center'
                        />
                    )
                }
            </View>
        );
    }

    /**voteOptionId是某个单选框的ID，同一组的其他选项isChecked被设置为false.
     */
    _uncheckOtherRadioButtonsInSameGroup(voteOptionId) {
        let option = this.state.isChecked.get(voteOptionId);
        // 单选框需要设置同一组的其他选项为未选中状态。
        if (option.isChecked && option.exclusiveOptionIds) {
            for (var i in option.exclusiveOptionIds) {
                id = option.exclusiveOptionIds[i];
                let exclusiveOption = this.state.isChecked.get(id);
                exclusiveOption.isChecked = false;
            }
        }
    }

    /**一个单选题 
     * 参数index从0开始。
     * item.voteMode: 投票模式
     * item.voteContentId: 题目编号
    */
    _renderVoteItem = ({item, index}) => {
        if (item.voteMode == 1) { // 单选，item是API返回的数据
            var selectedIndex = null;
            if (this.buttonGroups.get(parseInt(item.voteContentId))) {
                // 一开始this.buttonGroups可能还未初始化
                selectedIndex = this.buttonGroups.get(parseInt(item.voteContentId)).selectedIndex;
            }
            return (
                <View >
                    {this._renderItemHeader({item, index})}
                    <RadioGroup 
                        style={styles.voteRadioGroup}
                        size={18}                   // radio button的大小
                        thickness={2}
                        color='#666'                // 圆圈的颜色
                        highlightColor='#fdfdfd'    // 选中时的背景颜色
                        onSelect={(index, value) => {
                            // value是voteOptionId
                            var data = this.state.isChecked.get(value);
                            data.isChecked = true;
                            this._uncheckOtherRadioButtonsInSameGroup(value);
                        }}
                        selectedIndex={selectedIndex}
                    >
                        {this._renderRadioButtonItem(item.voteOptions)}
                    </RadioGroup>
                </View>
            );
        } else if (item.voteMode == 2) {    // 多选
            return (
                <View>
                    {this._renderItemHeader({item, index})}
                    <View style={styles.checkBoxesView}>
                        {this._renderCheckboxItems(item.voteOptions)}
                    </View>
                </View>
            )
        } else {
            alert('暂未实现的投票模式:'+item.title);
        }
    }

    /**一个单选框 */
    _renderRadioButtonItem = (voteOptions) => {
        result = [];
        for (var i in voteOptions) {
            let voteOptionId = voteOptions[i].voteOptionId;
            result.push(
                <RadioButton 
                    value={voteOptionId} 
                    key={voteOptionId}
                    style={styles.voteRadioButton}
                    disabled={this.state.hasVoted} // 已经投票过则不能更改选项。
                >
                    <Text style={styles.voteRadioButtonText}>{voteOptions[i].option}</Text>
                </RadioButton>
            );
        }
        return result;
    }

    /**一组复选框项
     * voteOptions是一个数组，每个元素是一个选项
     * voteOptions[i].voteOptionId：选项ID
     * voteOptions[i].option:选项内容
     */
    _renderCheckboxItems = (voteOptions) => {
        result = [];
        for (var i in voteOptions) {
            var data = this.state.isChecked.get(voteOptions[i].voteOptionId);
            if (!data) {    // 没有这个voteOptionId时添加一个初始值
                data = {};
                data.isChecked = false;
                data.option = voteOptions[i].option;
                data.voteOptionId = voteOptions[i].voteOptionId;
                this.state.isChecked.set(data.voteOptionId, data);
            }
            result.push(
                this._renderACheckBox(data)
            );
        }
        return result;
    }

    /**一个复选选框项。
     * data需要是this.state.isChecked的一个元素。
     * data.voteOptionId: 选项ID
     * data.option: 选项内容
     * data.isChecked: 是否选中。
     */
    _renderACheckBox(data) {
        return (
            <CheckBox 
                key={data.voteOptionId}
                rightText={data.option} 
                rightTextStyle={this.state.hasVoted ? styles.voteCheckBoxTextDisabled 
                    : styles.voteCheckBoxText}
                onClick={() => {
                    data.isChecked = !data.isChecked;
                    if (this._isMounted) {
                        this.setState({
                            isChecked: this.state.isChecked,
                        })
                    }
                }}
                style={styles.voteCheckBox}
                checkBoxColor={this.state.hasVoted ? '#CCC': '#666'}
                isChecked={data.isChecked}
                disabled={this.state.hasVoted}
            />
        )
    }

    /**所有的投票内容 */
    _renderVoteContent() {
        return (
            <View style={{flex:1}}>
                <FlatList
                    renderItem={this._renderVoteItem}
                    data={this.state.voteContent}
                    /* 添加extraData属性保证复选框被点击时FlatList更新。复选框被点击时改变了
                       this.state.isChecked，但未改变this.state.voteContent，所以如果没有
                       extraData属性，FlatList不会更新。 */
                    extraData={this.state}  
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={this._renderSubmitButton.bind(this)}
                    ListHeaderComponent={this._renderHasVotedBanner.bind(this)}
                />
            </View>
        );
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

    /**调试用 */
    _debugOptions() {
        var s = '';
        this.state.isChecked.forEach(function (value, key, map){
            s = s + 'key: ' + key + ', ' + value.option + ', ' + value.isChecked + '\n' ;
            if (value.exclusiveOptionIds) {
                s = s + 'exclude: ';
                for (var i in value.exclusiveOptionIds) {
                    s = s+value.exclusiveOptionIds[i]+' ';
                }
                s+='\n';
            }
        });
        alert(s+this._validateVoteOptions());
    }

    /**点击提交按钮调用此函数提交问卷。 */
    _submit() {
        if (!this._validateVoteOptions()) {
            Alert.alert('提示', '请完成所有投票内容');
            return;
        }
        var commitURL = Config.VoteCommit + this.state.voteId;
        var ids = [];
        this.state.isChecked.forEach(function(value, key, map){
            if (value.isChecked) {
                ids.push(key);
            }
        });
        var postBody = {
            schoolClassId: this.state.schoolClassId,
            voteOptionIds: ids,
        }
        postBody = JSON.stringify(postBody);
        Service.UserAction(commitURL, postBody, 'POST')
        .then((response) => {
            if (response === 'rejected') {
                return null; // 提示信息由UserAction输出
            }
            if(response.status!==200){
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
            } else  { // if (jsonData.isError)
                Alert.alert('错误', '投票失败');
            }
        })
        .catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET ,ToastAndroid.SHORT);
        });
    }

    /**完成了问卷所有内容则返回true。 */
    _validateVoteOptions() {
        var complete = true;

        this.buttonGroups.forEach((value, key, map) => {
            // key是voteContentId。
            buttons = value.ids;
            var thisButtonGrouphasOneChecked = false;
            for (var j in buttons) {
                data = this.state.isChecked.get(buttons[j]);
                thisButtonGrouphasOneChecked = thisButtonGrouphasOneChecked || data.isChecked;
            }
            complete = complete && thisButtonGrouphasOneChecked;
        });

        return complete;
    }

    /**判断用户是否已经投票过了。是则设置this.state.hasVoted=true,并设置this.state.isChecked */
    _getVoteState() {
        let user_url = Config.apiDomain + api.user.info;
        var memberId = -1;
        Service.Get(user_url)
        .then((jsonData) => {
            var memberIdURL = Config.apiDomain + api.ClassGet.blogID2Mem + 
            jsonData.BlogId + '/' + this.state.schoolClassId;
            return Service.Get(memberIdURL)
        })
        .then((jsonData) => {
            memberId = jsonData.memberId;
            var voteIsCommitedURL = Config.VoteIsCommited + memberId +
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
            for (var voteContentId in jsonData) {
                // jsonData[voteContentId]是投票选项的数组
                var selectedOptions = jsonData[voteContentId];
                var allOptions = this.buttonGroups.get(parseInt(voteContentId)).ids;
                var isRadioButton = this.buttonGroups.get(parseInt(voteContentId)).isRadioButton;
                for (var i in selectedOptions) {
                    var selectedContent = selectedOptions[i];
                    for (var j in allOptions) {
                        var voteOptionId = allOptions[j];
                        var voteContent = this.state.isChecked.get(voteOptionId).option;
                        if (selectedContent == voteContent) {   // 已选中此项
                            this.state.isChecked.get(voteOptionId).isChecked = true;
                            if (isRadioButton) { // 单选框设置选中选项
                                // 这里voteOptionId是被选中选项。
                                this.buttonGroups.get(parseInt(voteContentId)).selectedIndex = this.state.isChecked.get(voteOptionId).indexOfThis;
                            }
                        }
                    }
                }
            }
            if (this._isMounted) {
                this.setState({
                    isChecked: this.state.isChecked,
                });
            }
        })
        .catch(error => {});      
    }

    DateFormat = (date) => {
        if (date == null)
            return null;
        let s1 = date.split('T')[0];
        let s2 = date.split('T')[1].split('.')[0];
        return (s1 + '  ' + s2);
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor: 'white'}}>
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
                    <View style={styles.content}>
                        <Text style={styles.contentText}>
                            {this.state.content}
                        </Text>
                    </View>
                </View>
                {this._renderVoteContent()}
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
        justifyContent:'flex-start',
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
    voteItemHeaderView: {
        marginHorizontal: 15,
        marginTop: 5
    },
    voteItemTitleText: {
        fontSize: 16, 
        color: '#444'
    },
    voteItemImage: {
        width: 200, 
        height: 100, 
        marginTop: 10
    },
    voteRadioGroup: {
        marginHorizontal: 15, 
        marginVertical: 10
    },
    checkBoxesView: {
        marginHorizontal: 15, 
        marginVertical: 10
    },
    voteRadioButton: {
        padding: 5, 
        marginHorizontal: 10, 
        marginVertical: 2
    },
    voteRadioButtonText: {
        fontSize: 15, 
        color: '#555', 
        marginLeft: 5
    },
    voteCheckBoxText: {
        fontSize: 15, 
        color: '#555', 
        marginLeft: 5
    },
    voteCheckBoxTextDisabled: {
        fontSize: 15, 
        color: '#BBB', 
        marginLeft: 5
    },
    voteCheckBox: {
        padding: 2, 
        marginHorizontal: 10, 
        marginVertical: 2
    },
    submitButton: {
        flex: 1,
        height: buttonHeightRatio*screenWidth,
        width: buttonWidthRatio*screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: (1-buttonWidthRatio)/2*screenWidth, //居中
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
        marginHorizontal:50,
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