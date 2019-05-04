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
import * as Service from '../request/request.js';
import Config from '../config';

export default class VoteMemberList extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            members: [],
            test: '111',
        }
    }

    _isMounted;

    componentWillMount() {
        const params = this.props.navigation.state.params;
        var voteCommittedMembersURL = Config.VoteCommittedMembers + 
            params.schoolClassId + '/' + params.voteId;
        Service.Get(voteCommittedMembersURL)
        .then((jsonData) => {
            if (jsonData !== 'rejected') {
                if (this._isMounted) {
                    this.setState({
                        members: jsonData,
                    })
                    s=''
                    for (var i in jsonData) {
                        s += 'displayname:' + jsonData[i].displayName+'\n'; 
                        s += 'realname:' + jsonData[i].realName + '\n';
                        s+='\n'
                    }
                    this.setState({test: s});
                }
            }
        })
        .catch((error) => {
            alert('未实现');
        })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View><Text>{this.state.test}</Text></View>
        )
    }
}