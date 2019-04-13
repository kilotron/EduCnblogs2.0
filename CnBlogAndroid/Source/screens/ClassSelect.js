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

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;

export default class ClassSelect extends Component {
    constructor(props){
        super(props);
        this.state={
            classes: [],
            imgs:[],
            isEmpy: true, //初始认为请求未成功，不进行渲染，以防App崩溃
        }
    }

    _isMounted;
    
    componentWillUnmount() {
        this._isMounted = false;
    }

    _separator = () => {
        return <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }}/>;
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
                }
            }
        })
        .then(() => {
            global.storage.save({key : StorageKey.CLASS_EMPTY,data : this.state.isEmpty});
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
            global.storage.save({key : StorageKey.CLASS_LIST,data : this.state.classes});
        })
        .then(() => {
            global.storage.save({key : StorageKey.CLASS_LIST_IMG,data : this.state.imgs});
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
        return (
            <View style={styles.container}>
				<View style= {styles.listViewStyle}>
					<FlatList
						onRefresh = {this.UpdateData}
						refreshing= {false}
						data={data}
						ItemSeparatorComponent={this._separator}
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