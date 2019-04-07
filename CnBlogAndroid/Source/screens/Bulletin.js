import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import * as storage from '../Storage/storage.js'
import {StorageKey} from '../config'
import {UI} from '../config'
import {err_info} from '../config'

import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    FlatList,
} from 'react-native';

import {
    StackNavigator,
    TabNavigator,
    NavigationActions,
} from 'react-navigation';

export default class Bulletin extends Component {
    constructor(props){
        super(props);
        this.state = {
            // todo
            id: ''
        };
    }

    _isMounted;

    user_url;

    componentWillMount() {
        this._isMounted = true;
        user_url = Config.apiDomain + api.user.info;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    render() {
        return (
            <View>
                <Text>什么也没有...(未实现)</Text>
            </View>
        );
    }
}