/* 班级博文列表显示页面
这是一个Picker和FlatList的组合.

属性：
    schoolClassId: 班级Id

用到的API见本文件末尾。
*/

import React, { Component} from 'react';
import PropTypes from 'prop-types';
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
	Picker,
    ActivityIndicator,
    Animated,
} from 'react-native';
import {flatStyles} from '../styles/styles';
import Config, { err_info } from '../config';
import * as Service from '../request/request.js';
import MyAdapter from '../screens/MyAdapter';

// 获取博文一页的容量
const pageSize = 10;

/*  属性确认
    schoolClassId要求是数字 */
const ClassBlogPostsListProps = {
    schoolClassId: PropTypes.number.isRequired,
};

export default class ClassBlogPostsList extends Component {

    /**属性schoolClassId可能会改变，因此将其放到state中，在父组件改变schoolClassId后，调用
     * componentWillReceiveProps(nextProps)更新此state中的schoolClassId。
     */
    constructor(props) {
        super(props);
        this.state = {
            blogs: [],	                // 班级博客列表
            postCount: 0,               //班级博客总数
            schoolClassId: this.props.schoolClassId,
            filter: 'all',              // 筛选条件：'all' 'no_comment' 'tutor' 'student'
			loadStatus: 'not loading',  // 用于上拉加载的动画
			currentPageIndex: 1,        // 已加载的页数/序号，从1开始
            headerTop: new Animated.Value(0), // 用于向下滚动隐藏筛选条件的动画
            networkError: false,        // 加载失败时设置为true
        }
        /* 下面两个变量用于向下滚动隐藏筛选条件的动画。动画设置的参考链接见本文件末尾。 */
        this.top = this.state.headerTop.interpolate({
            inputRange: [0, 270, 271, 280],
            outputRange: [0, -50, -50, -50]
        });
        this.animatedEvent = Animated.event(
            [{
                nativeEvent: {
                    contentOffset: {y: this.state.headerTop}
                }
            }]
        );
    }

    /**在一个组件卸载后调用setState()，可能导致内存泄漏，会产生警告。
       在setState前需要使用此变量检查组件是否卸载。
       在componentDidMount中设置_isMounted为true，在componentWillUnmount中设置为false。
       参考：https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html*/
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

    /** 父组件更新属性schoolClassId时，使用此函数更新子组件state的schoolClassId,
       然后重新获取班级博文列表*/
    componentWillReceiveProps(nextProps) {
        if (nextProps.schoolClassId !== this.props.schoolClassId) {
            //alert(nextProps.schoolClassId);
            // setState是异步的，所以将fetch操作放入回调函数中
            this.setState({schoolClassId: nextProps.schoolClassId},
                () => {this.updateData()});
        }
    }

    // 可删，调试用
    componentWillUpdate() {

    }

    /** 第pageIndex页的班级博文的URL */
    URLOf(pageIndex) {
        //alert(this.props.schoolClassId);
        return Config.apiDomain + 'api/edu/schoolclass/posts/' + this.state.filter +
            '/' + this.state.schoolClassId + '/' + pageIndex + '-' + pageSize;
    }

    /** 读取第pageIndex页，并更新state。每页pageSize项.pageIndex从1开始。
     * */
	fetchPage(pageIndex) {
        //这里是否需要检查？
        this.setState({loadStatus: 'loading'});
		Service.Get(this.URLOf(pageIndex))
		.then((jsonData) => {
            // 初始时schoolClassId不正确，返回的jsonData是rejected。
            if (jsonData === 'rejected') {
                return;
            }
            let pageCount = Math.ceil(jsonData.totalCount / pageSize);
			if (this._isMounted) {
				this.setState({
					postCount: jsonData.totalCount,
					blogs: this.state.blogs.concat(jsonData.blogPosts),
					loadStatus: this.state.currentPageIndex >= pageCount ? 'all loaded' : 'not loading',
				});
			}
        })
        .catch((err) => {
            this.setState({loadStatus: 'not loading', networkError: true});
        });
        this.setState({loadStatus: 'not loading'});
    }

