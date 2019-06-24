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
    Image,
    TextInput,
    Button,
    ToastAndroid,
    TouchableOpacity,
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
import { Icon, Fab } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getHeaderStyle } from '../styles/theme-context';
const screenHeight = MyAdapter.screenHeight;
const ContentHandler = require('../DataHandler/BlogDetail/ContentHandler');
const screenWidth= MyAdapter.screenWidth;
export default class BlogBookmarks extends Component {

    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })

    constructor(props) {
        super(props);
        this.state = {
            blogUrl: this.props.navigation.state.params.Url,
            blogTitle: this.props.navigation.state.params.Title,
            tagsContent: '',
            summary: this.props.navigation.state.params.Description,
        }
    }
    _isMounted;

    componentWillUnmount = () => {
        this._isMounted = false;
    }
    _onPress = () => {
        /* 首先检查是否已加入收藏 */

        /* 然后添加收藏 */
        this._addBookmarks();
    }

    _addBookmarks() {
        let tagsContent = this.state.tagsContent.toString().replace(/，/g, ',');
        tagsContent = tagsContent.replace(/ /g, '');
        while (tagsContent.indexOf(',,') > -1) {
            tagsContent = tagsContent.replace(/,,/g, ',');
        }
        const postBody = {
            WzLinkId: 1,
            Title: this.state.blogTitle,
            LinkUrl: this.state.blogUrl,
            Summary: this.state.summary,
            Tags: tagsContent.split(','),
        };
        const body = JSON.stringify(postBody);
        const url = Config.Bookmarks + '/';
        Service.UserAction(url, body, 'POST').then((jsonData) => {
            if (jsonData === null) {
                ToastAndroid.show('请求失败！', ToastAndroid.SHORT);
            }
            else if (jsonData.ok) {
                ToastAndroid.show('添加成功！', ToastAndroid.SHORT);
            }
            else if (jsonData._bodyText === '网摘已经收藏') {
                ToastAndroid.show('网摘已经收藏！', ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('发生错误，请稍后重试！', ToastAndroid.SHORT);
            }
            this.props.navigation.goBack();
        }).catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET, ToastAndroid.SHORT);
            this.props.navigation.goBack();
        });
    }

    render() {
        return (
            <KeyboardAwareScrollView>
                <View style={styles.container}>
                    <View style={styles.titleView}>
                        <Text style={styles.promptText}>网址</Text>
                        <TextInput style={styles.titleInput}
                            defaultValue={this.props.navigation.state.params.Url}
                            editable={false}>
                        </TextInput>
                    </View>
                    <View style={styles.divisionView}></View>
                    <View style={styles.titleView}>
                        <Text style={styles.promptText}>标题</Text>
                        <TextInput style={styles.titleInput}
                            defaultValue={this.props.navigation.state.params.Title}
                            onChangeText={(text) => { this.setState({ blogTitle: text }); }}>
                        </TextInput>
                    </View>
                    <View style={styles.divisionView}></View>
                    <View style={styles.tagsView}>
                        <Text style={styles.promptText}>标签</Text>
                        <TextInput style={styles.tagsInput}
                            defaultValue={this.state.tagsContent}
                            maxLength={40}
                            onChangeText={(text) => { this.setState({ tagsContent: text }); }}>
                        </TextInput>
                    </View>
                    <View style={styles.divisionView}></View>
                    <View style={styles.summaryView}>
                        <Text style={styles.promptText}>摘要</Text>
                        <TextInput style={styles.summaryInput}
                            defaultValue={this.state.summary}
                            multiline={true}
                            maxLength={195}
                            onChangeText={(text) => { this.setState({ summary: text }); }}>
                        </TextInput>
                    </View>
                    <View style={styles.divisionView}></View>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: global.theme.buttonColor }, { borderColor: global.theme.buttonBorderColor }]}
                        onPress={this._onPress}
                    >
                        <Text style={[styles.submitText, { color: global.theme.buttonTextColor }]}>
                            添加收藏
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const buttonWidthRatio = 0.2;
const buttonHeightRatio = 0.1;

const styles = StyleSheet.create({
    submitText: {
        fontSize: 16,
        //color: constButtonTextColor, //待处理，这里不对
    },
    submitButton: {
        //flex: 1,
        height: buttonHeightRatio * screenWidth,
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf:'center',
        marginTop: 10,
        marginBottom: 20,
        //marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        //backgroundColor: constButtonBGColor,
        //borderColor: constButtonBorderColor,
        borderWidth: 0.5,
        borderRadius: 4,
    },
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        height: screenHeight * 0.6,
    },
    titleView: {
        flex: 1,
    },
    tagsView: {
        flex: 1,
    },
    summaryView: {
        flex: 5,
    },
    divisionView: {
        height: 10,
    },
    commitBtn: {
        flex: 1,
    },
    promptText: {
        fontSize: 12,
        color: 'gray',
        left: 4,
    },
    titleInput: {
        borderColor: 'gray',
        borderRadius: 10
    },
    tagsInput: {
        borderColor: 'gray',
        borderRadius: 10,
    },
    summaryInput: {
        flex: 1,
        borderColor: 'gray',
        textAlignVertical: 'top',
        borderRadius: 10
    },
})
