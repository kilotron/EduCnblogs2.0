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
import {flatStyles} from '../styles/styles'
import {blogListStyles} from '../styles/blogList';
import * as Push from '../DataHandler/Push/PushHandler';
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
import {withNavigationFocus} from 'react-navigation';   // 
import {navigationHeaderHeight, homeTabHeaderHeight} from '../styles/theme-context';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const relativeTime = require('../DataHandler/DateHandler');

// 此页面传入的参数为blogApp(即个人博客名)
class PersonalBlog extends Component{
    constructor(props){
        super(props);
        this.state = {
            blogs: [],//博客随笔信息列表
            blogTitle: '',//博客标题
            pageSize: 0,//博客页容量
            postCount: 0,//随笔总数
            isRequestSuccess: false,
        };
        Push.initPush();
    }
	_isMounted;
    // 更新博客显示数据
    UpdateData = ()=>{
        // 先清零数据
        this.setState({
            blogs: [],//博客随笔信息列表
            blogTitle: '',//博客标题
            pageSize: 0,//博客页容量
            postCount: 0,//随笔总数
            isRequestSuccess: false,
        });
		this.componentWillMount();
    };

    componentWillMount = ()=>{
        this._isMounted=true;
        // 获取当前登录用户信息，存放于global
        let user_url = Config.apiDomain + api.user.info;
		Service.Get(user_url)
		.then((jsonData)=>{
			if(jsonData!=='rejected')
			{
				this.setState({
					isRequestSuccess: true,
				})
				global.user_information = {
					userId : jsonData.UserId,
					SpaceUserId : jsonData.SpaceUserId,
					BlogId : jsonData.BlogId,
					DisplayName : jsonData.DisplayName,
					face : jsonData.Face,
					Seniority : jsonData.Seniority,  //园龄
					BlogApp : jsonData.BlogApp,
				}
			}
		})
		.then(()=>{
			let blogApp = global.user_information.BlogApp;
			// 首先获取博客信息
			let url = Config.apiDomain+'api/blogs/'+blogApp;
			if(this.state.isRequestSuccess){
				Service.Get(url)
				.then((jsonData)=>{
					if(this._isMounted){
						this.setState({
							blogTitle: jsonData.title,
							pageSize: jsonData.pageSize,
							postCount: jsonData.postCount,
						});
					}
				})
				.then(()=>{
					global.storage.save({key:StorageKey.BLOG_TITLE,data:this.state.blogTitle})
					.catch((err)=>{
						ToastAndroid.show("error",ToastAndroid.SHORT);
					})
				})

				// 然后利用获取到的博客文章数量获取文章列表，因为获取方式是分页的
				.then(()=>{
					// 计算页数
					let {pageSize, postCount} = this.state;
					let pageCount  = Math.ceil(postCount/pageSize);
					var pageIndexes = [];
					for(var pageIndex = 1; pageIndex <= pageCount; pageIndex++)
					{
						pageIndexes.push(pageIndex);
					}
					// 这里需要使用promise数组保证获取内容的顺序(不可在for循环中进行异步操作，顺序会乱)
					return promises = pageIndexes.map((pageIndex)=>{
						return Service.Get(Config.apiDomain+'api/blogs/'+blogApp+'/posts?pageIndex='+pageIndex)
					})
				})
				// 使用promise.all按顺序获取数组中的信息
				.then((promises)=>{
					Promise.all(promises).then((posts)=>{
						for(var i in posts)
						{
							if(this._isMounted){
								this.setState({
									blogs: this.state.blogs.concat(posts[i]),
								})
							}
						}
					})
					//将获取到的博客列表缓存
					.then(()=>{
						global.storage.save({key:StorageKey.PERSON_BLOG,data:this.state.blogs})
						.catch((err)=>{
							ToastAndroid.show("SAVE_ERROR",ToastAndroid.SHORT);
						})
					})
				})
				.catch((err)=>{
					ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
				})
			}
		}).catch((error) => {
			ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
			global.storage.load({key:StorageKey.PERSON_BLOG})
			.then((ret)=>{
				this.setState({
					blogs : ret,
				})
			}).then(()=>{
				global.storage.load({key:StorageKey.BLOG_TITLE})
				.then((ret)=>{
					this.setState({
						blogTitle : ret,
					})
				})
				.catch((err)=>{
					ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
				})
			}).catch((err)=>{
				ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
				this.props.navigation.navigate('Loginer');
			})
		});
    };

