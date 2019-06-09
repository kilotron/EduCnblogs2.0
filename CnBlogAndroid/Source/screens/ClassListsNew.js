import Config from '../config';
import api from '../api/api.js';
import { authData, err_info, UI } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component } from 'react';
import { StorageKey } from '../config'
import { flatStyles, tabViewStyles } from '../styles/styles'
import ScrollableTabView, { ScrollableTabBar, DefaultTabBar } from 'react-native-scrollable-tab-view';
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
	Picker,
	ActivityIndicator,
	Button,
	Alert,
} from 'react-native';

import {
	StackNavigator,
	TabNavigator,
	withNavigationFocus,
} from 'react-navigation';
import Bulletin from './Bulletin';
import HomeworkLists from './HomeworkLists';
import ClassBlogPostsList from '../component/ClassBlogPostsList'
import VoteHome from './VoteList';
import ModalDropdown from 'react-native-modal-dropdown';
import { navigationHeaderHeight, homeTabHeaderHeight } from '../styles/theme-context';

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = MyAdapter.btnFontSize;

class ClassListsNew extends Component {
	constructor(props) {
		super(props);
		this.state = {
			className: '选择班级',
			schoolClassId: 0,  //班级id
			blogCondition: '所有博客',
			classSelected: false,
			changedSchoolClassId: false,
		}
	}

	// 从选择班级页面返回时调用这个函数，刷新页面
	_classSelectGoBack = (chosedClassName, chosedSchoolClassId) => {
		if(chosedSchoolClassId == null){
			return;
		}
		this.setState({
			className: chosedClassName,
			schoolClassId: chosedSchoolClassId,
			classSelected: true,
			changedSchoolClassId: true,
		});
	}

	componentWillMount() {
        let url = Config.ClassList;
        Service.Get(url)
        // 获取用户班级列表
        .then((jsonData) => {
			if (jsonData !== 'rejected') {
				if (jsonData.length == 0) { // 班级列表为空
					ToastAndroid.show('还未加入任何班级~', ToastAndroid.SHORT);
				}
				// 默认选择第一个班级
				for (var i in jsonData) {
					this.setState({
						className: jsonData[i].nameCn,
						schoolClassId: jsonData[i].schoolClassId,
						classSelected: true,
					});
					break;
				}
			}
        })
        .catch((error) => {
            // Nothing to do here.
        });
    }


	getBulletin() {
		if (!this.state.classSelected) {
			this.props.navigation.navigate('ClassSelect', { callback: this._classSelectGoBack });
		} else {
			return (
				<Bulletin schoolClassId={this.state.schoolClassId} />
			);
		}
	}

	render() {
		/* 关于ModalDropdown：
			没有找到修改分隔线样式的方法，因此不能使用夜间主题，但是在夜间模式下下拉菜单会带有
			一个灰色的边框，还能够接受。这里的背景颜色使用headerBackgroundColor而不是
			BackgroundColor，与页面背景颜色不同，看起来更清晰。 */
		return (
			<View style={styles.pageViewStyle}>
				{/* 班级名称，点击可以切换班级 */}
				<View style={[styles.topBarViewStyle, {backgroundColor: global.theme.headerBackgroundColor}]}>
					{/* 弹出选择班级列表 */}
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate('ClassSelect', {
							 callback: this._classSelectGoBack,
							 classSelected: this.state.classSelected 
						});
					}}>
						<Text style={[styles.classNameStyle, {color: global.theme.textColor}]}>
							{this.state.className}
						</Text>
					</TouchableOpacity>
					<ModalDropdown 
						options={['班级成员']}
						style={[styles.buttonStyle, {backgroundColor: global.theme.headerBackgroundColor}]}
						dropdownTextStyle={[styles.buttonTextStyle, {color: global.theme.textColor,backgroundColor: global.theme.headerBackgroundColor}]}
						dropdownTextHighlightStyle={[styles.buttonTextStyle, {color:global.theme.textColor}]}
						dropdownStyle={[styles.dropdownStyle, {backgroundColor: global.theme.headerBackgroundColor}]}
						showsVerticalScrollIndicator={false}
						onSelect={this.optionNavi}
					> 
						<Image style={styles.optionsImgstyle} 
							source={require('../images/options.png')}
							tintColor={global.theme.headerTintColor}
							resizeMode='contain'
						/>
					</ModalDropdown>
				</View>
				<View style={{ height: 0.75, backgroundColor: global.theme.seperatorColor}}/>
				{/* 从这里开始滚动 */}
				<View style={styles.tabViewStyle}>
					{<ScrollableTabView
						style={tabViewStyles.ScrollableTabView}
						initialPage={0}
						renderTabBar={() => <ScrollableTabBar style={{borderColor: global.theme.tabBarBorderColor}}/>}
						tabBarActiveTextColor={global.theme.tabBarActiveTextColor}
						tabBarInactiveTextColor={global.theme.tabBarInactiveTextColor}
						tabBarBackgroundColor={global.theme.tabBarBackgroundColor}
						tabBarUnderlineStyle={{backgroundColor: global.theme.tabBarActiveTextColor}}
					>
						<View tabLabel='公告' style={{ flex: 1, alignItems: 'stretch' }} >
							<Bulletin schoolClassId={this.state.schoolClassId}
								changedSchoolClassId={this.state.changedSchoolClassId}
								className={this.state.className}
								navigation={this.props.navigation} />
						</View>
						<HomeworkLists tabLabel='作业' classId={this.state.schoolClassId}
							navigation={this.props.navigation} />
						<ClassBlogPostsList tabLabel='博文' schoolClassId={this.state.schoolClassId}
							navigation={this.props.navigation}
						/>
						<VoteHome tabLabel='投票' classId = {this.state.schoolClassId}
							navigation = {this.props.navigation}
						/>
					</ScrollableTabView>}
				</View>
			</View>
		)
	}
	optionNavi=(index,value)=>{
		if(index == 0){
			this.props.navigation.navigate('ClassMember', { classId: this.state.schoolClassId });
		}
	}
}

