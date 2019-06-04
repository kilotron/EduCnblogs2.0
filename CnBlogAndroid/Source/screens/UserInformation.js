import Config from '../config';
import api from '../api/api.js';
import {authData,StorageKey,err_info,UI} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
//关于cookie包的配置方法，请看https://github.com/joeferraro/react-native-cookies
import CookieManager from 'react-native-cookies'
import * as storage from '../Storage/storage.js'
import * as umengPush from '../umeng/umengPush'
import * as Push from '../DataHandler/Push/PushHandler'; 
import BlogURL from '../component/BlogURL';
import TouchableTextWithIcon from '../component/TouchableTextWithIcon';
import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    Switch,
    TouchableHighlight,
    ScrollView
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
    NavigationActions,
    withNavigationFocus,
} from 'react-navigation';
import { homeTabHeaderHeight } from '../styles/theme-context';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;

class UserInformation extends Component{
    constructor(props){
        super(props);
        this.state={
            faceurl:'',
            DisplayName: '',
            BlogApp: '',
            Seniority: '',
        }
    }

    _logout=()=>{
        // 简单的清空浏览记录
        global.storage.save({key: StorageKey.BLOG_LIST, data: []});
        storage.removeItem(StorageKey.RECEIVE_PUSH).then(
            storage.removeItem(StorageKey.USER_TOKEN).then((res)=>{
                CookieManager.clearAll()
                .then((res)=>{
                    umengPush.deleteAllTags();
    //                this.props.navigation.navigate('Loginer');
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'Loginer'}),
                        ]
                    });
                    this.props.navigation.dispatch(resetAction);
                })
            })
        )
    }
    _isMounted;
    componentWillUnmount=()=>{
        this._isMounted=false;
    }

    componentWillMount=()=>{
        this._isMounted=true;
        let user_url = Config.apiDomain + api.user.info;
        Service.Get(user_url)
        .then((jsonData)=>{
            global.user_information = {
                userId : jsonData.UserId,
                SpaceUserId : jsonData.SpaceUserId,
                BlogId : jsonData.BlogId,
                DisplayName : jsonData.DisplayName,
                face : jsonData.Face,
                Seniority : jsonData.Seniority,  //园龄
                BlogApp : jsonData.BlogApp
            }
        })
        .then(()=>{
            if(this._isMounted){
            this.setState({
                faceurl: global.user_information.face,
                DisplayName: global.user_information.DisplayName,
                BlogApp: global.user_information.BlogApp,
                Seniority: global.user_information.Seniority,
            })}
        }).then(()=>{
            global.storage.save({key:StorageKey.DISPLAYNAME,data:this.state.DisplayName});
        }).then(()=>{
            global.storage.save({key:StorageKey.BLOGAPP,data:this.state.BlogApp});
        }).then(()=>{
            global.storage.save({key:StorageKey.SENIORITY,data:this.state.Seniority});
        })
        .catch((error)=>{
            ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT)
            global.storage.load({key:StorageKey.DISPLAYNAME})
            .then((ret)=>{
                this.setState({
                    DisplayName : ret,
                })
            }).then(()=>{
                global.storage.load({key:StorageKey.BLOGAPP})
                .then((ret)=>{
                    this.setState({
                        BlogApp : ret,
                    })
                })
            }).then(()=>{
                global.storage.load({key:StorageKey.SENIORITY})
                .then((ret)=>{
                    this.setState({
                        Seniority : ret,
                        faceurl : '',
                    })
                })
            })
            .catch((err)=>{
                ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
                this.props.navigation.navigate('Loginer');
            })
        })
    }

    /**从版本号中启动设置功能，需要调用此函数重新render */
    rerender = () => {
        this.forceUpdate();
    }

    render() {
    let blogUrl = this.state.BlogApp == null || this.state.BlogApp == '' ? '您尚未开通博客主页' : 'https://www.cnblogs.com/' + this.state.BlogApp;
    return (
        <ScrollView contentContainerStyle={{flex: 1, backgroundColor: global.theme.backgroundColor,}}>
        <View
            style= {{
                flexDirection: 'column',
                flex: 1,
                backgroundColor: global.theme.BackgroundColor,
            }}
        >
            <View style= {{
                flexDirection: 'row',
                justifyContent:'center',
                alignItems: 'center',
                backgroundColor: global.theme.headerBackgroundColor,
                height: homeTabHeaderHeight,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'normal', color:global.theme.headerTintColor}}>
                    个人信息
                </Text>
            </View>
            <View style={{ height: 0.75, backgroundColor: global.theme.seperatorColor}}/>
            <View style= {{
                flexDirection: 'row',
                justifyContent:'flex-start',
                alignItems: 'center',
                marginBottom: 0.005*screenHeight,
                backgroundColor: global.theme.backgroundColor,
                height: 0.15*screenHeight,
                paddingLeft: 0.05*screenWidth,
            }}
            >
                <Image
                    style= {{
                        width: 0.1*screenHeight,
                        height: 0.1*screenHeight,
                    }}
                    source={{uri: this.state.faceurl?this.state.faceurl:'../images/defaultface.png'}}
                />
                <View style = {{justifyContent: 'center',paddingLeft: 0.07*screenWidth,}}>
                    <Text style = {{fontSize: 18, fontWeight: 'bold',color: global.theme.textColor}}>{this.state.DisplayName}</Text>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: global.theme.seniorityBackgroundColor, 
                        borderRadius: 10, 
                        padding: 5,
                        paddingHorizontal: 10,
                        marginTop: 5,}}
                    >
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: global.theme.seniorityForegroundColor, 
                            borderRadius: 8, 
                            marginRight: 5,
                            height: 16, 
                            width: 16,
                        }}
                        >
                        <Image source={require('../images/heart_solid.png')}
                            resizeMode='contain'
                            style={{height: 11, width: 11}}
                            tintColor='#FFF'
                        />
                        </View>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: global.theme.seniorityForegroundColor, 
                        }}>{'园龄：' + this.state.Seniority}</Text>
                    </View>
                </View>
            </View>
            <BlogURL blogURL={blogUrl}/>
            <TouchableTextWithIcon
                text='日程提醒'
                imageSource={require('../images/calendar_transparent.png')}
                imageBackgroundColor={global.theme.calendarIconBackgroundColor}
                imageTintColor={global.theme.calendarIconTintColor}
                onPress={() => {this.props.navigation.navigate('ScheduleReminding')}}
            />
            <TouchableTextWithIcon
                text='收藏列表'
                imageSource={require('../images/star.png')}
                imageBackgroundColor={global.theme.bookmarkIconBackgroundColor}
                imageTintColor={global.theme.bookmarkIconTintColor}
                onPress={() => {this.props.navigation.navigate('BookmarksList')}}
            />
            <TouchableTextWithIcon
                text='浏览记录'
                imageSource={require('../images/clock.png')}
                imageBackgroundColor={global.theme.historyIconBackgroundColor}
                imageTintColor={global.theme.historyIconTintColor}
                onPress={() => {this.props.navigation.navigate('HistoryList')}}
            />
            <TouchableTextWithIcon
                text='设置'
                imageSource={require('../images/setting_transparent.png')}
                imageBackgroundColor={global.theme.settingIconBackgroundColor}
                imageTintColor={global.theme.settingIconTintColor}
                onPress={() => {this.props.navigation.navigate('Settings')}}
            />
            <TouchableTextWithIcon
                text='关于App'
                imageSource={require('../images/info.png')}
                imageBackgroundColor={global.theme.aboutIconBackgroundColor}
                imageTintColor={global.theme.aboutIconTintColor}
                onPress={() => {this.props.navigation.navigate('AppInformation', {
                        callback: this.rerender,
                    }
                )}}
            />
            <TouchableTextWithIcon
                text='退出登录'
                imageSource={require('../images/exit.png')}
                imageBackgroundColor={global.theme.logoutIconBackgroundColor}
                imageTintColor={global.theme.logoutIconTintColor}
                onPress={this._logout.bind(this)}
                textColor='#DD4242'
            />
        </View>
        </ScrollView>
    );
  }
}

export default withNavigationFocus(UserInformation);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
