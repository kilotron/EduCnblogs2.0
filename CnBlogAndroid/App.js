import {url} from 'url'
import Config from './Source/config';
import api from './Source/api/api.js';
import {authData,err_info} from './Source/config'
import {StorageKey} from './Source/config'
import {UI} from './Source/config'
import * as Service from './Source/request/request.js'
import * as storage from './Source/Storage/storage.js'
import fetch from 'react-native-fetch-polyfill'
import React, { Component,} from 'react';
import CookieManager from 'react-native-cookies'
import { Icon } from 'native-base';
import * as umengAnalysis from './Source/umeng/umengAnalysis'
import * as umengPush from './Source/umeng/umengPush'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
    Platform,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    AppRegistry,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    WebView,
    AsyncStorage,
    Alert,
    BackHandler,
    DeviceEventEmitter,
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
    NavigationActions
} from 'react-navigation';

import ClassFunction from './Source/screens/ClassFunction'
import HomeworkDetail from './Source/screens/HomeworkDetail'
import HomeworkLists from './Source/screens/HomeworkLists'
import PersonalBlog from './Source/screens/PersonalBlog'
import ClassLists from './Source/screens/ClassLists'
import UserInformation from './Source/screens/UserInformation'
import ClassListsNew from './Source/screens/ClassListsNew'
import ClassHome from './Source/screens/ClassHome'
import HomeworkPost from './Source/screens/HomeworkPost'
import HomeworkEdition from './Source/screens/HomeworkEdition'
import BlogDetail from './Source/screens/BlogDetail'
import BlogComment from './Source/screens/BlogComment'
import BlogBookmarks from './Source/screens/BlogBookmarks'
import BookmarksList from './Source/screens/BookmarksList'
import BookmarksEdit from './Source/screens/BookmarksEdit'
import ClassMember from './Source/screens/ClassMember'
import ClassMemberAdd from './Source/screens/ClassMemberAdd'
import MemberBlog from './Source/screens/MemberBlog'
import CommentAdd from './Source/screens/CommentAdd'
import AppInformation from './Source/screens/AppInformation'
import ScheduleReminding from './Source/screens/ScheduleReminding'
import ContactPage from './Source/screens/ContactPage'
import Submitted from './Source/screens/Submitted'
import HomeworkSubmit from './Source/screens/HomeworkSubmit'
import UnfinishedHomeworkList from './Source/screens/UnfinishedHomeworkList'
import BlogEdition from './Source/screens/BlogEdition'
import Bulletin from './Source/screens/Bulletin'
import BulletinDisplay from './Source/screens/BulletinDisplay'
import BulletinEdit from './Source/screens/BulletinEdit'
import HistoryList from './Source/screens/HistoryList'
import ClassSelect from './Source/screens/ClassSelect'
import VoteList from './Source/screens/VoteList'
import Settings from './Source/screens/Settings'
import VoteDetail from './Source/screens/VoteDetail'
import VoteAdd from './Source/screens/VoteAdd'
import VoteMemberList from './Source/screens/VoteMemberList'
import VoteMemberCommit from './Source/screens/VoteMemberCommit'
import { themes, ThemeContext, getHeaderStyle } from './Source/styles/theme-context';
//import { globalAgent } from 'https';
const { height, width } = Dimensions.get('window');

const CODE_URL = [
  'https://oauth.cnblogs.com/connect/authorize',
  '?client_id=' + authData.clientId,
  '&scope=openid profile CnBlogsApi',
  '&response_type=code id_token',
  '&redirect_uri=' + Config.CallBack,
  '&state=abc',
  '&nonce=xyz'
].join('');

//首先使用上次的token来获取用户信息，如果失败那么重新登陆
//用户退出之后一定要清空token
class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        //这里一定要测试一下，如果是刚刚下载的软件，一开始打开是不是会显示登陆界面
        const {navigate} = this.props.navigation;
        //推送开关变量
        
        return (
            <View style={styles.container}>
                <Welcome/>
            </View>
        );
    } 
}

