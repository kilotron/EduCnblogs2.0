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
} from 'react-native';

import {
	StackNavigator,
	TabNavigator,
} from 'react-navigation';
import Bulletin from './Bulletin';
import HomeworkLists from './HomeworkLists';
import ClassBlogPostsList from '../component/ClassBlogPostsList'
import VoteHome from './VoteList';

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = MyAdapter.btnFontSize;

export default class ClassListsNew extends Component {
	constructor(props) {
		super(props);
		this.state = {
			className: '选择班级',
			schoolClassId: 0,  //班级id
			blogCondition: '所有博客',
			classSelected: false,
			changedSchoolClassId: false,
		}
		this.props.navigation.navigate('ClassSelect', { callback: this._classSelectGoBack });
	}

	// 从选择班级页面返回时调用这个函数，刷新页面
	_classSelectGoBack = (chosedClassName, chosedSchoolClassId) => {
		this.setState({
			className: chosedClassName,
			schoolClassId: chosedSchoolClassId,
			classSelected: true,
			changedSchoolClassId: true,
		});
	}

	//页面加载前弹出班级选择页面强制选择班级
	// componentWillMount(){
	// 	this.props.navigation.navigate('ClassSelect', {callback: this._classSelectGoBack});
	// }
	/*bug:
	1.需要两次选择班级才能看到博客
	2.更换班级时博客列表没有刷新
	*/

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
		//let classId = this.props.navigation.state.params.classId;
		return (
			<View style={styles.pageViewStyle}>
				{/* 班级名称，点击可以切换班级 */}
				<View style={styles.topBarViewStyle}>
					{/* 弹出选择班级列表 */}
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate('ClassSelect', { callback: this._classSelectGoBack });
					}}>
						<Text style={styles.classNameStyle}>
							{this.state.className}
						</Text>
					</TouchableOpacity>
					{/* 暂时未知 */}
					<TouchableOpacity onPress={() => { //需要跳转到功能界面，如班级成员
						console.log(this.state.schoolClassId);
						this.props.navigation.navigate('ClassFunction', { classId: this.state.schoolClassId });

					}}>
						<Image style={styles.optionsImgstyle} source={require('../images/options.png')} />
					</TouchableOpacity>

				</View>
				{/* 从这里开始滚动 */}
				<View style={styles.tabViewStyle}>
					{<ScrollableTabView
						style={tabViewStyles.ScrollableTabView}
						initialPage={0}
						renderTabBar={() => <ScrollableTabBar />}
					>
						<View tabLabel='公告' style={{ flex: 1, alignItems: 'stretch' }} >
							<Bulletin schoolClassId={this.state.schoolClassId}
								changedSchoolClassId={this.state.changedSchoolClassId}
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

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	classNameStyle: {
		fontSize: 18,
		fontWeight: 'bold',
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
		height: screenHeight / 12,
		paddingLeft: 0.05 * screenWidth,
	},
	optionsImgstyle: { //下拉菜单
		height: screenHeight / 12 * 0.4,
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
	}
});