    /** 解析this.state.blogs的数据，返回一个数组。 */
    makeBlogPostsList() {
        var data = [];
        for (var i in this.state.blogs) {
            data.push({
                blogId: this.state.blogs[i].url.match( /p\/([^%]+).html/)[1],//博文的编号
                title: this.state.blogs[i].title,
                url: this.state.blogs[i].url,
                description: this.state.blogs[i].description,
                postDate: this.state.blogs[i].dateAdded,
                viewCount: this.state.blogs[i].viewCount,
                commentCount: this.state.blogs[i].commentCount,
            })
        }
        return data;
    }

    /** 更新数据，重新加载第一页.此函数适用于切换班级（schoolClassId变化）
     *  、切换筛选条件（filter变化）或下拉刷新时重新获取博文。
     *
     *  重新获取博文前，先恢复初始状态。把已经获取的博文清空，重置loadStatus为
     *  'not loading'，重置currentPageIndex为1。schoolClassId不改变，
     *  filter不改变。状态重置后，再获取页面。
     *
     * 使用updateData(){}的形式需要在flatlist中使用this.updateData.bind(this)
     * 使用updateData = ()=>{}的形式则不用。
     */
    updateData() {
        this.setState({
            blogs: [],
            postCount: 0,
			loadStatus: 'not loading',  // 用于上拉加载的动画
            currentPageIndex: 1,        // 已加载的页数/序号，从1开始
            networkError: false,
        }, () => {this.fetchPage(this.state.currentPageIndex)});
    }

    render() {
        return (
            <View style={styles.container}>
                <Animated.View style={{top: this.top}}>
                    <View style={styles.header}>
                    {/* Picker中文本的样式在android/app/src/main/res/values/styles.xml
                    这个文件里修改。样式设置参考链接见本文件末尾。*/}
                        <Picker
                            selectedValue={this.state.filter}   // 默认选中的值
                            style={[styles.container, styles.picker]}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({filter: itemValue}, this.updateData.bind(this));
                            }}
                        >
                            <Picker.Item label="全部博文" value="all" />
                            <Picker.Item label="零回复博文" value="no_comment" />
                            <Picker.Item label="老师/助教" value="tutor" />
                            <Picker.Item label="学生" value="student" />
                        </Picker>
                    </View>
                </Animated.View>