// 在App中调用的登录界面组件
class Welcome extends Component{
    render(){
        return (
            <View style = {styles.container}>
                <Image style = {{width: width, height: height, resizeMode: 'stretch'}}
                source = {require('./Source/images/start.jpg')}/>
            </View>
        )
    }
    notification = (paramString) =>{
        console.log(paramString);
        console.log('success');
        // alert(params);
        // this.props.navigation.navigate('HomeworkDetail');
        try{
            let params = JSON.parse(paramString);
            let screen = params.body.custom.screen;
            console.log(screen);
            if(screen == 'HomeworkDetail'){
                let {classId,homeworkId,membership,isFinished} = params.body.custom;
                var callback = ()=>{
                    toPersonalBlog();
                }
                console.log('跳转前');
                this.props.navigation.navigate('HomeworkDetail',{
                    Id: homeworkId,
                    classId: classId, 
                    isFinished: isFinished,
                    membership:membership,
                    callback:callback,
                    //编辑作业所需参数,学生收到提醒不需要编辑。
                    blogId:0,
                })
                console.log('跳转后');
            }
            else if(screen == 'BulletinDisplay'){
                let {schoolClassId,bulletinId,bulletinText,className} = params.body.custom;
                var callback = ()=>{
                    toPersonalBlog();
                }
                console.log('跳转前');
                this.props.navigation.navigate('BulltinDisplay',{
                    schoolClassId: schoolClassId,
                    bulletinId:bulletinId,
                    bulletinText:bulletinText,
                    className:className,
                    membership:1,
                    callback:callback,
                })
            }
        }catch(err){
            console.log(err);
        }
    };
    toPersonalBlog()
    {
        this.reset();
        this.props.navigation.navigate('PersonalBlog');
    }

    toHome()
    {
        this.props.navigation.navigate('Loginer');
    }
    reset = ()=>{
        // 重置路由：使得无法返回登录界面
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'AfterloginTab'}),
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }

    async setPush(){
        var receivePush = await storage.getItem(StorageKey.RECEIVE_PUSH);
        if(receivePush === null){
            storage.setItem(StorageKey.RECEIVE_PUSH,'true');
        }
    }

    componentWillMount(){
        umengPush.initHandler();
    }
    componentDidMount(){       
        // this.subscription = DeviceEventEmitter.addListener('xxxName', Function);//监听通知
        this.timer = setTimeout(
            ()=>{
                this.setPush().then(
                    storage.getItem(StorageKey.USER_TOKEN).then((token)=>{
                        if(token === null)
                        {
                            this.toHome();
                        }
                        else{
                            if(token.access_token !== 'undefined')
                            {
                                let url = Config.apiDomain+'api/users/';
                                Service.GetInfo(url,token.access_token)
                                .then((jsonData)=>{
                                    if(jsonData !== "rejected")
                                    {
                                        DeviceEventEmitter.addListener('notification',this.notification);
                                        console.log('开始监听通知');
                                        this.toPersonalBlog();
                                    }
                                    else
                                    {
                                        storage.removeItem(StorageKey.USER_TOKEN).then((res)=>{
                                            CookieManager.clearAll()
                                            .then((res)=>{
                                                this.props.navigation.navigate('Loginer')
                                            })
                                        })
                                    }
                                })
                                .catch((error) => {
                                    this.toPersonalBlog();
                                });
                            }
                            else
                            {
                                this.toHome();
                            }
                        }
                    })
                )
            }
            ,1000)
    }
}

class Loginer extends Component{
    mylogin = () => {
        this.props.navigation.navigate('LoginPage')
    };
    render(){
        return(
            <View style = {styles.container}>
                <Image source = {require('./Source/images/logo.png')} style = {styles.image}/>
                <View style = {{height: 40}}></View>
                <TouchableOpacity style={styles.loginbutton} onPress = {this.mylogin}>
                    <Text style={styles.btText} accessibilityLabel = 'App_signin'>登   录</Text>
                </TouchableOpacity>
            </View>
        );
    }
    componentWillMount() {

      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
      }
    }
    componentWillUnmount() {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
      }
    }


    onBackAndroid = () => {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        BackHandler.exitApp();
        return false;
      }
      this.lastBackPressed = Date.now();
      ToastAndroid.show('再按一次退出应用',1000);

      return true;
    };
}

