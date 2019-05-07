import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,UI} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {StorageKey} from '../config'


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
} from 'react-native';

import {
  StackNavigator,
  TabNavigator,
} from 'react-navigation';
import {flatStyles} from '../styles/styles';
import {BackHandler} from 'react-native';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;

/**使用ClassSelect需要用navigation传递2个参数：
 * callback: 类型：函数，用于从ClassSelect页面返回时设置选择的班级ID和班级名称
 * classSelected: 类型：布尔，使用ClassSelect的页面是否已选择班级，这个参数会
 * 影响ClassSelect的表现。如果未选择班级（classSelect为false），并且有班级可选
 * 择，ClassSelect返回时若未选择班级，则默认选择第一个班级。
 */

export default class ClassSelect extends Component {
    // 用于处理按返回键的时选择默认的班级
    _didFocusSubscription;
    _willBlurSubscription;  

    constructor(props){
        super(props);
        this.state={
            classes: [],
            imgs:[],
            isEmpy: true, //初始认为请求未成功，不进行渲染，以防App崩溃
        }
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        ); //按返回键时调用this.onBackButtonPressAndroid
    }

    _isMounted;
    
    componentWillUnmount() {
        this._isMounted = false;
        // Remove the listener when you are done
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
    }

    componentDidMount() {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid))
    }

    /**按返回键时选择第一个班级（如果有的话）。 */
    onBackButtonPressAndroid = () => {
        if (this.props.navigation.state.params.classSelected) {
            return; // 如果父页面已选择班级，则按返回键时不重新选择。
        }
        for (var i in this.state.classes) {
            var schoolClassId = this.state.classes[i].schoolClassId;
            var nameCn = this.state.classes[i].nameCn;
            this.props.navigation.state.params.callback(nameCn, schoolClassId);
            break;  // 取第一个班级
        }
    }

    UpdateData =()=> {
        this.setState({
                classes:[],
                imgs:[],
                isEmpty: true
        })
        this.componentWillMount();
    }
    
    componentWillMount() {
        this._isMounted = true;
        let url = Config.ClassList;
        Service.Get(url)
        // 获取用户班级列表
        .then((jsonData) => {
            if (this._isMounted) {
                this.setState({classes: jsonData});
                if (jsonData !== 'rejected') {
                    this.setState({isEmpty: false});
                    if (jsonData.length == 0) { // 班级列表为空
                        ToastAndroid.show('还未加入任何班级~', ToastAndroid.SHORT);
                    }
                }
            }
        })
        .then(() => {
            let isEmpty = this.state.isEmpy;
            global.storage.save({key : StorageKey.CLASS_EMPTY,data : isEmpty});
        })
        // 获取每个班级的图标
        .then(() => {
            let classIndexes = [];
            for (var i = 0; i < this.state.classes.length; i++) {
                classIndexes.push(i);
            }
            return promises = classIndexes.map((classIndex) => {
                return Service.Get(Config.ClassInfo + this.state.classes[classIndex].schoolClassId);
            });
        })
        .then((promises) => {
            Promise.all(promises).then((classes) => {
                for (var i = 0; i < classes.length; i++) {
                    if (this._isMounted) {
                        this.setState({imgs: this.state.imgs.concat(classes[i].icon)})
                    }
                }
            })
        })
        // 缓存班级信息与班级图片
        .then(() => {
            if(this.state.classes.length != 0) global.storage.save({key : StorageKey.CLASS_LIST,data : this.state.classes});
        })
        .then(() => {
            if(this.state.classes.length != 0) global.storage.save({key : StorageKey.CLASS_LIST_IMG,data : this.state.imgs});
        })
        .catch((error) => {
            // 出错则获取之前缓存
            global.storage.load({key: StorageKey.CLASS_EMPTY})
            .then((ret) => {
                this.setState({isEmpty : ret})
            })
            // 获取缓存的班级图片
            .then(() => {
                global.storage.load({key: StorageKey.CLASS_LIST_IMG})
                .then((ret) => {
                    this.setState({imgs: ret})
                })
                .catch((err)=>{
                    ToastAndroid.show("Class_IMG",ToastAndroid.SHORT);
                })
            })
            // 获取缓存的班级信息
            .then(() => {
                global.storage.load({key: StorageKey.CLASS_LIST})
                .then((ret) => {
                    this.setState({classes: ret})
                })
                .catch((err)=>{
                    ToastAndroid.show("Class List",ToastAndroid.SHORT);
                })
            })
            .catch((err)=>{
                ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
                this.props.navigation.navigate('Loginer');
            })
        }); // 在线获取班级信息与图片出错的catch
    }

    _renderItem = ({item}) => {
        return (
            <View style={flatStyles.cell}>
            <TouchableOpacity 
                style= {styles.listItemTouchableStyle}
                onPress={()=>{
                    this.props.navigation.state.params.callback(item.nameCn, item.key);
                    this.props.navigation.goBack();
                }}>

                <Image 
                    style= {styles.listItemImageStyle}
                    source={{uri: item.imgurl}}
                />

                <View style= {styles.listItemContentStyle}>
                    <View style= {styles.universityNameViewStyle}>
                        <Text style= {styles.universityNameTextStyle}>
                            {item.universityNameCn}
                        </Text>                 
                    </View>
                    <View style= {styles.classNameViewStyle}>
                        <Text style= {styles.classNameTextStyle}>
                            {item.nameCn}
                        </Text>                             
                    </View>
                </View>

            </TouchableOpacity>
            </View>
        )
    }

    render() {
        var data= [];
		if(this.state.isEmpty===false){
		for(var i in this.state.classes)
		{
			data.push({
				key: this.state.classes[i].schoolClassId,
				nameCn: this.state.classes[i].nameCn,
				universityNameCn: this.state.classes[i].universityNameCn,
				imgurl: this.state.imgs[i],
            })
        }}
        if(data.length == 0){
            return <View style={styles.container}>
                <Text>还没有加入班级哦~</Text>
            </View>
        }
        return (
            <View style={styles.container}>
				<View style= {styles.listViewStyle}>
					<FlatList
						onRefresh = {this.UpdateData}
						refreshing= {false}
						data={data}
						renderItem={this._renderItem}
					/>
				</View>
			</View>
        )
    }    
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'white'
    },
    listViewStyle: {        
        alignSelf: 'stretch',
        flex:1,
    },
    listItemTouchableStyle: {        
        flexDirection: 'row',  
        justifyContent:'flex-start',
        alignItems: 'flex-start',  
        alignSelf: 'stretch',    
        marginTop: 0.01*screenHeight,
        marginLeft: 0.02*screenWidth,
        marginRight: 0.02*screenWidth,
        marginBottom: 0.01*screenHeight,
        flex:1,
    },
    listItemImageStyle: {
        width: 0.1*screenHeight,
        height: 0.1*screenHeight
    },
    universityNameViewStyle: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
    },
    universityNameTextStyle: {
        fontSize: titleFontSize-5,  
        color: 'rgb(51,51,51)',  
    },
    listItemContentStyle: {        
        flexDirection: 'column',  
        justifyContent:'center',
        alignItems: 'flex-start',  
        alignSelf: 'stretch',                                
        marginLeft: 0.02*screenWidth,
        paddingLeft: 0.01*screenWidth,
        height: 0.1*screenHeight,
        flex:1,
    },
    classNameViewStyle: {        
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
    },
    classNameTextStyle: {
        fontSize: btnFontSize+2,
        color: 'rgb(51,51,51)',  
        marginRight: 0.02*screenWidth,   
    },
});