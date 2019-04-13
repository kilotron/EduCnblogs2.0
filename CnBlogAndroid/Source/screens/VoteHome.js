//该页面是devote的主页面
//按照classSelect页面仿写
import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,UI} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {StorageKey} from '../config'


import {
	StyleSheet,
	Text,
	View,
	ToastAndroid,
	TouchableOpacity,
	Image,
	TextInput,
	ScrollView,
	TouchableHighlight,
	FlatList,
} from 'react-native';

import {
  StackNavigator,
  TabNavigator,
} from 'react-navigation';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
const pageSize = 12;

export default class VoteHome extends Component{
    constructor(props) {
        super(props);
        this.state = {
            currentPageIndex, //当前页面
            totalCount,
            votes: [],
            classId: this.props.classId,
            isEmpy: true, //初始认为请求未成功，不进行渲染，以防App崩溃
        }
    }

    getUrl(pageIndex){ //根据index获得对应page的信息
        let url = Config.VoteHome + '/' + this.state.classId + '/' + pageIndex + '-' + pageSize;
        return url;
    }

    componentWillMount() {
        let pageIndex = 1;
        Service.Get(this.getUrl(pageIndex))
        // 获取投票列表
        .then((jsonData) => {
            if (this._isMounted) {
                this.setState({votes: jsonData});
                if (jsonData !== 'rejected') {
                    this.setState({isEmpty: false});
                }
            }
        })
    }

    

    _renderItem() {

    }


    render() {
        return(
            <View>
                <Text>
                    你好
                </Text>
            </View>
        );


    }

}
