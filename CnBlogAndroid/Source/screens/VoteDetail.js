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
            
            /* 每一个投票的题目和选项、图片等信息。*/
            voteContent: [],

            /* 复选框是否选中的标记。根据参与投票的API，每个班级的voteOptionId是唯一的，
               那么，对某一个的投票来说，voteOptionId也是唯一的，因此，用voteOptionId作为
               复选框(也可作为单选框)的标识。一个isChecked的示例：
               [123: {isChecked: false, option: '单选选项1', exclusiveOptionIds: [124]}, 
                124: {isChecked: true, option: '单选选项2', exclusiveOptionIds: [123]},
                125: {isChecked: true, option: '复选选项1'},
                126: {isChecked: true, option: '复选选项2'},]，
               其中，123、124都是voteOptionId。
               isChecked：该选项是否选中，
               option：选项内容
               exclusiveOptionIds：一个单选题里的相互排斥的选项们，多选不需要该属性。 */
            isChecked: new Map(), 
        }
        /*每道题的所有选项ID为一组，用于检查是否完成所有问题。 例如[[123, 124], [125,126]]*/
        this.buttonGroups = [];
    }

    /**此函数只在获取投票内容后调用一次，来初始化state isChecked。
     * 函数调用后，所有的选项都加入到this.state.isChecked中，可通过此变量获得
     * 被选中的选项。
     */
    _isCheckedInit() {
        for (var i in this.state.voteContent) {
            voteOptions = this.state.voteContent[i].voteOptions;
            isRadioButton = this.state.voteContent[i].voteMode == 1;// 是否为单选
            var aButtonGroup = [];
            this.buttonGroups.push(aButtonGroup);
            for (var j in voteOptions) {
                aButtonGroup.push(voteOptions[j].voteOptionId);
                var data = {};
                data.isChecked = false;
                data.option = voteOptions[j].option;
                data.voteOptionId = voteOptions[j].voteOptionId;
                this.state.isChecked.set(data.voteOptionId, data);
                if (isRadioButton) {
                    // 将同一组的其他选项加入data.exclusiveOptionIds中
                    data.exclusiveOptionIds = [];
                    for (var k in voteOptions) {
                        if (voteOptions[k].voteOptionId != voteOptions[j].voteOptionId) {
                            data.exclusiveOptionIds.push(voteOptions[k].voteOptionId);
                        }
                    }
                }
            }
        }
    }

    _isMounted;

    componentWillMount = () => {
        this._isMounted = true;
        let contenturl = Config.VoteDetail + this.state.voteId;
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
        .catch((err)=>{});

        let voteContentURL = Config.VoteContent + this.state.voteId;
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
    */
    _renderVoteItem = ({item, index}) => {
        if (item.voteMode == 1) { // 单选，item是API返回的数据
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
                rightTextStyle={styles.voteCheckBoxText}
                onClick={() => {
                    data.isChecked = !data.isChecked;
                    this.setState({
                        isChecked: this.state.isChecked,
                    })
                }}
                style={styles.voteCheckBox}
                checkBoxColor='#666'
                isChecked={data.isChecked}
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
                />
            </View>
        );
    }

    _renderSubmitButton() {
        return (
            <TouchableOpacity
                style={styles.submitButton}
                onPress={this._submit.bind(this)}
            >
                <Text style={styles.submitText}>提交</Text>
            </TouchableOpacity>
        )
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

        for (var i in this.buttonGroups) {
            buttons = this.buttonGroups[i];
            var thisButtonGrouphasOneChecked = false;
            for (var j in buttons) {
                data = this.state.isChecked.get(buttons[j]);
                thisButtonGrouphasOneChecked = thisButtonGrouphasOneChecked || data.isChecked;
            }
            complete = complete && thisButtonGrouphasOneChecked;
        }
        return complete;
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
    }
})

/*
获取投票内容：
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

参与投票；
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
*/