class UrlLogin extends Component{
    constructor(props){
        super(props);
        this.state = {
            code : '',
        };
    }
    notification = (paramString) =>{
        console.log(paramString);
        console.log('success');
        // alert(params);
        // this.props.navigation.navigate('HomeworkDetail');
        try{
            let params = JSON.parse(paramString);
            let screen = params.body.custom.screen;
            console.log(screen);
            if(screen == 'HomeworkDetail'){
                let {classId,homeworkId,membership,isFinished} = params.body.custom;
                var callback = ()=>{
                    toPersonalBlog();
                }
                console.log('跳转前');
                this.props.navigation.navigate('HomeworkDetail',{
                    Id: homeworkId,
                    classId: classId, 
                    isFinished: isFinished,
                    membership:membership,
                    callback:callback,
                    //编辑作业所需参数,学生收到提醒不需要编辑。
                    blogId:0,
                })
                console.log('跳转后');
            }
            else if(screen == 'BulletinDisplay'){
                let {schoolClassId,bulletinId,bulletinText,className} = params.body.custom;
                var callback = ()=>{
                    toPersonalBlog();
                }
                console.log('跳转前');
                this.props.navigation.navigate('BulltinDisplay',{
                    schoolClassId: schoolClassId,
                    bulletinId:bulletinId,
                    bulletinText:bulletinText,
                    className:className,
                    membership:1,
                    callback:callback,
                })
            }
        }catch(err){
            console.log(err);
        }
    };
    toPerson()
    {
        // 这里重置路由，阻止用户返回登录界面
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'AfterloginTab'}),
            ]
        });
        this.props.navigation.dispatch(resetAction);
        DeviceEventEmitter.addListener('notification',this.notification);
        console.log('开始监听通知');
        this.props.navigation.navigate('PersonalBlog');
    }
    getTokenFromApi(Code)
    {
        fetch(Config.AccessToken,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'client_id=' + authData.clientId + '&client_secret=' + authData.clientSecret + '&grant_type=authorization_code' + '&code=' + Code + '&redirect_uri=' + Config.CallBack,
            timeout: 5*1000
        })
        .then((response)=>response.json())//还没有对返回状态进行判断，所以还不完整
        .then((responseJson)=>{
            storage.setItem(StorageKey.USER_TOKEN,responseJson);
        }).then(()=>{
            this.toPerson();
            umengAnalysis.onEvent(umengAnalysis.umengEventId.logInEvent);
        })
        .catch((error)=>{
            ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
        })
    }
    render()
    {
        return (
            
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center',
                    backgroundColor: '#FDFDFD', 
                    height: 80, 
                }}>
                    <Image source={require('./Source/images/login.png')}
                        style={{height: 35, width: 35, marginLeft: 40}}
                        resizeMode='contain'/>
                    <Text style={{
                        fontSize: 30,
                        color: '#444', 
                        marginLeft: 15,
                    }}>登录</Text>
                </View>
                <View style={{ height: 0.75, backgroundColor: '#DADADA'}}/>
                <WebView
                    onNavigationStateChange = {(event)=>{
                    var first_sta = event.url.indexOf('#');
                        if(event.url.substring(0,first_sta) === Config.CallBack)
                        {
                            var sta = event.url.indexOf('=');
                            var end = event.url.indexOf('&');
                            this.setState({
                                code : event.url.substring(sta+1,end)
                            })
                            if(this.state.code != '')
                            {
                                this.getTokenFromApi(this.state.code);
                            }
                        }
                    }}
                    source={{uri: CODE_URL}}
                    style={{height: height-40, width: width}}
                    startInLoadingState={true}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    onError = {()=>Alert.alert('网络异常，请稍后再试！')}
                />
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
    item: {
        padding: 2,
        fontSize: 18,
        height: 30,
    },
    input: {
        width: 200,
        height: 40,
        color: 'white',
    },
    inputBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 280,
        height: 50,
        borderRadius: 8,
        backgroundColor: 'rgb(51,153,255)',
        marginBottom: 8,
    },
    loginbutton: {
        height: 50,
        width: 250,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'rgb(51,153,255)',
        marginTop: height/10,
    },
    btText: {
        color: '#fff',
        fontSize: 25,
    },
    image: {
        height: height/7,
        width: width/1.5,
        resizeMode: 'stretch',
    }
});

