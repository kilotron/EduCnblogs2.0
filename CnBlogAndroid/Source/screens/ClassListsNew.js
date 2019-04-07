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

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;


export default class ClassListsNew extends Component{
  constructor(props){
    super(props);
    this.state={
      className:'选择班级',
			schoolClassId:0,  //班级id
			blogCondition:'所有博客',
			classSelected:false,
    }
	}

	_classSelectGoBack = (chosedClassName, chosedSchoolClassId) => {
		this.setState({
			className: chosedClassName, 
			schoolClassId: chosedSchoolClassId,
			classSelected: true,
		});
	}

	render(){
		return(
			<View
				style= {styles.pageViewStyle}
			>
				{/* 班级名称，点击可以切换班级 */}
				<View style= {styles.topBarViewStyle}>
					{/* TODO:弹出选择班级列表 */}
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate('ClassSelect', {callback: this._classSelectGoBack});
					}}>
						<Text style = {styles.classNameStyle}>
							{this.state.className}
						</Text>
					</TouchableOpacity>
					{/* TODO:班级操作，包括班级成员、班级作业等收于此栏中 */}
					<TouchableOpacity onPress={()=>{alert('弹出班级操作')}}>
						<Image style={styles.optionsImgstyle} source={require('../images/options.png')}/>
					</TouchableOpacity>
				</View>
        {/* 从这里开始滚动 */}
        <View style={styles.tabViewStyle}>
          {/* 这一部分是公告，作业和投票 */}
          <View style={styles.tabTouchStyle} onPress={()=>{alert('弹出班级操作')}}>
						<TouchableOpacity style={styles.tabImgViewStyle} 
							onPress={() => {
								if (this.classSelected) {
									this.props.navigation.navigate('Bulletin');
								} else {
									alert("请选择班级");
								}
							}}>
							<Image style={styles.tabImgstyle} source={require('../images/notice.png')}/>
							<Text>公告</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.tabImgViewStyle}>
							<Image style={styles.tabImgstyle} source={require('../images/notice.png')}/>
							<Text>作业</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.tabImgViewStyle}>
							<Image style={styles.tabImgstyle} source={require('../images/notice.png')}/>
							<Text>投票</Text>
						</TouchableOpacity>
					</View>
					{/* 这是筛选导航栏 */}
					<View style={styles.blogConditionViewStyle}>
						<Text style = {styles.titleFontStyle}>{this.state.blogCondition}</Text>
						<TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
							<Text style = {styles.titleFontStyle}>筛选</Text>
							<Image source={require('../images/arrowDown.png')} style = {styles.arrowStyle}/>
						</TouchableOpacity>
					</View>
					{/* 下面是博客项，准备采用FlatList实现 */}
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
	classNameStyle:{
		fontSize: 18,
		fontWeight: 'bold', 
		color:'white'
	},
	pageViewStyle:{
		flexDirection: 'column',
		flex: 1,
		backgroundColor: 'white'
	},
	topBarViewStyle:{        
		flexDirection: 'row',  
		justifyContent:'space-between',
		alignItems: 'center',
		backgroundColor: UI.TOP_COLOR,
		height: screenHeight/12,
		paddingLeft: 0.05*screenWidth,
	},
	optionsImgstyle:{
		height: screenHeight/12*0.4,
		width: screenHeight/12*0.5,
		margin:screenHeight/12*0.2,
  },
  tabViewStyle:{
		
  },
  tabTouchStyle:{
		flexDirection: 'row', 
		// backgroundColor:'#dcdcdc',
		// backgroundColor:'red',
		height:screenWidth/3,
		alignItems:'center',

  },
  tabImgViewStyle:{
    // backgroundColor:'#e8e8e8',
    backgroundColor:'white',
    borderWidth:1,
		borderColor:'#dcdcdc',
		width:(screenWidth)/3,
		height:(screenWidth)/3, 
		justifyContent:'center',
		alignItems:'center',  
	},
	tabImgstyle:{
		width:screenWidth/9,
		height:screenWidth/9,
	},
  blogConditionViewStyle:{
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		backgroundColor:'white',
		borderColor:'#dcdcdc',
		borderWidth:2,
		height:(screenHeight)/16,
		// borderTopWidth:5,
	},
	titleFontStyle:{
		fontSize: 18, 
		fontWeight: 'bold', 
		color:'rgb(51,51,51)'
	},
	arrowStyle:{
		height:(screenHeight)/30,
		width:(screenHeight)/30,
	},
});