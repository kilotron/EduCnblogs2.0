import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    FlatList,
    Image,
    Alert
} from 'react-native';
import * as Service from '../request/request.js';
import Config from '../config';
import {flatStylesWithAvatar} from '../styles/styles';
import MyAdapter from './MyAdapter.js';
import { getHeaderStyle } from '../styles/theme-context';
const ItemHandler = require('../DataHandler/ClassMember/ItemHandler')

/**props.navigation传递schoolClassId和voteId和voteContent */
export default class VoteMemberList extends Component {
    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })
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
            } else { // 没有投票成员
                Alert.alert('提示', '没有投票成员');
                this.props.navigation.goBack();
            }
        })
        .catch((error) => {
            alert('错误');
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
            <View style={[flatStylesWithAvatar.cell,{backgroundColor:global.theme.backgroundColor}]}>
                <TouchableOpacity
                    onPress={() => {
                        let params = this.props.navigation.state.params;
                        this.props.navigation.navigate('VoteMemberCommit', {
                            memberId: item.memberId,
                            voteId: params.voteId,
                            voteContent: params.voteContent,
                        })
                    }}
                    style={[styles.listcontainer,{backgroundColor:global.theme.backgroundColor}]}
                >
                    <View style = {{flex:0}}>
                        <Image 
                            source = {
                                item.avatarUrl?{uri:item.avatarUrl}:require('../images/defaultface.png')}
                            style = {flatStylesWithAvatar.avatarstyle}
                        />
                    </View>
                    <View style = {{flex: 1,alignItems:'center', justifyContent:'center'}}>
                        <Text style = {{fontSize: 20,color: global.theme.textColor,textAlign:'center'}}>
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
            <View style={[styles.container, {backgroundColor:global.theme.backgroundColor}]}>
                <FlatList
                    renderItem={this._renderItem}
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this._itemSeparatorComponent}
                />
            </View>
        )
    }

    _itemSeparatorComponent(){
        return (
            <View style={flatStylesWithAvatar.separatorStyle}/>
        )
    }
}

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    textcontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})