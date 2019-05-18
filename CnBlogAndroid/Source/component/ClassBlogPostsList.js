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
    PixelRatio,
    TouchableWithoutFeedback,
    ART,
} from 'react-native';

const {Surface, Shape, Path, Group} = ART;

import {flatStylesWithAvatar, nameImageStyles} from '../styles/styles';
import {blogListStyles} from '../styles/blogList'

import Config, { err_info } from '../config';
import * as Service from '../request/request.js';
import MyAdapter from '../screens/MyAdapter';

const T_WIDTH = 7;
const T_HEIGHT = 4;

const COLOR_HIGH = global.theme.headerTintColor;
const COLOR_NORMAL = 'gray';

const LINE = 1 / PixelRatio.get();

// 获取博文一页的容量
const pageSize = 10;

/*  属性确认
    schoolClassId要求是数字 */
const ClassBlogPostsListProps = {
    schoolClassId: PropTypes.number.isRequired,
};

const GetBlogApp = require('../DataHandler/BlogDetail/GetBlogApp');
const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

const CONFIG = [
    {
        type:'title',
        selectedIndex:0,
        data:[{
            title:'全部博文',
            value:'all'
        }, {
            title:'零回复博文',
            value:'no_comment'
        }, {
            title:'老师/助教',
            value:'tutor'
        }, {
            title:'学生',
            value:'student'
        }]
    }
];

/*
渲染选择框的三角形
*/
class Triangle extends React.Component {
    render() {
        let path;
        let fill;
        if (this.props.selected) {
            fill = COLOR_HIGH;
            path = new Path()
                .moveTo(T_WIDTH / 2, 0)
                .lineTo(0, T_HEIGHT)
                .lineTo(T_WIDTH, T_HEIGHT)
                .close();
        } else {
            fill = COLOR_NORMAL;
            path = new Path()
                .moveTo(0, 0)
                .lineTo(T_WIDTH, 0)
                .lineTo(T_WIDTH / 2, T_HEIGHT)
                .close();
        }
        return (
            <Surface width={T_WIDTH} height={T_HEIGHT}>
                <Shape d={path} stroke="#00000000" fill={fill} strokeWidth={0}/>
            </Surface>
        )
    }
}

/*
渲染下拉菜单按钮
*/
const TopMenuItem = (props) => {
    const onPress = () => {
        props.onClickDropDownMenu(props.index);
    };
    //console.log("topmenuitem: ", props.label, ' , ', props.index);
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View style={styles.item}>
                <Text style={props.selected ? styles.menuTextHigh : styles.menuText}>{props.label}</Text>
                <Triangle selected={props.selected}/>
            </View>
        </TouchableWithoutFeedback>
    );
};

const Subtitle = (props) => {
    let textStyle = props.selected ?
        [styles.tableItemText, styles.highlight, styles.marginHigh] :
        [styles.tableItemText, styles.margin];

    let rightTextStyle = props.selected ? [styles.tableItemText, styles.highlight] : styles.tableItemText;

    let onPress = () => {
        props.onSelectItem(props.index, props.subindex, props.data);
    }

    return (
        <TouchableHighlight onPress={onPress} underlayColor="#f5f5f5">
            <View style={styles.tableItem}>
                <View style={styles.row}>
                    {props.selected && <Check />}
                    <Text style={textStyle}>{props.data.title}</Text>
                </View>
                <Text style={rightTextStyle}>{props.data.subtitle}</Text>
            </View>
        </TouchableHighlight>
    );
};

const Check = () => {
    return (
        <Surface
            width={18}
            height={12}
        >
            <Group scale={0.03}>
                <Shape
                    fill={COLOR_HIGH}
                    d={`M494,52c-13-13-33-13-46,0L176,324L62,211c-13-13-33-13-46,0s-13,33,0,46l137,136c6,6,15,10,23,10s17-4,23-10L494,99
      C507,86,507,65,494,52z`}
                />
            </Group>
        </Surface>
    );
}


export default class ClassBlogPostsList extends Component {

