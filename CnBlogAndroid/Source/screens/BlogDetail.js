import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,StorageKey} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import * as storage from '../Storage/storage.js'
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    AppRegistry,
    TouchableOpacity,
    FlatList,
    Dimensions,
    WebView,
    Image,
    Alert
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
import { Icon, Fab } from 'native-base';
import ShareButton from './Share';
const { height, width } = Dimensions.get('window');
const ContentHandler = require('../DataHandler/BlogDetail/ContentHandler');

// 传入博客Id和blogApp和CommentCount作为参数
export default class BlogDetail extends Component{
    constructor(props){
        super(props);
        this.state = {
            incognitoMode: false, // 是否是无痕模式
            maxHistory: 40, // 最大保存的历史记录长度
            content: '',
            isRequestSuccess: false,
            url: this.props.navigation.state.params.Url,
        }
    }
    _isMounted;
    componentWillMount = ()=>{
        this._isMounted=true;
        if(!this.state.incognitoMode){
            storageData = [];
            global.storage.load({key: StorageKey.BLOG_LIST})
            .then((ret)=>{
                storageData = ret;
            })
            .catch((err)=>{
                storageData = [];
            })
            .then(()=>{
                var thisData = [{
                    title: this.props.navigation.state.params.Title,
                    url: this.props.navigation.state.params.Url,
                    id: this.props.navigation.state.params.Id,
                    blogApp: this.props.navigation.state.params.blogApp,
                    commentCount: this.props.navigation.state.params.CommentCount,
                    summaryContent: this.props.navigation.state.params.Description,
                    addTime: '',
                }];
                // 合并结果并去重
                thisData = thisData.concat(storageData),//合并成一个数组
                temp = {}; //用于id判断重复
                result = []; //最后的新数组
                //遍历thisData数组，将每个item.id在temp中是否存在值做判断，
                thisData.map((item,index)=>{
                    if(!temp[item.id]){
                        result.push(item);
                        temp[item.id] = true
                    }
                })
                // 取出前N个结果储存
                storageData = result.slice(0, this.state.maxHistory);
                console.log('存储：' + JSON.stringify(storageData));
                global.storage.save({key: StorageKey.BLOG_LIST, data: storageData});
            })
        }

		let contenturl = Config.BlogDetail+this.props.navigation.state.params.Id+'/body';
        Service.Get(contenturl).then((jsonData)=>{
            if(jsonData!=='rejected'){
                this.setState({
                    isRequestSuccess: true,
                })
                if(this._isMounted){
                    this.setState({
                        content: jsonData,
                    })
                }
            }
        }).then(()=>{
			global.storage.save({key:StorageKey.BLOGDETAIL+this.props.navigation.state.params.Id,data:this.state.content})
			.catch((err)=>{
				ToastAndroid.show("error",ToastAndroid.SHORT);
			})
		})
		.catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
			global.storage.load({key:StorageKey.BLOGDETAIL+this.props.navigation.state.params.Id})
			.then((ret)=>{
				this.setState({
					content: ret,
				})
			})
			.catch((err)=>{
				ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT)
			})
        });
    }
    componentWillUnmount = ()=>{
        this._isMounted=false;
    }

    /** 评论的按钮的onPress */
    _onPress = ()=>{
        /* useURL为true表明参数Id不是博文Id而是博客Id，因API未返回博文Id，
           所以点击评论图标时屏蔽显示评论的功能，如果能够解决返回博文Id的问题，
           可以删掉第一个if语句。*/
        if (this.props.navigation.state.params.useURL) {
            Alert.alert('提示', 'API暂不支持，此功能敬请期待！');
            return;
        }
        this.props.navigation.navigate('BlogComment',{
            blogApp: this.props.navigation.state.params.blogApp,
            CommentCount: this.props.navigation.state.params.CommentCount+100,
            Id: this.props.navigation.state.params.Id,
        });
    }
    _onPressEdit = ()=>{
      if (global.user_information.BlogApp ===
        this.props.navigation.state.params.blogApp)
        {
          this.props.navigation.navigate('BlogEdition',{
            Id:this.props.navigation.state.params.Id,});
        }
    }

    _onPressBookmarks = ()=>{
        this.props.navigation.navigate('BlogBookmarks',{Url: this.props.navigation.state.params.Url,
            Title: this.props.navigation.state.params.Title});
    }

    /**选择博文内容来源。因为班级博文列表的API没有返回博文ID，只返回了URL。
     * 个人随便列表的API既返回了博文ID也返回了URL。而获取博文内容的API
     * 需要博文ID。使用此函数来选择如何获取博文内容。
     *
     * 使用API获取的博文内容更加美观，因此在有博文ID的情况下优先使用API，
     * 如果实在不能获得博文ID，可以在跳转到此页面时明确指出使用URL，
     * 传递参数{useURL: true}。使用博文ID是默认的，因此无需指出不使用URL，
     * 即传递参数{useURL: false}是可选的。*/
    _WebViewSourceParams() {
        let content = ContentHandler(this.state);
        if (this.props.navigation.state.params.useURL) {
            return {uri: this.props.navigation.state.params.Url};
        } else {
            return {
                html: content,
                baseUrl: this.props.navigation.state.params.Url
            };
        }
    }

    render(){
        return(
            <View style = {styles.container}>
                <View
                    style= {{
                        alignSelf: 'stretch',
                        flex:1,
                    }}
                >
                <WebView
                    source={this._WebViewSourceParams()}
                    style={{height: height-70}}
                    startInLoadingState={true}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    scalesPageToFit={true}
                    onError = {()=>Alert.alert('网络异常，请稍后再试！')}
                />
                </View>
                <View style = {{height: 1, backgroundColor: 'rgb(204,204,204)', alignSelf:'stretch'}}/>
                <View style = {styles.bottom}>
                    <TouchableOpacity style = {styles.touchbutton} onPress = {this._onPress}>
                        <Image source = {require('../images/comment.png')} style = {styles.imagestyle}
                        accessibilityLabel = 'BlogDetail_commentImage'/>

                    </TouchableOpacity>
                    {
                        /* 无相关API支持，本功能暂时搁置 */
                        (global.user_information.BlogApp !==
                        this.props.navigation.state.params.blogApp)
                        ?(null): (null)
                          /*
                          <View>
                            <TouchableOpacity style = {styles.touchbutton}
                              onPress = {this._onPressEdit}>
                                <Image source =
                                {require('../images/editBlog.png')}
                                style = {styles.imagestyle}
                                accessibilityLabel = 'BlogDetail_editImage'/>

                            </TouchableOpacity>
                          </View>
                           */
                    }
                    <TouchableOpacity style = {styles.touchbutton}
                      onPress = {this._onPressBookmarks}>
                        <Image source =
                        {require('../images/bookmarks.png')}
                        style = {styles.imagestyle}
                        accessibilityLabel = 'BlogDetail_markImage'/>

                    </TouchableOpacity>
                    <ShareButton
                        iconStyle={1}
                        url={this.state.url}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        flex:1,
        alignSelf: 'stretch',
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: height/14,
        width: width,
        backgroundColor: 'white'
    },
    touchbutton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: height/14,
        height: height/14,
    },
    imagestyle: {
        width: height/18,
        height: height/22,
        resizeMode: 'stretch',
    }
})
