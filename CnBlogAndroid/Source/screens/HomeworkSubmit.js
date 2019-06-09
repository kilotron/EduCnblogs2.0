import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config';
import * as Service from '../request/request.js';
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import * as umengPush from '../umeng/umengPush'
import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { String } from 'core-js/library/web/timers';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;



export default class HomeworkSubmit extends Component {
    constructor(props){
        super(props);
        this.state = {
            pageSize: 0,
            postCount: 0,
            blogs: [],
            isSubmitted: false,
            memberId:-1,
            currentSubmit:null,
        }
    }
    _isMounted;
    componentWillUnmount= () => {
        this._isMounted = false;
    }

    jsonIsEmpty(jsonData){
        for(var x in jsonData){
            return false;
        }
        return true;
    }
    initSubmit = async () =>{
        let {homeworkId, classId} = this.props.navigation.state.params;
        //获取blogId
        let blogId = global.user_information.BlogId;
        if(blogId == -1 || blogId == 0){
            let userUrl = Config.apiDomain + api.user.info;
            blogId = await Service.Get(userUrl).then((jsonData)=>{
                                if(jsonData == 'rejected') return null;
                                return jsonData.BlogId;
                            }).catch(()=>{return null;});
            if(blogId == null) return -1;
        }
        //获取memberId
        let memberUrl = Config.apiDomain+"api/edu/member/"+blogId+"/"+classId;
        var memberInfo = await Service.Get(memberUrl).then((jsonData)=>{
                                if(jsonData == 'rejected') return {};
                                    return jsonData;
                                }).catch(()=>{return null;});
        if(this.jsonIsEmpty(memberInfo)) return -1;
        let memberId = memberInfo.memberId;
        //获取是否提交的信息
        let submitUrl = Config.SubmitJudge + memberId + '/' + homeworkId;
        let isSubmitted = await Service.Get(submitUrl).then((bool)=>{
                                    if(bool == 'rejected') return false;
                                    return bool;
                                }).catch(()=>{return null;});
        if(isSubmitted == null) {isSubmitted = false};
        
        /*submitContent示例
        {
            "answerId”：2，
            “title"："软件工程-构建之法团队”，
            “url”："http://www.cnblogs.com/1isiyu/p/5419159.html"，
            "remark"：null，
            "score"：null，"entryId"：23，
            "suggestion"：nul1，
            "dateAdded"："2017-09-02T19：07：16.1649235"
        }
        */
        if(isSubmitted){
            let submitContentUrl = Config.Edu + 'answer/' + memberId + '/' + homeworkId;
            var submitContent = await Service.Get(submitContentUrl).then((jsonData)=>{
                                        if(jsonData == 'rejected') return {}
                                        return jsonData;
                                    }).catch(()=>{return null;});
        }
        if(submitContent == null || this.jsonIsEmpty(submitContent)) {
            submitContent = null;
        }
        this.setState({
            memberId:memberId,
            isSubmitted:isSubmitted,
            currentSubmit:submitContent,
        })
    }


