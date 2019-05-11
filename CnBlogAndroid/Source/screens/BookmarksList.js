import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {UI} from '../config'
import {err_info} from '../config'
import {nameImageStyles, flatStylesWithAvatar} from '../styles/styles'
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    ToastAndroid,
    PanResponder,
    screen,
    Alert,
} from 'react-native';

import {
    StackNavigator,
    TabNavigator,
    NavigationActions,
} from 'react-navigation';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
const pageSize = 10;
const GetDetailId = require('../DataHandler/BlogDetail/GetDetailId');
const GetBlogApp = require('../DataHandler/BlogDetail/GetBlogApp');

export default class BookmarksList extends Component {
    constructor(props){
        super(props);
        this.state = {
            bookmarks:[],
            bookmarksCount: 0,
            loadStatus: 'not loading',
            currentPageIndex: 1,
            shouldRefresh: false,
        }
        this._isMounted=true;
    }
    _isMounted;

    componentWillMount(){
        this.fetchPage(this.state.currentPageIndex);
    }

    /* 弹出选择框询问是否删除 */
    _onPressDelBookmarks(wzLinkId) {
        if(!this._isMounted){
            return;
        }
        Alert.alert(
            '删除收藏',
            '确定要删除吗？',
            [
                {text: '取消'},
                {text: '确认删除', onPress: ()=>{
                    let postBody = {
                        id: wzLinkId,
                    };
                    let body = JSON.stringify(postBody);
                    let url = Config.Bookmarks + '/' + wzLinkId;
                    Service.UserAction(url, body, 'DELETE').then((jsonData)=>{
                        if(jsonData===null)
                        {
                            ToastAndroid.show('请求失败！',ToastAndroid.SHORT);
                        }
                        else if(jsonData.ok)
                        {
                            ToastAndroid.show('删除成功！',ToastAndroid.SHORT);
                        }
                        else
                        {
                            ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                        }
                        this.setState({
                            shouldRefresh: true,
                        });
                    }).catch((error) => {
                        ToastAndroid.show(err_info.NO_INTERNET ,ToastAndroid.SHORT);
                    });
                }},
            ]
        );
    }

    /* 渲染一个收藏项数据 */
    _renderItem = (item) => {
        let item1 = item;
        var Id = item1.item.key;
        var WzLinkId = item1.item.wzLinkId;
        var Title = item1.item.title;
        var LinkUrl = item1.item.linkUrl;
        var Summary = item1.item.summary;
        var Tags = item1.item.tags;
        var DateAdded = item1.item.dateAdded;
        var FromCnBlogs = item1.item.fromCnBlogs;
        var DetailId = item1.item.detailId;
        let BlogApp = GetBlogApp(LinkUrl);

        let _panResponder = PanResponder.create({
            /*
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            //onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            //onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            */
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                if(gestureState.dx < -screenWidth*0.1 || gestureState.dx > screenWidth*0.1){
                    return true;
                }
                else{
                    return false;
                }
            },
            onPanResponderRelease: (evt, gestureState)=>{
                if(gestureState.dx < 0) {
                    //Alert.alert('位移为 '+ gestureState.dx + '\n删除 '+ WzLinkId);
                    this._onPressDelBookmarks(WzLinkId);
                }
                else{
                  //Alert.alert('位移为 '+ gestureState.dx + '\n编辑 '+ WzLinkId);
                  this.props.navigation.navigate('BookmarksEdit',{Url: LinkUrl,
                      Title: Title, Id: WzLinkId, Description: Summary, callback: this._FlatListRefresh});
                }
            },
            onPanResponderTerminate: (evt, gestureState)=>{;},
        });

