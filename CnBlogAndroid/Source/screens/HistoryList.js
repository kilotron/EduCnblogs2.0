import Config from '../config';
import api from '../api/api.js';
import {authData, StorageKey} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {UI} from '../config'
import {nameImageStyles, flatStylesWithAvatar} from '../styles/styles'
import {blogListStyles} from '../styles/blogList'
import * as storage from '../Storage/storage.js'
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableHighlight,
    ActivityIndicator,
    TouchableOpacity,
    ToastAndroid,
    PanResponder,
    screen,
    Alert,
} from 'react-native';

import {getHeaderStyle} from '../styles/theme-context';

import Swipeout from 'react-native-swipeout';

const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
const pageSize = 10;
const minMoveDistance = (15<0.1*screenWidth)?15:0.1*screenWidth;

const HtmlDecode = require('../DataHandler/HomeworkDetails/HtmlDecode');

export default class HistoryList extends Component {

    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })

    constructor(props){
        super(props);
        this.state = {
            theblogs: [],
            theblogCount: 0,
            loadStatus: 'not loading',
            currentPageIndex: 1,
            rowID: null,
            sectionID: null,
            multSelection: false,
            selectedItems: [],
        }
        this._isMounted=true;
    }
    /*
    static navigationOptions = ({ navigation }) => ({
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
        headerRight: (
            this.state.multSelection
            ? (
                <TouchableOpacity style={{marginRight:18}} onPress={()=>{
                    this._delSelected();
                }}>
                    <Text style={{color: global.theme.headerTintColor, fontSize: 18}}>删除</Text>
                </TouchableOpacity>)
            : (<View></View>)),
    })
    */
    _isMounted;

    _delSelected(){
        if(!this._isMounted){
            return;
        }
        Alert.alert(
            '删除已选中历史记录',
            '确定要删除吗？',
            [
                {text: '取消'},
                {text: '确认删除', onPress: ()=>{
                    global.storage.load({key: StorageKey.BLOG_LIST})
                    .then((ret)=>{
                        result = [];
                        blogCount = 0;
                        ret.map((item,index)=>{
                            if(this.state.selectedItems.indexOf(item.id)<0){
                                result.push(item);
                                blogCount++;
                            }
                        })
                        global.storage.save({key: StorageKey.BLOG_LIST, data: result});
                        this.setState({
                            theblogs: result,
                            theblogCount: blogCount,
                            loadStatus:(blogCount>0)?'all loaded':'none',

                            selectedItems:[],
                            multSelection:false,
                        });
                    })
                    .catch((err)=>{
                        this.setState({
                            selectedItems:[],
                            multSelection:false,
                        });
                        ToastAndroid.show(err.name,ToastAndroid.SHORT);
                    })
                }},
            ]
        );
    }

    // componentWillUpdate(){
    //     this._isMounted=true;
    // }

    /* 弹出选择框询问是否删除 */
    _onPressDelHistory(id) {
        if(!this._isMounted){
            return;
        }
        Alert.alert(
            '删除该条历史记录',
            '确定要删除吗？',
            [
                {text: '取消'},
                {text: '确认删除', onPress: ()=>{
                    global.storage.load({key: StorageKey.BLOG_LIST})
                    .then((ret)=>{
                        result = [];
                        blogCount = 0;
                        ret.map((item,index)=>{
                            if(item.id!=id){
                                result.push(item);
                                blogCount++;
                            }
                        })
                        global.storage.save({key: StorageKey.BLOG_LIST, data: result});
                        this.setState({
                            theblogs: result,
                            theblogCount: blogCount,
                            loadStatus:(blogCount>0)?'all loaded':'none',
                        });
                    })
                    .catch((err)=>{
                        ToastAndroid.show(err.name,ToastAndroid.SHORT);
                    })
                }},
            ]
        );
    }

    _onPressDelAll(){
        if(!this._isMounted){
            return;
        }
        Alert.alert(
            '清空历史记录',
            '确定要清空吗？',
            [
                {text: '取消'},
                {text: '确认清空', onPress: ()=>{
                    global.storage.save({key: StorageKey.BLOG_LIST, data: []});
                    this.setState({
                        theblogs: [],
                        theblogCount: 0,
                        loadStatus: 'none'
                    });
                }},
            ]
        );
    }

    _onLongPressItem(Id){
        if(this.state.multSelection){
            // 代表已进入多选状态
            this._delSelected();
        }
        else{
            // 现在进入多选状态
            this.setState({
                selectedItems: [Id],
                multSelection: true,
            });
        }
    }

    /* 渲染一个历史记录数据 */
    _renderItem = (item) => {
        const item1 = item;
        const Id = item1.item.id;
        const Title = item1.item.title;
        const Url = item1.item.url;
        const BlogApp = item1.item.blogApp;
        const CommentCount = item1.item.commentCount;
        const SummaryContent = item1.item.summaryContent;
        const DateAdded = item1.item.dateAdded;
        let ItemBgColor = '#FFFFFF';
        let ItemIndex = this.state.selectedItems.indexOf(Id);
        if (ItemIndex > -1){
            ItemBgColor = '#EEEEF0';
        }

        const BtnsLeft = [{ text: '清空', type: 'delete',  onPress: ()=> this._onPressDelAll()},];
        const BtnsRight = [{ text: '删除', type: 'delete', onPress: ()=>this._onPressDelHistory(Id)},];

        return(
            <Swipeout
                close={!(this.state.sectionID === 'historylist' && this.state.rowID === Id)}
                right={BtnsRight}
                left={BtnsLeft}
                sensitivity={minMoveDistance}
                rowID={Id}
                sectionID='historylist'
                autoClose={true}
                backgroundColor= {global.theme.backgroundColor}
                onOpen={(sectionId, rowId, direction: string) => {
                    this.setState({
                        rowID: rowId,
                        sectionID: sectionId
                    });
                }}
                disabled={this.state.multSelection}
              >
            <View style={[flatStylesWithAvatar.cell, {backgroundColor:global.theme.backgroundColor}]}
            >
                <TouchableOpacity
                    style = {[flatStylesWithAvatar.listcontainer, {backgroundColor:global.theme.backgroundColor}]}
                    onLongPress = {()=> {this._onLongPressItem(Id)}}
                    onPress = {this.state.multSelection?(
                            ItemIndex>-1?()=>{
                                selectedItems = this.state.selectedItems;
                                selectedItems.splice(ItemIndex, 1);
                                this.setState({selectedItems:selectedItems});
                            }:()=>{
                                selectedItems = this.state.selectedItems;
                                selectedItems.push(Id);
                                this.setState({selectedItems:selectedItems});
                            }
                    ):
                        (Url!=='' ? ()=>this.props.navigation.navigate('BlogDetail',
                    {Id:Id, blogApp: BlogApp, CommentCount: CommentCount, Url: Url, Title: Title, Description:SummaryContent}) : ()=>{})
                }
                >
                    <View style = {[nameImageStyles.nameContainer, {backgroundColor: global.theme.avatarBackgroundColor}]}>
                        <Text style = {[nameImageStyles.nameText, {color: global.theme.avatarTextColor}]}>
                            {BlogApp.slice(0, 2)}
                        </Text>
                    </View>
                    <View style = {{flex:1}}>
                        <Text numberOfLines={1} style = {[blogListStyles.blogTitleText, {color : global.theme.textColor}]} >
                            {Title}
                        </Text>
                        <Text numberOfLines={2} style = {[blogListStyles.blogSummaryText, {color : global.theme.textColor}]}>
                            {SummaryContent + '...'}
                        </Text>
                        <View style = {[blogListStyles.blogAppAndTimeContainer, {backgroundColor:global.theme.backgroundColor}]}>
                            <Text style = {[blogListStyles.blogAppText, {color : global.theme.textColor}]}>
                                {BlogApp}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            </Swipeout>
        )
    };

    /* 刷新历史记录页面的函数 */
    _FlatListRefresh = ()=>{
        if (this._isMounted){
            this.fetchPage();
        }
    };

    /* 渲染历史记录列表 */
    _renderHistoryList() {
        let data = [];
        for(let i in this.state.theblogs)
        {
        data.push({
            key: this.state.theblogs[i].id,
            title: this.state.theblogs[i].title,
            url: this.state.theblogs[i].url,
            id: this.state.theblogs[i].id,
            blogApp: this.state.theblogs[i].blogApp,
            commentCount: this.state.theblogs[i].commentCount,
            summaryContent: this.state.theblogs[i].summaryContent,
            dateAdded: this.state.theblogs[i].addTime,

        })
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

    /* 历史记录列表到达底部时，渲染底部文本 */
    _renderFooter(){
        if (this.state.loadStatus === 'all loaded') {
            return (
                <View style={[flatStylesWithAvatar.promptTextContainer, {backgroundColor:global.theme.backgroundColor}]}>
                    <Text style={[flatStylesWithAvatar.promptText, {color:global.theme.textColor}]}>
                    再往下拉也没有了呢 ~
                    </Text>
                </View>
            );
        }
        return (
            <View style={[flatStylesWithAvatar.promptTextContainer, {backgroundColor:global.theme.backgroundColor}]}>
                    <Text style={[flatStylesWithAvatar.promptText, {color:global.theme.textColor}]}/>
            </View>
        );
    }

    _onEndReached() {
        if (this.state.loadStatus != 'not loading') {
			return;
		}
		const pageCount = Math.ceil(this.state.theblogCount / pageSize);
		if (this.state.currentPageIndex >= pageCount) {
			return;
		}

        this.state.currentPageIndex++;
		this.fetchPage();
    }

    /* 获取缓存的历史记录数据， */
    fetchPage() {
        if (!this._isMounted)
        {
            return ;
        }
        global.storage.load({key: StorageKey.BLOG_LIST})
        .then((ret)=>{
            //Alert.alert('长度：' + ret.length);
            this.setState({
                theblogs: ret,
                theblogCount: ret.length,
                loadStatus: (ret.length>0)?'all loaded':'none',
                currentPageIndex: 1,
            });
        })
        .catch((err)=>{
            global.storage.save({key: StorageKey.BLOG_LIST, data: []});
            this.setState({
                theblogs: [],
                theblogCount: 0,
                loadStatus: 'none',
                currentPageIndex: 1,
            });
        })
    }

    componentWillMount() {
        this.fetchPage();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View style = {[styles.container, {backgroundColor:global.theme.backgroundColor}]}>
                <View style={[flatStylesWithAvatar.separatorStyle,{backgroundColor:global.theme.backgroundColor}]}/>
                {
                    this._renderHistoryList()
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
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
