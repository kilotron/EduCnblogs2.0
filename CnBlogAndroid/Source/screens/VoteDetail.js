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
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    render() {
        return (
            <View style={styles.container}>
                <View
                    style={{
                        alignSelf: 'stretch',
                        flex: 1,
                    }}
                >
                    <WebView
                        style={{ height: height - 70 }}
                        startInLoadingState={true}
                        domStorageEnabled={true}
                        javaScriptEnabled={true}
                        scalesPageToFit={true}
                        onError={() => Alert.alert('网络异常，请稍后再试！')}
                    />
                </View>
                <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)', alignSelf: 'stretch' }} />
                <View>
                    <Text>
                        {this.state.name}
                        {this.state.content}
                        {this.state.isFinished.toString}
                    </Text>
                </View>
            </View>
        )
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