        return(
            <View style={flatStylesWithAvatar.cell} {..._panResponder.panHandlers}>
                <TouchableOpacity style = {flatStylesWithAvatar.listcontainer}
                 onPress={()=>{
                    this.props.navigation.navigate('BlogDetail',{Url: LinkUrl, Id: DetailId,
                        blogApp: BlogApp, CommentCount: 0, Title: Title, Description: Summary});
                    }}
                    >
                    <View style = {nameImageStyles.nameContainer}>
                        <Text style = {nameImageStyles.nameText}>
                            {BlogApp.slice(0, 2)}
                        </Text>
                    </View>
                    <View style = {{flex:1}}>
                        <Text style = {{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginTop: 6,
                            marginBottom: 2,
                            textAlign: 'left',
                            color: 'black',
                            fontFamily : 'serif',
                        }} >
                            {Title}
                        </Text>
                        <Text  numberOfLines={2} style = {{
                            lineHeight: 25,
                            fontSize: 12,
                            marginBottom: 2,
                            textAlign: 'left',
                            color: 'rgb(70,70,70)',
                        }}>
                            {Summary + '...'}
                        </Text>
                        <View style = {{
                            flexDirection: 'row',
                            marginBottom: 4,
                            justifyContent: 'space-around',
                            alignItems: 'flex-start',
                        }}>
                            <Text style = {{fontSize: 10, textAlign: 'right', color: 'black', flex: 1}}>
                                {BlogApp+'\n添加于 '+DateAdded}
                            </Text>
                        </View>
                    </View>

                </TouchableOpacity>
            </View>
        )
    };

    /* 刷新收藏页面 */
    _FlatListRefresh = ()=>{
        if (this._isMounted){
            this.setState({
                loadStatus: 'not loading',
                currentPageIndex: 1,
                shouldRefresh: true,
            });
        }
    };

    /* 渲染收藏列表 */
    _renderBookmarksList() {
        var data = [];
        for(var i in this.state.bookmarks)
        {
            if(this.state.bookmarks[i].FromCNBlogs)
            {
                if(this.state.bookmarks[i].LinkUrl.match( /p\/([^%]+).html/) !== null){
                    data.push({
                        key: this.state.bookmarks[i].LinkUrl,
                        wzLinkId: this.state.bookmarks[i].WzLinkId,
                        title: this.state.bookmarks[i].Title,
                        linkUrl: this.state.bookmarks[i].LinkUrl,
                        summary: this.state.bookmarks[i].Summary,
                        tags: this.state.bookmarks[i].Tags,/* list数据 */
                        dateAdded: this.String2Date(this.state.bookmarks[i].DateAdded),
                        fromCnBlogs: this.state.bookmarks[i].FromCNBlogs,
                        detailId: GetDetailId(this.state.bookmarks[i].LinkUrl),
                        //this.state.bookmarks[i].LinkUrl.match( /p\/([^%]+).html/)[1],
                    });
                }
            }
        }
        return(
            <View style={{width: screenWidth, }}>
                <FlatList
                    renderItem={this._renderItem}
                    data= {data}
                    refreshing= {false}
                    onRefresh = {this._FlatListRefresh}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={this._listEmptyComponent}
                    ItemSeparatorComponent={this._itemSeparatorComponent}
                />
            </View>

        )
    }

    _listEmptyComponent(){
        return (
            <View style={flatStylesWithAvatar.promptTextContainer}>
                <Text style={flatStylesWithAvatar.promptText}>
                这还什么都没有
                </Text>
            </View>
        );
    }

    _itemSeparatorComponent(){
        return (
            <View style={flatStylesWithAvatar.separatorStyle}/>
        )
    }

    /* 公告列表到达底部时，渲染底部文本 */
    _renderFooter(){
        if (this.state.loadStatus === 'all loaded') {
            return (
                <View style={flatStylesWithAvatar.promptTextContainer}>
                    <Text style={flatStylesWithAvatar.promptText}>
                    没有更多数据了
                    </Text>
                </View>
            );
        } else if(this.state.loadStatus === 'loading') {
            return (
                <View style={flatStylesWithAvatar.promptTextContainer}>
                    <Text style={flatStylesWithAvatar.promptText}>
                    正在加载更多数据...
                    </Text>
                </View>
            );
        } //else 'not loading'
        return (
            <View style={flatStylesWithAvatar.promptTextContainer}>
                <Text style={flatStylesWithAvatar.promptText}/>
            </View>
        );
    }

    _onEndReached() {
        if (this.state.loadStatus != 'not loading') {
			return;
		}
		let pageCount = Math.ceil(this.state.bookmarksCount / pageSize);
		if (this.state.currentPageIndex >= pageCount) {
			return;
		}

        this.state.currentPageIndex++;
		this.fetchPage(this.state.currentPageIndex);
    }

    /* 获取某页面的数据，这里简单的考虑第一页时重置收藏列表，其他情况追加数据 */
    fetchPage(pageIndex)
    {
        if (!this._isMounted)
        {
            return ;
        };
        var bookmarksCount = 0;
        Service.Get(Config.Bookmarks).then((jsonData)=>
        {
            bookmarksCount = jsonData.length;
            //console.log('bookmarksCount: ' + bookmarksCount);
            if(bookmarksCount <= 0)
            {
                this.setState({
                    shouldRefresh: false,
                    loadStatus: 'none',
                    bookmarks: [],
                });
            }
            else
            {
                let postBody =
                {
                    pageIndex: pageIndex,
                    pageSize: pageSize,
                };
                let body = JSON.stringify(postBody);
                let url = Config.Bookmarks + '?pageIndex=' + pageIndex +
                    '&pageSize=' + pageSize;
                Service.Get(url).then((jsonData)=>
                {
                    if(pageIndex===1)
                    {
                        this.setState({
                            bookmarks: jsonData,
                            bookmarksCount: bookmarksCount,
                            loadStatus: this.state.currentPageIndex*pageSize>=bookmarksCount ?
                                'all loaded' : 'not loading',
                            shouldRefresh: false,
                        });
                    }
                    else
                    {
                        this.setState({
                            bookmarks: this.state.bookmarks.concat(jsonData),
                            bookmarksCount: bookmarksCount,
                            loadStatus: this.state.currentPageIndex*pageSize>=bookmarksCount ?
                                'all loaded' : 'not loading',
                            shouldRefresh: false,
                        });
                    }

                }).catch((error) =>
                {
                    ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
                });
            }
        }).catch((error)=>
        {
            ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    /* 将网站返回的时间字符串改成预期 */
    String2Date = (dateStr)=>{
        //console.log(dateStr);
        if(dateStr == null)
            return '  ';
        let s1 = dateStr.split('T')[0];
        let s2 = dateStr.split('T')[1];
        return s1 + '  ' + s2.split('.')[0];
    }

    render() {
        if(this._isMounted && this.state.shouldRefresh)
        {
            this.fetchPage(1);
        }
        return (
            <View style = {styles.container}>
                <View style={styles.strangeView}/>
                {
                    this._renderBookmarksList()
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    strangeView:{
        height: 1,
        backgroundColor: 'rgb(225,225,225)',
        marginTop: 0.005*screenHeight,
        alignSelf:'stretch',
    },
});

/*
分页获取收藏列表
请求方式：GET
请求地址：https://api.cnblogs.com/api/Bookmarks?pageIndex={pageIndex}&pageSize={pageSize}


Body参数名	类型	必需	描述	示例 e.g.
pageIndex	number	是	页码	1
pageSize	number	是	页容量	10


Body参数名	描述	类型
WzLinkId	收藏编号	string
Title	标题	string
LinkUrl	收藏链接	string
Summary	收藏标题	string
Tags	标签	string
DateAdded	添加时间	string
FromCNBlogs	是否来自博客园	string

*/