export default withNavigationFocus(ClassListsNew);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	classNameStyle: {
		fontSize: 18,
		fontWeight: 'normal',
		color: 'white'
	},
	pageViewStyle: {
		flexDirection: 'column',
		flex: 1,
		backgroundColor: 'white'
	},
	topBarViewStyle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: UI.TOP_COLOR,
		height: homeTabHeaderHeight,
		paddingLeft: 0.05 * screenWidth,
	},
	optionsImgstyle: { //下拉菜单
		height: screenHeight / 12 * 0.36,
		width: screenHeight / 12 * 0.5,
		margin: screenHeight / 12 * 0.2,
		flexDirection: 'row',
	},
	tabViewStyle: {
		flex: 1,
	},
	tabTouchStyle: {
		flexDirection: 'row',
		// backgroundColor:'#dcdcdc',
		// backgroundColor:'red',
		height: screenWidth / 3,
		alignItems: 'center',

	},
	tabImgViewStyle: {
		// backgroundColor:'#e8e8e8',
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#dcdcdc',
		width: (screenWidth) / 3,
		height: (screenWidth) / 3,
		justifyContent: 'center',
		alignItems: 'center',
	},
	tabImgstyle: {
		width: screenWidth / 9,
		height: screenWidth / 9,
	},
	blogConditionViewStyle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'white',
		borderColor: '#dcdcdc',
		borderWidth: 2,
		height: (screenHeight) / 16,
		// borderTopWidth:5,
	},
	titleFontStyle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'rgb(51,51,51)'
	},
	arrowStyle: {
		height: (screenHeight) / 30,
		width: (screenHeight) / 30,
	},
	postTitleStyle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10,
		marginBottom: 2,
		textAlign: 'left',
		color: 'black',
		fontFamily: 'serif',
	},
	postDescriptionStyle: {
		lineHeight: 25,
		fontSize: 14,
		marginBottom: 8,
		textAlign: 'left',
		color: 'rgb(70,70,70)',
	},
	postMetadataViewStyle: {
		flexDirection: 'row',
		marginBottom: 8,
		justifyContent: 'space-around',
		alignItems: 'flex-start',
	},
	footer: {
		flexDirection: 'row',
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	pickerStyle: {
		height: (screenHeight) / 16,
		// width:screenWidth/3,
	},
	barStyle: {
		width: screenWidth / 4,
		justifyContent: 'center', alignItems: 'center',
	},
	dropdownStyle:{
		alignItems:'stretch',
		position:'absolute',
		top: 10,
		right:10,
		height: (screenHeight) / 16,
		width:(screenHeight) / 8,
	},
	buttonStyle:{
		height: (screenHeight) / 16,
		width:(screenHeight) / 10,
		marginRight: 5,
		justifyContent:'center',
		alignItems:'center',
	},
	buttonTextStyle:{
		fontSize:16,
		color:'black',
		textAlign:'center',
	}
});
