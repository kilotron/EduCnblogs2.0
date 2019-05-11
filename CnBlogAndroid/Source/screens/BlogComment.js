import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import {err_info} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import {Fab } from 'native-base';
import React, { Component} from 'react';
import {
    StyleSheet,
    View,
    WebView,
    ToastAndroid,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    FlatList,
    Button,
    Alert
} from 'react-native';
import {ListItem, Thumbnail, Text, Body, Left, Right} from 'native-base';
import {
    StackNavigator,
    TabNavigator,
} from 'react-navigation';
 import Markdown from 'react-native-easy-markdown';
 import HTMLView from 'react-native-htmlview'; 
//import Markdown from 'react-native-simple-markdown';
const CommentHandler = require('../DataHandler/BlogComment/CommentHandler');
const ItemHandler = require('../DataHandler/BlogComment/ItemHandler');
const getComments = require('../DataHandler/BlogComment/getComments');
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
var Authors = [];
const HTMLSpecialCharsDecode = require('../DataHandler/HTMLSpecialCharsDecode');

// 博客评论页面
// 接受评论数量 CommentCount 和 博客名 blogApp 以及博文Id作为参数
// 这里定义一个用于粗略解决返回的评论字符串内包含无法解析的html标签的函数
export default class BlogComment extends Component{
    constructor(props){
        super(props);
        this.state = {
            comments: [],
            isRequestSuccess: false,//初始认为页面请求失败，不渲染，否则会由于网络问题导致crash
        }
    }

    _isMounted;
    componentWillMount=()=>{
        this._isMounted=true;
        //let url = 'https://api.cnblogs.com/api/blogs/'+this.props.navigation.state.params.blogApp
        let url = Config.BlogComment + this.props.navigation.state.params.blogApp
                +'/posts/'+this.props.navigation.state.params.Id+'/comments?pageIndex=1&pageSize='
                +this.props.navigation.state.params.CommentCount;
                
        Service.Get(url).then((jsonData)=>{
            if(jsonData!=='rejected')
            {
                this.setState({
                    isRequestSuccess: true,
                })
                if(this._isMounted){
                    this.setState({
                    comments: jsonData,
                })}
            }
        }).catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
        });
    }
    componentWillUnmount=()=>{
        this._isMounted=false;
    }
    UpdateData = ()=>{
        this.setState({
            isRequestSuccess: false,
        });
        this.componentWillMount();
    }
    _separator = () => {
        return <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }}/>;
    }
    /**
     * 有哪些标签需要进行转义
     * <b></b> => ** ** 
     * <a href ="url">description</a> => [description](url)
     * [code=java]some code[/code] => ``` some code ```
     * <img src = "url" border="0" onload="..."/> => ![图片](url)
     *  1. 根据<img src="url" 获取url
     *  2. 将<img *...>替换成![图片](url)
     * <fieldset class = "comment_quote"><legend>引用</legend>
     * 
     */
    _renderItem = (item)=>{
        let item1 = item;
        item = ItemHandler(item);
        let {key,Bodys,Author,DateAdded,AuthorUrl,FaceUrl} = item;
        //FaceUrl = FaceUrlHandler();
        const htmlContent = `<p><a href="http://jsdf.co">&hearts; nice job!</a></p>`;       
        return(
            <ListItem avatar
                onPress={()=>this.props.navigation.navigate
                    ('CommentAdd',{
                        blogApp: this.props.navigation.state.params.blogApp,
                        Id: this.props.navigation.state.params.Id,
                        CommentCount: this.props.navigation.state.params.CommentCount,
                        Author: Author,
                        Authors: Authors
                    })
                }
            >
              <Left>
                <Thumbnail  source={FaceUrl?{uri:FaceUrl}:require('../images/defaultface.png')} />
              </Left>
              <Body>
                <Text>{Author}</Text>
                {/* <Text note>{HTMLSpecialCharsDecode(Bodys)}</Text> */}
                <Markdown>
                {
                        HTMLSpecialCharsDecode(Bodys)
                }
                </Markdown>
                {/* TODO 删掉下面的测试 */}
                 {/* <Markdown styles={markdownStyles}>
                    # --Markdown--  {'\n\n'}
                    [超链接](http://www.jianshu.com) {'\n\n'}
                    ![图片](https://upload.jianshu.io/users/upload_avatars/5847426/d79b9d30-0c75-43a6-8372-711deae3ce52.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/240/h/240)
                    You can **emphasize** what you want, or just _suggest it_ 😏…{'\n'}
                    {HTMLSpecialCharsDecode(Bodys)}
                </Markdown>  */}
                {/* <HTMLView
                    value={htmlContent2}
                    stylesheet={styles}
                /> */}
                {/* <WebView
                    source={htmlContent2}
                    style={{width:'50%',height:'50%'}}
                    javaScriptEnabled={true}
                /> */}
                <Text style = {{fontSize: 10, textAlign: 'right', color: 'gray'}}>{'评论于: '+DateAdded.split('T')[0]+' '+DateAdded.split('T')[1].substring(0,8)}</Text>
              </Body>
            </ListItem>
        )
    }
    render(){
        var tempVar = getComments(this.state);
        Authors = tempVar.Authors;
        var data = tempVar.data;
        return (
            <View style = {styles.container}>
                <View
                    style= {{
                        flexDirection: 'row',
                        justifyContent:'flex-start',
                        alignItems: 'flex-start',
                        alignSelf: 'stretch',
                        flex:1,
                    }}
                >
                    <FlatList
                        ItemSeparatorComponent={this._separator}
                        ListFooterComponent={this._separator}
                        renderItem={this._renderItem}
                        data={data}
                        onRefresh = {this.UpdateData}
                        refreshing= {false}
                    />
                </View>
                {/*this.state.isRequestSuccess===false?null:
                <TouchableOpacity
                    style= {styles.button}
                    onPress={()=>this.props.navigation.navigate('CommentAdd',
                            {blogApp: this.props.navigation.state.params.blogApp,
                            Id: this.props.navigation.state.params.Id,
                            CommentCount: this.props.navigation.state.params.CommentCount,
                            Author: '',
                            Authors: Authors})}
                >
                   <Text style = {{fontSize: 20, color: 'rgb(51,51,51)'}} accessibilityLabel = 'BlogComment_addreplyComment'>添加评论</Text>
                </TouchableOpacity>
                            */}
                <Fab
                    active={true}
                    direction="up"
                    style={{ backgroundColor: '#5067FF' }}
                    position="bottomRight"
                    onPress={()=>this.props.navigation.navigate('CommentAdd',{
                        blogApp: this.props.navigation.state.params.blogApp,
                        Id: this.props.navigation.state.params.Id,
                        CommentCount: this.props.navigation.state.params.CommentCount,
                        Author: '',
                        Authors: Authors
                    })}
                >
                <Image
                    source={require('../images/add.png')}
                    style={{height: 20}}
                    resizeMode = 'contain'
                />
                </Fab>
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
    listcontainer: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        backgroundColor: 'white',
        alignSelf: 'stretch',
        marginLeft: 8,
        marginRight: 12,
        marginVertical: 8,
    },
    facestyle: {
        width: 40,
        height: 40,
        marginTop: 5,
    },
    textcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex: 6,
        backgroundColor: 'white',
    },
    button: {
        height: screenHeight/14,
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        backgroundColor: '#1C86EE',
    }
});
