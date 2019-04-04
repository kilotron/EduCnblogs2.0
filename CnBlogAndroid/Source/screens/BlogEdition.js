import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,StorageKey} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
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
    Image,
    Alert,
    TextInput,
    Button
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';
import { Icon, Fab } from 'native-base';
const { height, width } = Dimensions.get('window');
const ContentHandler = require('../DataHandler/BlogDetail/ContentHandler');
// 传入博客Id和blogApp和CommentCount作为参数
export default class BlogEdition extends Component{
    constructor(props){
        super(props);
        this.state = {
            isRequestSuccess: false,
            editPosts_URL : [
                'https://i.cnblogs.com/EditPosts.aspx?postid=',
                this.props.navigation.state.params.Id
              ].join(''),
            htmlText: 'default',
            postTitle: '博客主题...',
            postBody: '博客正文...',
        }
    }
    _isMounted;

    componentDidMount = ()=>{
      fetch(this.state.editPosts_URL).then((response)=>{
        this.setState({htmlText: response._bodyText});
        console.log(this.state.htmlText);
        //console.log(response);
      })
      .catch((error)=>{
          console.log(error);
      });
    }


    componentWillUnmount = ()=>{
        this._isMounted=false;
    }

    _uploadImg = ()=>{
        console.log('上载图片');
    }

    render(){
        //console.log(this.state.editPosts_URL);
        //console.log(storage.getItem(StorageKey.USER_TOKEN));
        return(
            //this.state.isRequestSuccess===false?null:
            <View style = {styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.promptText}>博客主题</Text>
                    <TextInput style={styles.blogTitle}
                				placeholder={this.state.postTitle}>
                    </TextInput>
                </View>
                <View style={styles.detailView}>
                    <Text style={styles.promptText}>博客正文</Text>
                    <TouchableOpacity style = {styles.touchbutton} onPress = {this._uploadImg}>
                        <Image source = {require('../images/uploadImg.png')} style = {styles.imagestyle}
                        accessibilityLabel = 'BlogDetail_uploadImgImage'/>
                    </TouchableOpacity>
                    <TextInput style={styles.blogDetail} multiline={true}
                				placeholder={this.state.postBody}>
                    </TextInput>
                </View>
                <Button style={styles.commitBtn}
          				title='提交修改'
          				onPress={() => Alert.alert('提交修改', null, null)} >
          			</Button>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex:1,
        justifyContent: 'center',
	      alignItems: 'stretch',
        alignSelf: 'stretch',
    },
    titleView: {
        flex: 1,
    },
    detailView:{
        flex: 8,
    },
    commitBtn: {
        flex: 1,
    },
    promptText: {
        fontSize: 12,
        color: 'gray',
    },
    blogTitle: {
        borderColor: 'gray',
        borderRadius: 10
    },
    imagestyle: {
      width: height/18,
      height: height/22,
      resizeMode: 'stretch',
    },
    blogDetail: {
        flex: 1,
        borderColor: 'gray',
        borderRadius: 10
    },
})
