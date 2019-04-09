import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {UI} from '../config'
import {err_info} from '../config'
import {flatStyles} from '../styles/styles'
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableHighlight,
    ActivityIndicator,
    TouchableOpacity,
    ToastAndroid,
    screen,
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

export default class Bulletin extends Component {
    constructor(props){
        super(props);
        this.state = {
            changedSchoolClassId: this.props.changedSchoolClassId,
            bulletins: [],
            bulletinCount: 0,
            membership: 1,
            loadStatus: 'not loading',
            currentPageIndex: 1,
        }
        this._isMounted=true;
    }
    _isMounted;

    // componentWillUpdate(){
    //     this._isMounted=true;
    //     this.fetchPage(this.state.currentPageIndex);
    // }

    /* 渲染一个公告数据 */
    _renderItem = (item) => {
        let item1 = item;
        var Id = item1.item.key;
        var Content = item1.item.Content;
        var Publisher = item1.item.Publisher;
        var BlogUrl = item1.item.BlogUrl;
        var DateAdded = item1.item.DateAdded;
        return(
            <TouchableOpacity onPress={()=>{
                this.props.navigation.navigate('BulletinEdition',{
                    schoolClassId: this.props.schoolClassId,
                    bulletinText: Content,
                    bulletinId: Id,
                    membership: this.state.membership,
                    callback: this._FlatListRefresh
                });
            } }>
                <View style={styles.textcontainer}>
                    <Text numberOfLines={3} style={styles.bulletinContent}>
                        {Content}
                    </Text>
                    <View style={{alignSelf: 'flex-end'}}>
                        <Text style={styles.bulletinPublisher}>
                            {Publisher}
                        </Text>
                    </View>
                    <View style={{alignSelf: 'flex-end'}}>
                        <Text style={styles.bulletinDateAdded}>
                            {DateAdded}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    _separator = () => {
        return (
            <View style={flatStyles.separatorStyle}>
            </View>
        );
    }

    /* 刷新公告页面的函数，在改变班级、修改和发布公告后都应调用 */
    _FlatListRefresh = ()=>{
        this.setState({
            changedSchoolClassId: true,
            bulletins: [],
            bulletinCount: 0,
            loadStatus: 'not loading',
            currentPageIndex: 1,
        });
    };

    /* 渲染公告列表 */
    _renderBulletinList() {
        var data = [];
        for(var i in this.state.bulletins)
        {
        data.push({
            key: this.state.bulletins[i].bulletinId,
            Content: this.state.bulletins[i].content,
            Publisher: this.state.bulletins[i].publisher,
            BlogUrl: this.state.bulletins[i].blogUrl,
            //DateAdded: this.state.bulletins[i].dateAdded,
            DateAdded: this.String2Date(this.state.bulletins[i].dateAdded),
        })
        }
        return(
            <FlatList
                ItemSeparatorComponent={this._separator}
                renderItem={this._renderItem}
                data= {data}
                refreshing= {false}
                onRefresh = {this._FlatListRefresh}
                ListFooterComponent={this._renderFooter.bind(this)}
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={0.1}
            />
        )
    }

    /* 公告列表到达底部时，渲染底部文本 */
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
		let pageCount = Math.ceil(this.state.bulletinCount / pageSize);
		if (this.state.currentPageIndex >= pageCount) {
			return;
		}
        /*
        console.log('pagecount: ' + pageCount);
        console.log('currentPageIndex: '+ this.state.currentPageIndex );
        */
        this.state.currentPageIndex++;
		this.fetchPage(this.state.currentPageIndex);
    }

    /* 获取某页面的数据，这里简单的考虑第一页时充值公告列表，其他情况追加数据 */
    fetchPage(pageIndex) {
        let url = Config.BulletinList + this.props.schoolClassId + '/'+ pageIndex + '-'+ pageSize;
        //console.log(url);
        Service.Get(url).then((jsonData)=>{
            //console.log(jsonData);
            let pageCount = Math.ceil(jsonData.totalCount / pageSize);
            if(jsonData!=='rejected')
            {
                if(pageIndex===1)
                {
                    this.setState({
                        bulletinCount: jsonData.totalCount,
                        bulletins: jsonData.bulletins,
                        loadStatus: this.state.currentPageIndex>=pageCount ? 'all loaded' : 'not loading',
                        changedSchoolClassId: false,
                    });
                }
                else
                {
                    this.setState({
                        bulletinCount: jsonData.totalCount,
                        bulletins: this.state.bulletins.concat(jsonData.bulletins),
                        loadStatus: this.state.currentPageIndex>=pageCount ? 'all loaded' : 'not loading',
                        changedSchoolClassId: false,
                    });
                }
            }
            else
            {
                if(pageIndex==1)
                {
                    this.setState({
                        loadStatus: 'none',
                    });
                }

            }
        }).then(()=>{;
        }).catch((error) => {;
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    /* 单击添加公告列表时的响应函数 */
    _onPress = ()=>{
        let url = Config.apiDomain + api.user.info;
        if (this.state.membership==2||this.state.membership==3)
            this.props.navigation.navigate('BulletinAdd',
                {schoolClassId: this.props.schoolClassId, callback: this._FlatListRefresh});
        else
        {
            ToastAndroid.show("您没有权限，只有老师和助教才能发布公告哦！",ToastAndroid.SHORT);
        }
        /*
        this.props.navigation.navigate('BulletinAdd',
            {schoolClassId: this.props.schoolClassId, callback: this._FlatListRefresh});
        */
    }

    /* 修改prop属性时调用 */
    componentWillReceiveProps(nextProps) {
        /* 当传入的参数改变时首先获取用户在班级中的身份  */
        var membership = 1;
        let url1 = Config.apiDomain + api.user.info;
        Service.Get(url1).then((jsonData)=>{
            let url2= Config.apiDomain+"api/edu/member/"+jsonData.BlogId+"/"+this.props.schoolClassId;
            Service.Get(url2).then((jsonData)=>{
                //console.log(jsonData);
                if(this._isMounted && jsonData!=='rejected'){
                    membership = jsonData.membership;
                }
            })
        });
        this.setState({
            changedSchoolClassId: nextProps.changedSchoolClassId,
            //changedSchoolClassId: true,
            membership: membership,
            bulletins: [],
            bulletinCount: 0,
            loadStatus: 'not loading',
            currentPageIndex: 1,
        });
    }

    /* 将网站返回的时间字符串改成预期 */
    String2Date = (day)=>{
        //console.log(day);
        if(day == null)
            return '  ';
        let s1 = day.split('T')[0];
        let s2 = day.split('T')[1];
        return s1 + '  ' + s2.split('.')[0];
    }

    render() {
        if(this.state.changedSchoolClassId === true){
            this.fetchPage(1);
        }
        return (
            <View style = {styles.container}>
                <View style={{ height: 1, backgroundColor: 'rgb(225,225,225)',  marginTop: 0.005*screenHeight, alignSelf:'stretch'}}/>
                <View style={{width: screenWidth, }}>
                    {
                        this.state.loadStatus==='none'?
                            (
                                <View style={styles.footer}>
                                    <Text>这还什么都没有</Text>
                                </View>
                            ):
                            (
                                this._renderBulletinList()
                            )
                    }
                </View>
                <View
                    style= {{
                        flexDirection: 'row',
                        justifyContent:'flex-start',
                        alignItems: 'flex-start',
                        alignSelf: 'stretch',
                        flex:1,
                    }}
                >
                    <TouchableHighlight
                        underlayColor="#3b50ce"
                        activeOpacity={0.5}
                        style={{
                            position:'absolute',
                            bottom:20,
                            right:10,
                            backgroundColor: "#3b50ce",
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 20}}
                            onPress={this._onPress} >

                        <Text
                            style= {{
                                fontSize: 30,
                                color: '#ffffff',
                                textAlign: 'center',
                                fontWeight: '100',
                            }}
                        >
                            +
                        </Text>

                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    footer:{
        flexDirection:'row',
        height:24,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
    },
    textcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex: 4,
        backgroundColor: 'white',
        //alignSelf: 'stretch',
    },
    bulletinContent: {
        color: 'black',
        fontSize: 16,
        left: 4,
    },
    bulletinDateAdded: {
        fontSize: 14,
    },
    bulletinPublisher: {
        fontSize: 12,
    },
});
