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
    Animated,
    ActivityIndicator,
} from 'react-native';

const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

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
            headerTop: new Animated.Value(0), // 用于向下滚动隐藏筛选条件的动画
            networkError: false,
        }

        /* 下面两个变量用于向下滚动隐藏筛选条件的动画。动画设置的参考链接ClassBlogPostList末尾。 */
        this.top = this.state.headerTop.interpolate({
            inputRange: [0, 270, 271, 280],
            outputRange: [0, -50, -50, -50]
        });
        this.animatedEvent = Animated.event(
            [{
                nativeEvent: {
                    contentOffset: { y: this.state.headerTop }
                }
            }]
        );
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

    updateData() {
        this.setState({
            votes: [],
            loadStatus: 'not loading',  // 用于上拉加载的动画
            totalCount: 0,
            currentPageIndex: 1,        // 已加载的页数/序号，从1开始
        }, () => { this.fetchPage(this.state.currentPageIndex) });
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
                <View>
                    {/** 网络未连接，暂时没有实现 */}
                    {/*      <TouchableOpacity onPress={() => {
                        ToastAndroid.show('This is a dinosaur.', ToastAndroid.SHORT);
                    }}>
                        <Image
                            style={styles.dinosaurPic}
                            source={require('../images/dinosaur.jpg')}
                        />
                    </TouchableOpacity>
                    <Text style={styles.dinosaurText}>未连接到互联网</Text>
                */} </View>
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


    _renderItem = ({ item }) => {
        return (
            <View style={styles.cellStyle}>
                <TouchableOpacity
                    style={flatStyles.listContainer}
                    onPress={() => {
                        this.props.navigation.navigate('VoteDetail', //获取详细信息
                            {
                                voteId: item.voteId,
                            });
                    }}
                >
                    <Text style={styles.postTitle}
                        accessibilityLabel={item.url}>
                        {item.name}
                    </Text>

                    <Text numberOfLines={3} style={styles.postDescription}>
                        {HTMLSpecialCharsDecode(item.description)}
                    </Text>

                    <View style={styles.postMetadataView}>
                        <Text style={styles.viewCountAndCommentCount}>
                            {item.voteCount + '投票人数' + '  '
                                //+ item.commentCount + ' 评论'
                            }
                        </Text>
                        <Text style={styles.postDate}>
                            {'发布于: ' + item.dateAdded.split('T')[0] + ' '
                                + item.dateAdded.split('T')[1]}
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
                    <Text style={styles.allLoadedText}>
                        没有更多数据了
                </Text>
                </View>
            );
        } else if (this.state.loadStatus === 'loading') {
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

    onPress2AddVote() {
        this.props.navigation.navigate('VoteAdd', {
            classId: this.state.classId,
            //callback: this.UpdateData, 暂时不知道干嘛的
        });
        /* this.props.navigation.navigate('VoteDetail', //获取详细信息
        {
            voteId: 1,
        }); */
    }

    GetAddButton() {
        return (
            <TouchableHighlight
                underlayColor="#3b50ce"
                activeOpacity={0.5}
                style={styles.addButton}
                onPress={this.onPress2AddVote.bind(this)} >
                <Text style={styles.buttonContent}>
                    +
                </Text>
            </TouchableHighlight>
        );
    }

    render() {
        return (
            <View style={styles.container}>

                <Animated.View style={{ top: this.top }}>
                    <View>
                        {/* 需要使用View，不然FlatList无法显示 */}
                        {/* 使用keyExtractor为每个item生成独有的key，就不必再data数组的每一个元素中添加key键。
                            refreshing设置为false在列表更新时不显示转圈*/}
                        {/*item设置了立体的样式，这里去掉ItemSeparatorComponent={this._separator}*/}
                        {
                            this.state.loadStatus === 'none' ?
                                (
                                    <View style={styles.footer}>
                                        <Text>暂时没有投票</Text>
                                    </View>
                                ) : (null)
                        }
                        {<FlatList
                            renderItem={this._renderItem}
                            data={this.makeVotesList()}
                            keyExtractor={(item, index) => index.toString()}
                            onRefresh={this.updateData.bind(this)}
                            refreshing={false}
                            onEndReached={this._onEndReached.bind(this)}
                            onEndReachedThreshold={0.5}
                            //ListEmptyComponent={this._renderEmptyList.bind(this)}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onScroll={this.animatedEvent}

                        />}


                    </View>
                </Animated.View>

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
    cellStyle: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        paddingVertical: 10,
        marginLeft: 5,
        marginRight: 5,
        marginVertical: 3,
        borderColor: '#dddddd',
        borderStyle: null,
        borderWidth: 0.5,
        borderRadius: 2,
        shadowColor: 'gray',    // 设置阴影
        shadowOffset: { width: 0.5, height: 0.5 },
        shadowOpacity: 0.4,   // 透明度
        shadowRadius: 1,
        elevation: 3   //   高度，设置Z轴，可以产生立体效果
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

// module.exports = VoteHandler;