    componentWillUnmount = ()=>{
        this._isMounted=false;
    }

    _seperator = () => {
        return (
            <View style={[flatStyles.separatorStyle, {backgroundColor: global.theme.flatListSeperatorColor}]}/>
        )
    }

    _renderItem = (item)=>{
        let item1 = item;
        var Title = item1.item.Title;
        var Url = item1.item.Url;
        var Description = item1.item.Description;
        var PostDate = item1.item.PostDate;
        var ViewCount = item1.item.ViewCount;
        var CommentCount = item1.item.CommentCount;
        var Id = item1.item.key;
        return(
            <View style={[flatStyles.cell, {backgroundColor: global.theme.backgroundColor}]}>
                <TouchableOpacity
                    style = {[styles.listcontainer, {backgroundColor: global.theme.backgroundColor}]}
                    onPress = {Url!=='' ? ()=>this.props.navigation.navigate('BlogDetail',
                    {Id:Id, blogApp: global.user_information.BlogApp, CommentCount: CommentCount, Url: Url, Title: Title, Description: Description,}) : ()=>{}}
                >
                    <Text
                        style={[blogListStyles.blogTitleText, {color: global.theme.textColor}]}
                        accessibilityLabel = {Url}>
                        {Title}
                    </Text>
                    <Text  numberOfLines={2} style = {[blogListStyles.blogSummaryText, {color: global.theme.textColor}]}>
                        {Description}
                    </Text>
                    <View style = {blogListStyles.blogAppAndTimeContainer}>
                        <Text style = {{fontSize: 10, textAlign: 'left', color: global.theme.textColor, flex: 1}}>
                            {ViewCount+' 阅读'+'  '+CommentCount+' 评论'}
                        </Text>
                        <Text style = {{fontSize: 10, textAlign: 'right', color: global.theme.textColor, flex: 1}}>
                            {'发布于: '+relativeTime(PostDate)}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    };

    render(){
        var data = [];
        for(var i in this.state.blogs)
        {
            data.push({
                key: this.state.blogs[i].Id,
                Title: this.state.blogs[i].Title,
                Url: this.state.blogs[i].Url,
                Description: this.state.blogs[i].Description,
                PostDate: this.state.blogs[i].PostDate,
                ViewCount: this.state.blogs[i].ViewCount,
                CommentCount: this.state.blogs[i].CommentCount,
            })
        }
        return(
            <View style = {[styles.container, {backgroundColor: global.backgroundColor}]}>
                <View style = {[styles.header, {backgroundColor: global.theme.headerBackgroundColor}]}>
                    <Text style = {[styles.headertext, {color: global.theme.headerTintColor}]}>
                        {this.state.blogTitle}
                    </Text>
                </View>
                <View style={{ height: 0.75, backgroundColor: global.theme.seperatorColor}}/>
                <View style = {[styles.content, {backgroundColor: global.theme.backgroundColor}]}>
                    <FlatList
                        renderItem={this._renderItem}
						data= {data}
                        onRefresh = {this.UpdateData}
                        refreshing= {false}
                        ItemSeparatorComponent={this._seperator}
                    />
                </View>
            </View>
        )
    }
}

/* 用withNavigationFocus给PersonalBlog组件传递props.isFocused，
 * 在切换到此页面后PersonalBlog会重新渲染，用来切换主题。
 */
export default withNavigationFocus(PersonalBlog);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header:{
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: UI.TOP_COLOR,
        height: homeTabHeaderHeight,
        alignSelf: 'stretch',
    },
    headertext: {
        fontSize: 20,
        color: 'white',
        fontWeight:'normal',
        fontFamily : 'serif',
        // letterSpacing: 20, // not working on android
    },
    content: {
        flex: 11,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'stretch',
    },
    listcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        alignSelf: 'stretch',
        paddingLeft: 0.03*screenWidth,
        paddingRight: 0.04*screenWidth,
    }
});
