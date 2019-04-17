import Config from '../config';
import api from '../api/api.js';
import { authData, err_info, StorageKey } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component } from 'react';
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

            /* 复选框是否选中的标记。查看参与投票的API发现，每个班级的voteOptionId是唯一的，
               那么，对某一个的投票来说，voteOptionId也是唯一的，因此，用voteOptionId作为
               复选框(也可作为单选框)的标识。一个isChecked的示例：
               [123: {isChecked: true, option: '选项1'}, 
                124: {isChecked: true, option: '选项2'}] */
            isChecked: new Map(), 
        }
    }

    /**此函数只在获取投票内容后调用一次，来初始化state isChecked。
     * 函数调用后，所有的选项都加入到this.state.isChecked中，可通过此变量获得
     * 被选中的选项。
     */
    _isCheckedInit() {
        for (var i in this.state.voteContent) {
            voteOptions = this.state.voteContent[i].voteOptions;
            for (var j in voteOptions) {
                var data = {};
                data.isChecked = false;
                data.option = voteOptions[j].option;
                data.voteOptionId = voteOptions[j].voteOptionId;
                this.state.isChecked.set(data.voteOptionId, data);
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

    componentDidMount() {
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

    /**一个单选题 
     * 参数index从0开始。
    */
    _renderVoteItem = ({item, index}) => {
        if (item.voteMode == 1) { //单选
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
                            /* !!! 这是一个待解决的问题。
                                此处，radiobutton被选中的状态是不一致的，
                                还不能通过this.state.isChecked获得radiobutton是否被选中。
                                因为切换选项时，没有把原来的被选的选项的isChecked设为false。*/
                            data.isChecked = true;
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

    /**一组复选框项 */
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

    _renderVoteContent() {
        return (
            <View style={{flex:2}}>
                <FlatList
                    renderItem={this._renderVoteItem}
                    data={this.state.voteContent}
                    /* 添加extraData属性保证复选框被点击时FlatList更新。复选框被点击时改变了
                       this.state.isChecked，但未改变this.state.voteContent，所以如果没有
                       extraData属性，FlatList不会更新。 */
                    extraData={this.state}  
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        );
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
                <View
                    style={{
                        alignSelf: 'stretch',
                        flex: 1,
                    }}
                >
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
        borderColor: '#dddddd',
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
})