                <Animated.View style={{top: this.top}}>
                    <View>{/* 需要使用View，不然FlatList无法显示 */}
                        {/* 使用keyExtractor为每个item生成独有的key，就不必再data数组的每一个元素中添加key键。
                            refreshing设置为false在列表更新时不显示转圈*/}
                        {/*item设置了立体的样式，这里去掉ItemSeparatorComponent={this._separator}*/}
                        <FlatList
                            renderItem={this._renderItem}
                            data={this.makeBlogPostsList()}
                            keyExtractor={(item, index) => index.toString()}
                            onRefresh = {this.updateData.bind(this)}
                            refreshing= {false}
                            onEndReached={this._onEndReached.bind(this)}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={this._renderEmptyList.bind(this)}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onScroll={this.animatedEvent}
                        />
                    </View>
                </Animated.View>
            </View>
        );
    }

    /**FlatList的renderItem */
    _renderItem = ({item}) => {
		return(
            <View style={flatStyles.cell}>
                <TouchableOpacity
                    style = {flatStyles.listContainer}
                    onPress = {() => {
                        this.props.navigation.navigate('BlogDetail',
                            {
                                Id:item.blogId,
                                blogApp: item.url.split('/')[3],
                                CommentCount: item.commentCount,
                                Url: item.url,
                                Title: item.title,
                                //useURL: true,
                            });
                    }}
                >
                    <Text style={styles.postTitle} accessibilityLabel={item.url}>
                        {item.title}
                    </Text>

                    <Text numberOfLines={3} style={styles.postDescription}>
                        {item.description}
                    </Text>

                    <View style={styles.postMetadataView}>
                        <Text style={styles.viewCountAndCommentCount}>
                            {item.viewCount + ' 阅读' + '  '
                             + item.commentCount + ' 评论'}
                        </Text>
                        <Text style={styles.postDate}>
                            {'发布于: ' + item.postDate.split('T')[0] + ' '
                             + item.postDate.split('T')[1]}
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
        let pageCount = Math.ceil(this.state.postCount / pageSize);  // 总页数
        if (this.state.currentPageIndex >= pageCount) {
            return; // currentPageIndex从1开始
        }
        this.setState({currentPageIndex: this.state.currentPageIndex + 1},
            () => {this.fetchPage(this.state.currentPageIndex)}
        );
    }

    /**FlatList底部的部件。这里用来显示加载下一页的状态 */
    _renderFooter() {
        if (this.state.loadStatus === 'all loaded') {
            return (
                <View style={styles.allLoadedView}>
                    <Text style={styles.allLoadedText}>
                        没有更多数据了
                    </Text>
                </View>
            );
        } else if(this.state.loadStatus === 'loading') {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text>正在加载...</Text>
                </View>
            );
        } //else 'not loading'
        return (
            <View style={styles.footer}>
                <Text></Text>
            </View>
        );
    }

    /**没有班级博文时，或者没有网络时，FlatList显示此组件。 */
    _renderEmptyList() {
        if (this.state.networkError) {
            return (
                <View>
                    <TouchableOpacity onPress={()=>{
                        ToastAndroid.show('This is a dinosaur.', ToastAndroid.SHORT);
                    }}>
                        <Image
                            style={styles.dinosaurPic}
                            source={require('../images/dinosaur.jpg')}
                        />
                    </TouchableOpacity>
                    <Text style={styles.dinosaurText}>未连接到互联网</Text>
                </View>
            );
        } else if (this.state.loadStatus !== 'loading') {
            return (
                <View>
                    <Text style={{textAlign: 'center', marginTop:20}}>还没有班级博文~</Text>
                </View>
            );
        } else { //正在加载时不显示内容
            return (<View></View>);
        }
    }

}

ClassBlogPostsList.PropTypes = ClassBlogPostsListProps;

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

const styles = StyleSheet.create({
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
		fontFamily : 'serif',
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
        height:30,
        alignItems:'center',
        justifyContent:'flex-start',
    },
    allLoadedText: {
        color:'#999999',
        fontSize:14,
        marginTop:5,
        marginBottom:5,
    },
    footer:{
		flexDirection:'row',
		height:24,
		justifyContent:'center',
		alignItems:'center',
		marginBottom:10,
    },
    dinosaurPic: {
        marginLeft:30,
        marginTop: 30,
        width: 60,
        height: 60,
    },
    dinosaurText: {
        textAlign: 'left',
        marginLeft:30,
        marginTop:30,
        fontWeight: 'bold',
        fontSize: 24,
        color: '#505050',
    },
});

/*请求方式：GET
请求地址：https://api.cnblogs.com/api/edu/schoolclass/posts/{filter}/{schoolClassId}/{pageIndex}-{pageSize}

Body参数名  类型	必需	描述	示例 e.g.
filter	string	是	筛选条件	tutor
schoolClassId	number	是	班级Id	1
pageIndex	number	是	页码	1
pageSize	number	是	页容量	10

详细说明：
筛选条件包含：no_comment（零回复）、tutor（老师/助教）、student（学生）、all（所有）

Body参数名	描述	类型
totalCount	博文总数	number
blogPosts	博文列表	array
blogPosts.title	标题	string
blogPosts.url	链接	string
blogPosts.description	描述	string
blogPosts.viewCount	浏览数	number
blogPosts.diggCount	推荐数	number
blogPosts.commentCount	评论数	number
blogPosts.author	作者	string
blogPosts.displayName	显示名	string
blogPosts.blogId	博客Id	number
blogPosts.blogUrl	博客链接	string
blogPosts.avatarUrl	作者头像	string
blogPosts.dateAdded	发表日期    datetime

样式设置参考链接：
https://stackoverflow.com/questions/45250747/react-native-why-cant-i-align-picker-item-to-right-in-android-platform

滚动隐藏筛选条件Picker的动画：
https://www.jianshu.com/p/a2dafc590063
*/
