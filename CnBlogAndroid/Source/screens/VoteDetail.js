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
            deadline: "",
            dateAdded: "",
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
                    this.setState({voteContent: jsonData});
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
    _renderItemHeader({item, index}) {
        return (
            <View>
                <Text>{(index+1) + '. ' + item.title}</Text>
                {
                    item.picture == null ? (null) : (
                        <Image
                            style={{width: 200, height: 100}}
                            source={{uri:item.picture}}
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
    _renderVoteItem = ({item, index}) => {
        if (item.voteMode == 1) { //单选
            return (
                <View>
                    {this._renderItemHeader({item, index})}
                    <RadioGroup>
                        {this._renderRadioButtonItem(item.voteOptions)}
                    </RadioGroup>
                </View>
            );
        } else if (item.voteMode == 2) {    // 多选
            return (
                <View>
                    {this._renderItemHeader({item, index})}
                    {this._renderCheckboxItem(item.voteOptions)}
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
            result.push(
                <RadioButton value={voteOptions[i].voteOptionId}>
                    <Text>{voteOptions[i].option}</Text>
                </RadioButton>
            );
        }
        return result;
    }

    _renderCheckboxItem = (voteOptions) => {
        result = [];
        for (var i in voteOptions) {
            result.push(
                <CheckBox rightText={voteOptions[i].option} onClick={()=>{ }}/>
            );
        }
        return result;
    }

    _renderVoteContent() {
        return (
            <View>
                <FlatList
                    renderItem={this._renderVoteItem}
                    data={this.state.voteContent}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        );
    }

    render() {
        return (
            <View >
                {this._renderVoteContent()}
                <Text>1213</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
