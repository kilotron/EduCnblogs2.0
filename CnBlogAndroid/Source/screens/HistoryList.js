import Config from '../config';
import api from '../api/api.js';
import {authData, StorageKey} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {UI} from '../config'
import {flatStyles} from '../styles/styles'
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

const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
const pageSize = 10;

const HtmlDecode = require('../DataHandler/HomeworkDetails/HtmlDecode');

export default class HistoryList extends Component {
    constructor(props){
        super(props);
        this.state = {
            theblogs: [],
            theblogCount: 0,
            loadStatus: 'not loading',
            currentPageIndex: 1,
        }
        this._isMounted=true;
    }
    _isMounted;

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
            '删除所有历史记录',
            '确定要删除吗？',
            [
                {text: '取消'},
                {text: '确认删除', onPress: ()=>{
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

    /* 渲染一个历史记录数据 */
    _renderItem = (item) => {
        let item1 = item;
        var Id = item1.item.id;
        var Title = item1.item.title;
        var Url = item1.item.url;
        var BlogApp = item1.item.blogApp;
        var CommentCount = item1.item.commentCount;
        var SummaryContent = item1.item.summaryContent;
        var DateAdded = item1.item.dateAdded;

        /* 绑定左右滑动等参数 */
        let _panResponder = PanResponder.create({
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          //onPanResponderGrant: this._handlePanResponderGrant,
          //onPanResponderMove: this._handlePanResponderMove,
          onPanResponderRelease: (evt, gestureState)=>{
              if(gestureState.dx < 0 && gestureState.dx < -screenWidth*0.1) {
                  this._onPressDelHistory(Id);
              }
              else if(gestureState.dx > 0 && gestureState.dx > screenWidth*0.1) {
                  this._onPressDelAll();
              }
              else{
                  this.props.navigation.navigate('BlogDetail',
                  {Id:Id, blogApp: BlogApp, CommentCount: CommentCount, Url: Url, Title: Title, Description:SummaryContent});
              }
          },
          onPanResponderTerminate: (evt, gestureState)=>{;},
        });

        return(
            <View style={flatStyles.cell}  {..._panResponder.panHandlers}>
                <TouchableOpacity
                    style = {styles.listcontainer}
                    onLongPress = {()=> {this._onPressDelHistory(Id)}}
                    onPress = {Url!=='' ? ()=>this.props.navigation.navigate('BlogDetail',
                    {Id:Id, blogApp: BlogApp, CommentCount: CommentCount, Url: Url, Title: Title, Description:SummaryContent}) : ()=>{}}
                >
                    <Text style = {{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginTop: 10,
                        marginBottom: 2,
                        textAlign: 'left',
                        color: 'black',
                        fontFamily : 'serif',
                    }} accessibilityLabel = {Url}>
                        {Title}
                    </Text>
                    <Text  numberOfLines={2} style = {{
                        lineHeight: 25,
                        fontSize: 14,
                        marginBottom: 8,
                        textAlign: 'left',
                        color: 'rgb(70,70,70)',
                    }}>
                        {SummaryContent + '...'}
                    </Text>
                    <View style = {{
                        flexDirection: 'row',
                        marginBottom: 8,
                        justifyContent: 'space-around',
                        alignItems: 'flex-start',
                    }}>
                        <Text style = {{fontSize: 10, textAlign: 'right', color: 'black', flex: 1}}>
                            {BlogApp}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
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
        var data = [];
        for(var i in this.state.theblogs)
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
            {
                this.state.loadStatus==='none'?
                    (
                        <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                            <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                            这还什么都没有
                            </Text>
                        </View>
                    ): ( null )
            }
                <FlatList
                    renderItem={this._renderItem}
                    data= {data}
                    refreshing= {false}
                    onRefresh = {this._FlatListRefresh}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />
            </View>
        )
    }

    /* 历史记录列表到达底部时，渲染底部文本 */
    _renderFooter(){
        if (this.state.loadStatus === 'all loaded') {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                    没有更多数据了
                    </Text>
                </View>
            );
        } else if(this.state.loadStatus === 'loading') {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text>正在加载更多数据...</Text>
                </View>
            );
        } //else 'not loading'
        return (
            <View style={styles.footer}>
                <Text></Text>
            </View>
        );
    }

    _onEndReached() {
        if (this.state.loadStatus != 'not loading') {
			return;
		}
		let pageCount = Math.ceil(this.state.theblogCount / pageSize);
		if (this.state.currentPageIndex >= pageCount) {
			return;
		}

        this.state.currentPageIndex++;
		this.fetchPage();
    }

    /* 获取某页面的数据，这里简单的考虑第一页时重置历史记录列表，其他情况追加数据 */
    fetchPage() {
        if (!this._isMounted)
        {
            return ;
        }
        global.storage.load({key: StorageKey.BLOG_LIST})
        .then((ret)=>{
            var storageData=ret;
            console.log('解析：' + JSON.stringify( storageData));
            //Alert.alert('长度：' + ret.length);
            this.setState({
                theblogs: ret,
                theblogCount: ret.length,
                loadStatus: (ret.length>0)?'all loaded':'none',
                currentPageIndex: 1,
            });
        })
        .catch((err)=>{
            this.setState({
                theblogs: [],
                theblogCount: 0,
                loadStatus: 'none',
                currentPageIndex: 1,
            });
            ToastAndroid.show(err.name,ToastAndroid.SHORT);
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
            <View style = {styles.container}>

                <View>
                    <View style={{ height: 1, backgroundColor: 'rgb(225,225,225)',  marginTop: 0.005*screenHeight, alignSelf:'stretch'}}/>
                    {
                        this._renderHistoryList()
                    }
                </View>
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
    listcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        alignSelf: 'stretch',
        backgroundColor: 'white',
        paddingLeft: 0.03*screenWidth,
        paddingRight: 0.04*screenWidth,
    }
});