    componentDidMount = () => {
        this._isMounted = true;
        let blogApp = global.user_information.BlogApp;
        let url = Config.apiDomain+'api/blogs/'+blogApp;
        this.initSubmit()
        .then(()=>{
            Service.Get(url)
            .then((jsonData)=>{
                if(this._isMounted)
                {
                    this.setState({
                        pageSize: jsonData.pageSize,
                        postCount: jsonData.postCount,
                    });
                }
            })
            .then(()=>{
                let {pageSize, postCount} = this.state;
                let pageCount  = Math.ceil(postCount/pageSize);
                var pageIndexes = [];
                for(var pageIndex = 1; pageIndex <= pageCount; pageIndex++)
                {
                    pageIndexes.push(pageIndex);
                }
                return promises = pageIndexes.map((pageIndex)=>{
                    return Service.Get(Config.apiDomain+'api/blogs/'+blogApp+'/posts?pageIndex='+pageIndex)
                })
            })
            .then((promises)=>{
                Promise.all(promises).then((posts)=>{
                    for(var i in posts)
                    {
                        if(this._isMounted)
                        {
                            this.setState({
                                blogs: this.state.blogs.concat(posts[i]),
                            })
                        }
                    }
                })
            })
        })
        .catch((error) => {
            ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT);
        })
    }
    onSubmit = (postId, title, url, homeworkId, classId)=>{
        let submitUrl = 'https://api.cnblogs.com/api/edu/answer/commit';
        let postBody = {
            schoolClassId: Number(classId),
            homeworkId: Number(homeworkId),
            title: title,
            url: url,
            postId: Number(postId),
            remark: '',
        };
        let body = JSON.stringify(postBody);
        if(!this.state.isSubmitted){
            Alert.alert(
                '提交博文：',
                title,
                [
                    {text: '取消'},
                    {text: '确认提交', onPress: ()=>{
                        Service.UserAction(submitUrl, body, 'POST')
                        .then((response)=>{
                            if(response.status !== 200)
                                return null;
                            else
                                return response.json();
                        })
                        .then((jsonData)=>{
                            if(jsonData==null)
                                ToastAndroid.show("请求失败，您的身份可能不对！",ToastAndroid.SHORT);
                            else if(jsonData.isSuccess)
                            {
                                umengPush.deleteHomeworkTag(postBody.schoolClassId,postBody.homeworkId);
                                ToastAndroid.show('提交成功，请刷新查看！',ToastAndroid.SHORT);
                                this.props.navigation.goBack();
                            }
                            else if(jsonData.isWarning)
                                ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
                            else
                                ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                        }).catch((error)=>{ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT)})
                    }},
                ]
            )
        }
        else{
            if(this.state.currentSubmit == null){
                ToastAndroid.show("获取已提交作业失败，无法修改作业，抱歉");
                return;
            }
            let answerId = this.state.currentSubmit.answerId;
            let modifyUrl = 'https://api.cnblogs.com/api/edu/answer/modify/' + answerId;
            body.answerId = answerId;
            Alert.alert(
                '修改提交：',
                title,
                [
                    {text: '取消'},
                    {text: '确认修改', onPress: ()=>{
                        Service.UserAction(modifyUrl, body, 'PATCH')
                        .then((response)=>{
                            if(response.status !== 200)
                                return null;
                            else
                                return response.json();
                        })
                        .then((jsonData)=>{
                            if(jsonData==null)
                                ToastAndroid.show("请求失败，您的身份可能不对！",ToastAndroid.SHORT);
                            else if(jsonData.isSuccess)
                            {
                                umengPush.deleteHomeworkTag(postBody.schoolClassId,postBody.homeworkId);
                                ToastAndroid.show('修改成功，请刷新查看！',ToastAndroid.SHORT);
                                this.props.navigation.goBack();
                            }
                            else if(jsonData.isWarning)
                                ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
                            else
                                ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                        }).catch((error)=>{ToastAndroid.show("网络请求失败，请检查连接状态！",ToastAndroid.SHORT)})
                    }},
                ]
            )
        }
    }
    _renderItem = (item) => {
        let {postId, title, url} = item.item;
        let {homeworkId, classId} = this.props.navigation.state.params;
        return (
            <View>
            <TouchableOpacity
                style = {styles.listcontainer}
                onPress = {()=>this.onSubmit(postId, title, url, homeworkId, classId)}
            >
                <Text style = {{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 10,
                    marginBottom: 10,
                    textAlign: 'left',
                    color: 'black',
                    fontFamily : 'serif',
                }}>
                    {title}
                </Text>
            </TouchableOpacity>
            </View>
        )
    }
    _separator = () => {
        return (
            <View style={{ height: 1, backgroundColor: 'rgb(200,200,200)'}}/>
        );
    }
    renderSubmitted(){
        if(!this.state.isSubmitted) return (<View></View>);
        if(this.state.currentSubmit == null){
            return (
            <View>
                <Text>当前已提交作业，无法获取提交作业信息</Text>
            </View>
            );
        }
        return (
            <View>
                <Text>当前已提交：{this.state.currentSubmit.title}</Text>
            </View>
        );
    }
    render(){
        var data = [];
        for(var i in this.state.blogs)
        {
            data.push({
                key: i,
                postId: this.state.blogs[i].Id,
                title: this.state.blogs[i].Title,
                url: this.state.blogs[i].Url,
            })
        }
        return(
            <View style = {styles.container}>
                <View style = {styles.content}>
                    {this.renderSubmitted()}
                    <FlatList
                        ItemSeparatorComponent={this._separator}
                        renderItem={this._renderItem}
                        data={data}
                        refreshing= {false}
                        ListFooterComponent={this._separator}
                    />
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
    content: {
        flex: 11,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: screenWidth,
    },
    listcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        width: screenWidth,
        backgroundColor: 'white',
        paddingLeft: 0.03*screenWidth,
        paddingRight: 0.04*screenWidth,
    }
});