const HomeTab = TabNavigator({
    PersonalBlog: {
        screen: PersonalBlog,
        navigationOptions: {
            tabBarLabel: '我的博客',
            tabBarIcon: ({focused, tintColor}) => (
                <Image
                    resizeMode='contain'
                    source={require('./Source/images/nav_blog.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            )
        }
    },
    ClassListsNew: {
        screen: ClassListsNew,
        navigationOptions: {
            tabBarLabel: '我的班级',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image
                    resizeMode='contain'
                    source={require('./Source/images/nav_class.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            )
        }
    },
    UserInformation: {
        screen: UserInformation,
        navigationOptions: {
            tabBarLabel: '我',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image
                    resizeMode='contain'
                    source={require('./Source/images/nav_i.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            ),
        },
    },
},{
    tabBarPosition: 'bottom',
    initialRouteName: 'PersonalBlog',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
        showIcon: true,
        showLabel: true,
        activeTintColor: global.theme.tabBarActiveTintColor,
        inactiveTintColor: global.theme.tabBarInactiveTintColor,
        labelStyle: {
            marginTop: 0,
            fontSize: 10,
        },
        iconStyle: {
            marginTop: 10,
        },
        style: {
            backgroundColor: global.theme.headerBackgroundColor,
        },
        tabStyle: {
            height: height/13,
        },
        indicatorStyle: {
            height: 0, // 去掉指示线
        },
    },
})

const SimpleNavigation = StackNavigator({

    VoteDetail: {
        screen: VoteDetail,
        // navigationOptions放到VoteDetail.js里。
    },

    VoteList:{
        screen: VoteList,
        navigationOptions:{
            headerTitle: '投票',
        }
    },

    VoteMemberList: {
        screen: VoteMemberList,
        navigationOptions: {
            headerTitle: '已投票成员',
        }
    },

    VoteMemberCommit: {
        screen: VoteMemberCommit,
        navigationOptions: {
            headerTitle: '投票详情',
        }
    },

    VoteAdd: {
        screen: VoteAdd,
        navigationOptions: {
            headerTitle: '投票列表',
        }
    },

    ClassFunction: {
        screen: ClassFunction,
        navigationOptions: {
            headerTitle: '班级功能',
        },
    },

    Welcome: {
        screen: Welcome,
        navigationOptions: {
            header: null,
        },
    },
    Loginer: {
        screen: Loginer,
        navigationOptions: {
            header: null,
        },
    },
    LoginPage: {
        screen: UrlLogin,
        navigationOptions: {
            header:null,
            headerLeft: null,
            headerRight: null,
            headerTitle: '登录',
            headerTintColor: '#0077FF',
            headerStyle: {
                height: 40,
                backgroundColor: '#F8F8F8',//网页背景色：#EDEDED
                elevation: 1,           // 减轻阴影效果
            },
            headerTitleStyle: {
                flex: 1,
                textAlign: 'center', // 标题居中
                fontSize: 18,
                fontWeight: 'normal',
            },
        },
    },
    HomeworkLists: {
        screen: HomeworkLists,
        navigationOptions: {
            headerTitle: '作业列表',
        },
    },
    UnfinishedHomeworkList: {
        screen: UnfinishedHomeworkList,
        navigationOptions: {
            headerTitle: '未完成作业列表',
        },
    },
    HomeworkDetail: {
        screen: HomeworkDetail,
        navigationOptions: {
            headerTitle: '作业详情',
        },
    },
    ClassLists: {
        screen: ClassLists,
        navigationOptions: {
            header: null,
        }
    },

    UserInformation: {
        screen: UserInformation,
        navigationOptions: {
            header: null,
        }
    },
    ClassListsNew: {
        screen: ClassListsNew,
        navigationOptions: {
            header: null,
        }
    },
    AfterloginTab: {
        screen: HomeTab,
        navigationOptions: {
            header: null,
        }
    },
    ClassHome: {
        screen: ClassHome,
        navigationOptions: {
            headerTitle: '班级博客',
        }
    },
    HomeworkPost: {
        screen: HomeworkPost,
        navigationOptions: {
            headerTitle: '作业发布',
        }
    },
    HomeworkEdition: {
        screen: HomeworkEdition,
        navigationOptions: {
            headerTitle: '作业编辑',
        }
    },
    ScheduleReminding: {
        screen: ScheduleReminding,
        navigationOptions: {
            headerTitle: '日程提醒',
        }
    },
    BlogDetail: {
        screen: BlogDetail,
        navigationOptions: {
            headerTitle: '博文详情',
        }
    },
    BookmarksList:{
        screen: BookmarksList,
        navigationOptions: {
            headerTitle: '收藏列表',
        }
    },
    BlogEdition: {
        screen: BlogEdition,
        navigationOptions: {
            headerTitle: '编辑博文',
        }
    },
    BlogBookmarks: {
        screen: BlogBookmarks,
        navigationOptions: {
            headerTitle: '添加收藏',
        }
    },
    BookmarksEdit: {
        screen: BookmarksEdit,
        navigationOptions: {
            headerTitle: '修改收藏',
        }
    },
    BlogComment: {
        screen: BlogComment,
        navigationOptions:{
            headerTitle: '评论',
        }
    },
    ClassMember: {
        screen: ClassMember,
        navigationOptions:{
            headerTitle: '班级成员',
        }
    },
    ClassMemberAdd: {
        screen: ClassMemberAdd,
        navigationOptions:{
            headerTitle: '添加班级成员',
        }
    },
    MemberBlog: {
        screen: MemberBlog,
        navigationOptions:{
            headerTitle: '他的博客',
        }
    },
    CommentAdd: {
        screen: CommentAdd,
        navigationOptions:{
            headerTitle: '添加评论',
        }
    },
    AppInformation: {
        screen: AppInformation,
        navigationOptions:{
            headerTitle: '关于app',
        }
    },
    ContactPage: {
        screen: ContactPage,
        navigationOptions:{
            headerTitle: '联系开发者',
        }
    },
    Submitted: {
        screen: Submitted,
        navigationOptions:{
            headerTitle: '提交列表',
        }
    },
    HomeworkSubmit: {
        screen: HomeworkSubmit,
        navigationOptions:{
            headerTitle: '请选择你要提交的博文',
        }
    },
    Bulletin: {
        screen: Bulletin,
        navigationOptions:{
            headerTitle: '公告',
        }
    },
    HistoryList: {
        screen: HistoryList,
        navigationOptions:{
            headerTitle: '浏览记录',
        }
    },
    BulletinDisplay: {
        screen: BulletinDisplay,
        navigationOptions:{
            headerTitle: '公告',
        }
    },
    BulletinEdit: {
        screen: BulletinEdit,
    },
    ClassSelect: {
        screen: ClassSelect,
        navigationOptions:{
            headerTitle: '选择班级',
        }
    },
    Settings: {
        screen: Settings,
        navigationOptions:{
            headerTitle: '设置',
        }
    },
},{
    initialRouteName: 'Welcome',
    // 默认的navigationOptions
    navigationOptions: {
        headerTintColor: global.theme.headerTintColor, // 标题栏文字颜色
        headerStyle: getHeaderStyle(),
        headerTitleStyle: {
            flex: 1,
            textAlign: 'center', // 标题居中
            fontSize: 18,
            fontWeight: 'normal',//不加粗
        },
        headerRight: <View/>, // 标题居中
    }
});
export default SimpleNavigation;
