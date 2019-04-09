/* 班级博文列表显示页面
这是一个FlatList.

属性：
    schoolClassId: 班级Id
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
} from 'react-native';
import {flatStyles} from '../styles/styles';
import Config from '../config';
import * as Service from '../request/request.js';

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
			//loadStatus: 'not loading',
			//currentPageIndex: 1,
        }
    }

    /* 在一个组件卸载后调用setState()，可能导致内存泄漏，会产生警告。
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

    /* 父组件更新属性schoolClassId时，使用此函数更新子组件state的schoolClassId,
       然后重新获取班级博文列表*/
    componentWillReceiveProps(nextProps) {
        if (nextProps.schoolClassId !== this.props.schoolClassId) {
            //alert(nextProps.schoolClassId);
            // setState是异步的，所以将fetch操作放入回调函数中
            this.setState({schoolClassId: nextProps.schoolClassId}, 
                () => {this.fetchPage(1)});
        }
    }

    // 可删，调试用
    componentWillUpdate() {
        
    }

    /* 第pageIndex页的班级博文的URL */
    URLOf(pageIndex) {
        //alert(this.props.schoolClassId);
        return Config.apiDomain + 'api/edu/schoolclass/posts/' + this.filter +
            '/' + this.state.schoolClassId + '/' + pageIndex + '-' + pageSize;
    }

    // 读取第pageIndex页，每页pageSize项.pageIndex从1开始。
	fetchPage(pageIndex) {
        //这里是否需要检查？
		this.setState({loadStatus: 'loading'});
		//alert(url+this.state.blogs);//bug:第二次筛选时不能加载
		Service.Get(this.URLOf(pageIndex))
		.then((jsonData) => {
            //alert(jsonData);
            // 初始时schoolClassId不正确，返回的jsonData是rejected。
            if (jsonData === 'rejected') {  
                return;
            }
            let pageCount = Math.ceil(jsonData.totalCount / pageSize);
			if (this._isMounted) {
				this.setState({
					postCount: jsonData.totalCount,
					blogs: this.state.blogs.concat(jsonData.blogPosts),
					//loadStatus: this.state.currentPageIndex >= pageCount ? 'all loaded' : 'not loading',
				});
			}
		});
    }

    /** 解析this.state.blogs的数据，返回一个数组。 */
    makeBlogPostsList() {
        var data = [];
        //alert(this.state.blogs);
        for (var i in this.state.blogs) {
            //alert(this.state.blogs.length);
            data.push({
                //blogId: 1,
                blogId: this.state.blogs[i].blogId,//注意不是博文的编号，不能通过这个获取博文
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

    /* 使用updateData(){}的形式需要在flatlist中使用this.updateData.bind(this).
       使用updateData = ()=>{}的形式则不用。 */
    updateData() {
        this.setState({blogs: [], postCount: 0}, () => {this.fetchPage(1)});
    }
    
    render() {
        return (
            <View>
                <Picker
                    selectedValue={this.filter}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => {
                        this.filter = itemValue;
                        //this.UpdateData();
                    }}
                >
                    <Picker.Item label="全部博文" value="all" />
                    <Picker.Item label="零回复博文" value="no_comment" />
                    <Picker.Item label="老师/助教" value="tutor" />
                    <Picker.Item label="学生" value="student" />
                </Picker>

                {/* 使用keyExtractor为每个item生成独有的key，就不必再data数组的每一个元素中添加key键。
                    refreshing设置为false在列表更新时不显示转圈*/}
                <FlatList
                    ItemSeparatorComponent={this._separator}
                    renderItem={this._renderItem}
                    data={this.makeBlogPostsList()}
                    keyExtractor={(item, index) => index.toString()}
                    onRefresh = {this.updateData.bind(this)}
                    refreshing= {false}
                    //onEndReached={this._onEndReached.bind(this)}
                    //onEndReachedThreshold={0.1}
                    //ListFooterComponent={this._renderFooter.bind(this)}
                />
            </View>
        );
    }

    /**FlatList的分隔符 */
    _separator() {
		return (
            <View style={flatStyles.separatorStyle}></View>
		);
    }
    
    /**FlatList的renderItem */
    _renderItem = ({item}) => {
		return(
            <View>
                <TouchableOpacity
                    style = {flatStyles.listContainer}
                    onPress = {() => {
                        this.props.navigation.navigate('BlogDetail',
                            {
                                Id:item.blogId,
                                blogApp: global.user_information.BlogApp,
                                CommentCount: item.commentCount,
                                Url: item.url
                            });
                        {/*alert(Id);*/} // bug: ID不对
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

}

ClassBlogPostsList.PropTypes = ClassBlogPostsListProps;

const styles = StyleSheet.create({
    picker: {
        height: 50,
        width: 120,
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
*/