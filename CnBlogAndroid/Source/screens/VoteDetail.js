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
    Dimensions,
    WebView,
    Image,
    Alert
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
import { Icon, Fab } from 'native-base';
import ShareButton from './Share';
const { height, width } = Dimensions.get('window');

import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
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

            voteContent: [],
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
        });

        let voteContentURL = Config.VoteContent + this.state.voteId;
        Service.Get(voteContentURL)
            .then((jsonData) => {
                if (jsonData !== 'rejected') {
                    if (this._isMounted) {
                        this.setState({ voteContent: jsonData });
                    }
                }
                //alert(jsonData);
            })
            .catch((err) => {
                alert('error');
            })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    /**一道题的序号、标题和图片 */
    _renderItemHeader({ item, index }) {
        return (
            <View>
                <Text>{(index + 1) + '. ' + item.title}</Text>
                {
                    item.picture == null ? (null) : (
                        <Image
                            style={{ width: 200, height: 100 }}
                            source={{ uri: item.picture }}
                            resizeMode='contain'
                        />
                    )
                }
            </View>
        );
    }

    /**一个单选题 
     * 参数index从0开始。
    */
    _renderVoteItem = ({ item, index }) => {
        if (item.voteMode == 1) { //单选
            return (
                <View>
                    {this._renderItemHeader({ item, index })}
                    <RadioGroup>
                        {this._renderRadioButtonItem(item.voteOptions)}
                    </RadioGroup>
                </View>
            );
        } else if (item.voteMode == 2) {    // 多选
            return (
                <View>
                    {this._renderItemHeader({ item, index })}
                    {this._renderCheckboxItem(item.voteOptions)}


                </View>
            )
        } else {
            alert('暂未实现的投票模式:' + item.title);
        }
    }

    /**一个单选框 */
    _renderRadioButtonItem = (voteOptions) => {
        result = [];
        for (var i in voteOptions) {
            result.push(
                <RadioButton value={voteOptions[i].voteOptionId}>
                    <Text>{voteOptions[i].option}</Text>
                </RadioButton>
            );
        }
        return result;
    }

    /**一个复选框 */
    _renderCheckboxItem = (voteOptions) => {
        result = [];
        for (var i in voteOptions) {
            result.push(
                <CheckBox rightText={voteOptions[i].option} onClick={() => { }} />
            );
        }
        return result;
    }

    _renderVoteContent() {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    renderItem={this._renderVoteItem}
                    data={this.state.voteContent}
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
                            {'发布于:' + this.DateFormat(this.state.dateAdded) + '\n'}
                            {'结束于:' + this.DateFormat(this.state.deadline) + '\n'}
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
        fontSize: 18,
        color: '#2c2c2c',
    },
    content: {
        justifyContent: 'flex-start',
        borderColor: 'blue',
        borderStyle: null,
        borderWidth: 0.5,
        marginTop: 20,
        color: 'black',
        fontSize: 20,
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
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        flex: 1,
        alignSelf: 'stretch',
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: height / 14,
        width: width,
        backgroundColor: 'white'
    },
    touchbutton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: height / 14,
        height: height / 14,
    },
    imagestyle: {
        width: height / 18,
        height: height / 22,
        resizeMode: 'stretch',
    }
})
