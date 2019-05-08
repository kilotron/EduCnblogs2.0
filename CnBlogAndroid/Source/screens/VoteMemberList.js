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
import {flatStyles} from '../styles/styles';
import MyAdapter from './MyAdapter.js';

const ItemHandler = require('../DataHandler/ClassMember/ItemHandler')


export default class VoteMemberList extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            members: [],
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

    _renderItem = ({item}) => {
        return (
            <View style={flatStyles.cell}>
                <TouchableOpacity
                    onPress={() => {alert('待完成：显示成员投票项')}}
                    style={styles.listcontainer}
                >
                    <View style = {{flex:1}}>
                        <Image 
                            source = {
                                item.avatarUrl?{uri:item.avatarUrl}:require('../images/defaultface.png')}
                            style = {styles.avatarstyle}
                        />
                    </View>
                    <View style = {styles.textcontainer}>
                        <Text style = {{fontSize: 20,color: '#000000',flex:2}}>
                        {item.displayName+ ItemHandler(item.realName)}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        var data=[];
        for (var i in this.state.members) {
            data.push({
                memberId: this.state.members[i].memberId,
                studentNo: this.state.members[i].studentNo, 
                realName: this.state.members[i].realName,
                displayName: this.state.members[i].displayName,
                avatarUrl: this.state.members[i].avatarUrl,
            })
        }
        return (
            <View style={styles.container}>
                <FlatList
                    renderItem={this._renderItem}
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listcontainer: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        backgroundColor: 'white',
        marginLeft: 8,
        marginRight: 12,
        //alignSelf: 'stretch',
    },
    avatarstyle: {
        width: 0.15*screenWidth,
        height: 0.15*screenWidth,
        marginBottom: 5,
        marginTop: 5,
        borderRadius : 40,
        left : 2,
    },
})