    /**属性schoolClassId可能会改变，因此将其放到state中，在父组件改变schoolClassId后，调用
     * componentWillReceiveProps(nextProps)更新此state中的schoolClassId。
     */
    constructor(props) {
        super(props);
        let array = CONFIG;
        let top = [];
        let maxHeight = [];
        let subselected = [];
        let height = [];
        //最大高度
        const itemMaxHeight = parseInt((height - 80) * 0.8 / 43);

        for (let i = 0, c = array.length; i < c; ++i) {
            let item = array[i];
            top[i] = item.data[item.selectedIndex].title;
            maxHeight[i] = Math.min(item.data.length, itemMaxHeight) * 43;
            subselected[i] = item.selectedIndex;
            height[i] = new Animated.Value(0);
        };

        this.state = {
            top: top,                   // 下拉菜单使用的变量列表
            maxHeight: maxHeight,       // 下拉菜单使用的变量列表
            subselected: subselected,
            height: height,             // 下拉菜单使用的变量列表
            fadeInOpacity: new Animated.Value(0),  // 下拉菜单使用的变量
            selectedIndex: null,        // 下拉菜单使用的变量
            current: null,              // 下拉菜单使用的变量

            blogs: [],	                // 班级博客列表
            postCount: 0,               //班级博客总数
            schoolClassId: this.props.schoolClassId,
            filter: 'all',              // 筛选条件：'all' 'no_comment' 'tutor' 'student'
			loadStatus: 'not loading',  // 用于上拉加载的动画
			currentPageIndex: 1,        // 已加载的页数/序号，从1开始
            headerTop: new Animated.Value(0), // 用于向下滚动隐藏筛选条件的动画
            networkError: false,        // 加载失败时设置为true
        };

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

    createAnimation = (index, height) => {
        return Animated.timing(
            this.state.height[index],
            {
                toValue: height,
                duration: 250
            }
        );
    }

    createFade = (value) => {
        return Animated.timing(
            this.state.fadeInOpacity,
            {
                toValue: value,
                duration: 250,
            }
        );
    }

    /* 单击选择框时执行 */
    onSelect = (index) => {
        if (index === this.state.selectedIndex) {
            //消失
            //console.log("onSelect \n to hide func");
            this.hide(index);
        }
        else {
            //console.log("onSelect \n to onshow func");
            this.setState({selectedIndex: index, current: index});
            this.onShow(index);
        }
    }

    hide = (index, subselected) => {
        //console.log("hide func");
        let opts = {selectedIndex: null, current: index};
        if (subselected !== undefined) {
            this.state.subselected[index] = subselected;
            this.state.top[index] = CONFIG[index].data[subselected].title;
            opts = {selectedIndex: null, current: index, subselected: this.state.subselected.concat()};
        }
        this.setState(opts);
        this.onHide(index);
    }

    onShow = (index) => {
        Animated.parallel([this.createAnimation(index, this.state.maxHeight[index]), this.createFade(1)]).start();
    }

    onHide = (index) => {
        //其他的设置为0
        for (let i = 0, c = this.state.height.length; i < c; ++i) {
            if (index != i) {
                this.state.height[i].setValue(0);
            }
        }
        Animated.parallel([this.createAnimation(index, 0), this.createFade(0)]).start();
    }

    /* 单击下拉菜单中元素时执行 */
    onClickMenuItem = (index, subindex, data) => {
        this.hide(index, subindex);
        /* 更改选中的博文类型 */
        this.onChangedSelectType(data.value);
    }

    /* 渲染下拉菜单中的一列 */
    renderDropDownItem = (d, index) => {
        let subselected = this.state.subselected[index];
        let Comp = null;
        Comp = Subtitle;
        let enabled = this.state.selectedIndex == index || this.state.current == index;

        return (
            <Animated.View key={index} pointerEvents={enabled ? 'auto' : 'none'}
                           style={[styles.content, {opacity: enabled ? 1 : 0, height: this.state.height[index]}]}>
                <ScrollView style={styles.scroll}>
                    {d.data.map((data, subindex) => {
                        return <Comp
                            onSelectItem={this.onClickMenuItem}
                            index={index}
                            subindex={subindex}
                            data={data}
                            selected={subselected == subindex}
                            key={subindex}/>
                    })}
                </ScrollView>
            </Animated.View>
        );
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
            if (this._isMounted) {
                this.setState({loadStatus: 'not loading', networkError: true});
            }
        });
    }

    /** 解析this.state.blogs的数据，返回一个数组。 */
    makeBlogPostsList() {
        let data = [];
        for (let i in this.state.blogs) {
            data.push({
                blogId: this.state.blogs[i].url.match( /p\/([^%]+).html/)[1],//博文的编号
                title: this.state.blogs[i].title,
                url: this.state.blogs[i].url,
                description: this.state.blogs[i].description,
                postDate: this.state.blogs[i].dateAdded,
                viewCount: this.state.blogs[i].viewCount,
                commentCount: this.state.blogs[i].commentCount,
                author: this.state.blogs[i].author,
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

    /* 改变选中博文类型后执行的函数 */
    onChangedSelectType=(itemValue)=>{
        this.setState({filter: itemValue}, this.updateData());
    }

    render() {
        return (
            <View>{/* 需要使用View，不然FlatList无法显示 */}
                {/* 使用keyExtractor为每个item生成独有的key，就不必再data数组的每一个元素中添加key键。
                    refreshing设置为false在列表更新时不显示转圈*/}
                {/*item设置了立体的样式，这里去掉ItemSeparatorComponent={this._separator}*/}

                <View style={styles.topMenu}>
                    {this.state.top.map((t, index) => {
                        return <TopMenuItem
                            key={index}
                            index={index}
                            onClickDropDownMenu={this.onSelect}
                            label={t}
                            selected={this.state.selectedIndex === index}/>
                    })}
                </View>
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
                    ItemSeparatorComponent={this._itemSeparatorComponent}
                />
                <View style={styles.bgContainer} pointerEvents={this.state.selectedIndex !== null ? "auto" : "none"}>
                    <Animated.View style={[styles.bg, {opacity: this.state.fadeInOpacity}]}/>
                    {CONFIG.map((d, index) => {
                        return this.renderDropDownItem(d, index);
                    })}
                </View>
            </View>
        );
    }

    _itemSeparatorComponent(){
        return (
            <View style={flatStylesWithAvatar.separatorStyle}/>
        )
    }

    /**FlatList的renderItem */
    _renderItem = ({item}) => {
        const BlogApp = GetBlogApp(item.url);
		return(
            <View style={flatStylesWithAvatar.cell}>

                <TouchableOpacity
                    style = {flatStylesWithAvatar.listcontainer}
                    onPress = {() => {
                        this.props.navigation.navigate('BlogDetail',
                            {
                                Id:item.blogId,
                                blogApp: BlogApp,
                                CommentCount: item.commentCount,
                                Url: item.url,
                                Title: item.title,
                                Description: item.description,
                            });
                    }}
                >
                    <View style = {nameImageStyles.nameContainer}>
                        <Text style = {nameImageStyles.nameText}>
                            {BlogApp.slice(0, 2)}
                        </Text>
                    </View>
                    <View style={{flex: 1,}}>
                        <Text style={blogListStyles.blogTitleText} accessibilityLabel={item.url}>
                            {item.title}
                        </Text>

                        <Text numberOfLines={2} style={blogListStyles.blogSummaryText}>
                            {HTMLSpecialCharsDecode(item.description)}
                        </Text>

                        <View style={blogListStyles.blogAppAndTimeContainer}>
                            <Text style={styles.viewCountAndCommentCount}>
                                {item.viewCount + ' 阅读' + '  '
                                 + item.commentCount + ' 评论'}
                            </Text>
                            <Text style={styles.postDate}>
                                {item.author + ' 发布于 ' + this.parsePostDate(item.postDate)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
		)
    };

    /**根据设置返回要显示的时间 */
    parsePostDate(postDate) {
        if (global.settings.displayDetailTime) {
            return this.YMDInPostDate(postDate) + ' ' + this.timeInPostDate(postDate);
        } else {
            return this.YMDInPostDate(postDate);
        }
    }

    /**参数为‘2019-04-09T17:05:00+08:00’，返回字符串年月日 */
    YMDInPostDate(postDate) {
        return postDate.match(/\d{4}-\d{2}-\d{2}/)[0];
    }

    timeInPostDate(postDate) {
        return postDate.match(/(\d{2}:\d{2}):\d{2}/)[1];
    }

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
                        再往下拉也没有了呢
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
    scroll: {flex: 1, backgroundColor: '#fff'},
    bgContainer: {position: 'absolute', top: 40, width: screenWidth, height: screenHeight},
    bg: {flex: 1, backgroundColor: 'rgba(50,50,50,0.2)'},
    content: {
        position: 'absolute',
        width: screenWidth,
    },
    highlight: {
        color: COLOR_HIGH
    },
    marginHigh: {marginLeft: 10},
    margin: {marginLeft: 28},
    titleItem: {
        height: 43,
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomWidth: LINE,
        borderBottomColor: '#eee',
        flexDirection: 'row',
    },
    tableItem: {
        height: 43,
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomWidth: LINE,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tableItemText: {fontWeight: '300', fontSize: 14},
    row: {
        flexDirection: 'row'
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextHigh: {
        marginRight: 3,
        fontSize: 13,
        color: COLOR_HIGH
    },
    menuText: {
        marginRight: 3,
        fontSize: 13,
        color: COLOR_NORMAL
    },
    topMenu: {
        flexDirection: 'row',
        height: 40,
        borderTopWidth: LINE,
        borderTopColor: '#bdbdbd',
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2'
    },
    viewCountAndCommentCount: {
        fontSize: 10,
        textAlign: 'left',
        color: 'gray',
    },
    postDate: {
        fontSize: 10,
        textAlign: 'right',
        color: 'gray',
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
