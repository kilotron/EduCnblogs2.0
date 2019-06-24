//该页面是devote的主页面
//按照classBlogPostList页面仿写
import Config from '../config';
import api from '../api/api.js';
import { authData, err_info, UI } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component } from 'react';
import { StorageKey } from '../config'
import { flatStyles } from '../styles/styles';

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
    ActivityIndicator,
} from 'react-native';

const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');
const relativeTime = require('../DataHandler/DateHandler');

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = MyAdapter.btnFontSize;
const pageSize = 12; //每页显示数目

export default class VoteList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPageIndex: 1, //当前页面
            loadStatus: 'not loading',  // 用于上拉加载的动画
            totalCount: 0,
            votes: [],
            classId: this.props.classId,
            isEmpy: true, //初始认为请求未成功，不进行渲染，以防App崩溃
            networkError: false,
        }
    }

    _isMounted;

    componentWillMount() {
        this.fetchPage(1);
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getUrl(pageIndex) { //根据index获得对应page的信息
        let url = Config.VoteList + '/' + this.state.classId + '/' + pageIndex + '-' + pageSize;
        return url;
    }

    /** 解析this.state.votes的数据，返回一个数组。 */
    makeVotesList() {
        var data = [];
        for (var i in this.state.votes) {
            data.push({
                voteId: this.state.votes[i].voteId,
                name: this.state.votes[i].name,
                url: this.state.votes[i].url,
                description: this.state.votes[i].description,
                dateAdded: this.state.votes[i].dateAdded,
                voteCount: this.state.votes[i].voteCount,
            })
        }
        return data;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.classId !== this.props.classId) {
            this.setState({ classId: nextProps.classId },
                () => { this.updateData() });
        }
    }

    updateData = ()=>{
        this.setState({
            votes: [],
            loadStatus: 'not loading',  // 用于上拉加载的动画
            totalCount: 0,
            currentPageIndex: 1,        // 已加载的页数/序号，从1开始
        }, () => { this.fetchPage(this.state.currentPageIndex)});
    }

    fetchPage(pageIndex) {
        this.setState({ loadStatus: 'loading' });
        Service.Get(this.getUrl(pageIndex))
            .then((jsonData) => {
                if (jsonData === 'rejected') {
                    if (pageIndex == 1)
                        this.setState({ loadStatus: 'none' });
                    return;
                }
                let pageCount = Math.ceil(jsonData.totalCount / pageSize);
                if (this._isMounted) {
                    this.setState({
                        totalCount: jsonData.totalCount,
                        votes: this.state.votes.concat(jsonData.votes),
                        loadStatus: this.state.currentPageIndex >= pageCount ? 'all loaded' : 'not loading',
                    });
                }
            });
    }

    /**没有班级投票时，或者没有网络时，FlatList显示此组件。 */
    _renderEmptyList() {
        if (this.state.networkError) {
            return (
                <View></View>
            );
        } else if (this.state.loadStatus !== 'loading') {
            return (
                <View>
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>还没有班级投票~</Text>
                </View>
            );
        } else { //正在加载时不显示内容
            return (<View></View>);
        }
    }


    deleteVote(propsVoteId){
        alert('删除功能尚未实现');
    }

    _renderItem = ({ item }) => {
        return (
            <View style={[flatStyles.cellWithBorder, {backgroundColor: global.theme.backgroundColor}]}>
                <TouchableOpacity
                    style={[flatStyles.listContainer, {backgroundColor: global.theme.backgroundColor}]}
                    //onLongPress = {()=> {this.deleteVote(item.voteId)}}
                    onPress={() => {
                        this.props.navigation.navigate('VoteDetail', //获取详细信息
                            {
                                voteId: item.voteId,
                                // 在没有人投票的情况下不弹出已投票成员页面
                                voteCount: item.voteCount,
                                callback: this.updateData,
                            });
                    }}
                >
                    <Text style={[styles.postTitle, {color: global.theme.textColor}]}
                        accessibilityLabel={item.url}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>

                    <Text numberOfLines={3} style={[styles.postDescription, {color: global.theme.textColor}]}>
                        {HTMLSpecialCharsDecode(item.description)}
                    </Text>

                    <View style={[styles.postMetadataView, {backgroundColor: global.theme.backgroundColor}]}>
                        <Text style={[styles.viewCountAndCommentCount, {color: global.theme.grayTextColor}]}>
                            {item.voteCount + ' 投票人数'}
                        </Text>
                        <Text style={[styles.postDate, {color: global.theme.grayTextColor}]}>
                            {relativeTime(item.dateAdded) }
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    };

    /**FlatList滚动到到底部时调用此函数，获取新的一页。 */
    _onEndReached() {
        if (this.state.loadStatus !== 'not loading') {
            return; // 加载完毕或正在加载则返回
        }
        let pageCount = Math.ceil(this.state.totalCount / pageSize);  // 总页数
        if (this.state.currentPageIndex >= pageCount) {
            return; // currentPageIndex从1开始
        }
        this.setState({ currentPageIndex: this.state.currentPageIndex + 1 },
            () => { this.fetchPage(this.state.currentPageIndex) }
        );
    }

    /**FlatList底部的部件。这里用来显示加载下一页的状态 */
    _renderFooter() {
        if (this.state.loadStatus === 'all loaded') {
            return (
                <View style={styles.allLoadedView}>
                    <Text style={[styles.allLoadedText,{color: global.theme.promptTextColor}]}>
                        再往下拉也没有了呢 ~
                </Text>
                </View>
            );
        } else if (this.state.loadStatus === 'loading') {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text style={{color: global.theme.promptTextColor}}>正在加载...</Text>
                </View>
            );
        } //else 'not loading'
        return (
            <View style={styles.footer}>
                <Text></Text>
            </View>
        );
    }

    onPress2AddVote() {
        this.props.navigation.navigate('VoteAdd', {
            classId: this.state.classId,
            callback: this.updateData,
        });
    }

    GetAddButton() {
        return (
            <TouchableHighlight
                underlayColor={global.theme.addUnderlayColor}
                activeOpacity={0.5}
                style={[styles.addButton, {backgroundColor: global.theme.addBackgroundColor}]}
                onPress={this.onPress2AddVote.bind(this)} >
                <Text style={[styles.buttonContent, {color: global.theme.addTextColor}]}>
                    +
                </Text>
            </TouchableHighlight>
        );
    }

    render() {
        return (
            <View style={[styles.container, {backgroundColor: global.theme.backgroundColor}]}>

                <View>
                    {/* 需要使用View，不然FlatList无法显示 */}
                    {/* 使用keyExtractor为每个item生成独有的key，就不必再data数组的每一个元素中添加key键。
                        refreshing设置为false在列表更新时不显示转圈*/}
                    {/*item设置了立体的样式，这里去掉ItemSeparatorComponent={this._separator}*/}
                    {
                        this.state.loadStatus === 'none' ?
                            (
                                <View style={styles.footer}>
                                    <Text
                                        style = {[{color:global.theme.textColor}]}
                                    >暂时没有投票</Text>
                                </View>
                            ) : (null)
                    }
                    {<FlatList
                        renderItem={this._renderItem}
                        data={this.makeVotesList()}
                        keyExtractor={(item, index) => index.toString()}
                        onRefresh={this.updateData}
                        refreshing={false}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onScroll={this.animatedEvent}
                    />}

                </View>
                {this.GetAddButton()}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    buttonContent: { //button 内的字体
        fontSize: 30,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '100',
    },

    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        backgroundColor: "#3b50ce",
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20
    },
    container: {
        flex: 1,
    },
    header: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    picker: {
        height: 40,
        width: screenWidth,
        backgroundColor: 'white',
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 2,
        textAlign: 'left',
        color: 'black',
        fontFamily: 'serif',
    },
    postDescription: {
        lineHeight: 25,
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'left',
        color: 'rgb(70,70,70)',
    },
    postMetadataView: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    viewCountAndCommentCount: {
        fontSize: 10,
        textAlign: 'left',
        color: 'black',
        flex: 1
    },
    postDate: {
        fontSize: 10,
        textAlign: 'right',
        color: 'black',
        flex: 1
    },
    allLoadedView: {
        height: 30,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    allLoadedText: {
        color: '#999999',
        fontSize: 14,
        marginTop: 5,
        marginBottom: 5,
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
});
