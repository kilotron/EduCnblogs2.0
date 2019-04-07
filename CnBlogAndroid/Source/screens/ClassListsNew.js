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
	Picker,
	ActivityIndicator,
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

const pageSize = 10;

export default class ClassListsNew extends Component{
	filter='all'; // 班级博客筛选条件
  constructor(props){
    super(props);
    this.state={
      className:'选择班级',
			schoolClassId:0,  //班级id
			blogCondition:'所有博客',
			classSelected:false,
			blogs: [],	// 班级博客列表
			postCount: 0,//班级博客数
			loadStatus: 'not loading',
			currentPageIndex: 1,
		}
	}

	// 从选择班级页面返回时调用这个函数，刷新页面
	_classSelectGoBack = (chosedClassName, chosedSchoolClassId) => {
		this.setState({
			className: chosedClassName, 
			schoolClassId: chosedSchoolClassId,
			classSelected: true,
		});
		this.UpdateData();
	}

	_isMounted;

	UpdateData = () => {
		this.setState({
			blogs: [], 
			postCount: 0, 
			loadStatus: 'not loading',
			currentPageIndex: 1,
		}, this.componentWillMount());
	}
//bug:需要两次选择班级才能看到博客

	// 读取第pageIndex页，每页10项
	fetchPage(pageIndex) {
		this.setState({loadStatus: 'loading'});
		let url = Config.apiDomain + 'api/edu/schoolclass/posts/' +
			this.filter + '/' + this.state.schoolClassId + '/' + pageIndex + '-' + pageSize;
		//alert(url+this.state.blogs);//bug:第二次筛选时不能加载
		Service.Get(url)
		.then((jsonData) => {
			if (this._isMounted) {
				let pageCount = Math.ceil(jsonData.totalCount / pageSize);
				this.setState({
					postCount: jsonData.totalCount, 
					blogs: this.state.blogs.concat(jsonData.blogPosts),
					loadStatus: this.state.currentPageIndex>=pageCount ? 'all loaded' : 'not loading',
				});
			}
		});

	}

	componentWillMount() {
		if (!this.state.classSelected) {
			return;
		}
		this._isMounted = true;
		this.fetchPage(this.state.currentPageIndex);
	}

	componentWillUnmount = ()=>{
		this._isMounted=false;
	}

	_separator = () => {
		return (
				<View style={{ height: 9.75, justifyContent: 'center'}}>
				<View style={{ height: 0.75, backgroundColor: 'rgb(100,100,100)'}}/>
				<View style={{ height: 9, backgroundColor: 'rgb(235,235,235)'}}/>
				</View>
		);
	}

	_renderItem = (item) => {
		let item1 = item;
		var Title = item1.item.Title;
		var Url = item1.item.Url;
		var Description = item1.item.Description;
		var PostDate = item1.item.PostDate;
		var ViewCount = item1.item.ViewCount;
		var CommentCount = item1.item.CommentCount;
		var Id = item1.item.key;
		return(
				<View>
						<TouchableOpacity
							style = {styles.listcontainer} 
							onPress = {Url!==''?()=>{this.props.navigation.navigate('BlogDetail',
							{Id:Id, blogApp: global.user_information.BlogApp, CommentCount: CommentCount, Url: Url})
							{/*alert(Id);*/} // bug: ID不对
						}:()=>{}}
						>  
							<Text style = {styles.postTitleStyle} accessibilityLabel = {Url}>
									{Title}
							</Text>
							<Text numberOfLines={3} style = {styles.postDescriptionStyle}>
									{Description}
							</Text>
							<View style = {styles.postMetadataViewStyle}>
								<Text style = {{fontSize: 10, textAlign: 'left', color: 'black', flex: 1}}>
										{ViewCount+' 阅读'+'  '+CommentCount+' 评论'}
								</Text>
								<Text style = {{fontSize: 10, textAlign: 'right', color: 'black', flex: 1}}>
										{'发布于: '+PostDate.split('T')[0]+' '+PostDate.split('T')[1]}
								</Text>
							</View>
						</TouchableOpacity>
				</View>
		)
	};

	_renderPosts() {
		if (!this.state.classSelected) {
			return (<View><Text>未选择班级</Text></View>);
		}
		var data = [];
		for(var i in this.state.blogs)
		{
				data.push({
						key: this.state.blogs[i].blogId,
						Title: this.state.blogs[i].title,
						Url: this.state.blogs[i].url,
						Description: this.state.blogs[i].description,
						PostDate: this.state.blogs[i].dateAdded,
						ViewCount: this.state.blogs[i].viewCount,
						CommentCount: this.state.blogs[i].commentCount,
				})
		}

		return(
			<FlatList
				ItemSeparatorComponent={this._separator}
				renderItem={this._renderItem}
				data= {data}
				onRefresh = {this.UpdateData}
				refreshing= {false}
				onEndReached={this._onEndReached.bind(this)}
				onEndReachedThreshold={0.1}
				ListFooterComponent={this._renderFooter.bind(this)}
			/>
		)
	}

	_onEndReached() {
		if (this.state.loadStatus != 'not loading') {
			return;
		}
		let pageCount = Math.ceil(this.state.postCount / pageSize);
		if (this.state.currentPageIndex >= pageCount) {
			return;
		}
		this.state.currentPageIndex++;
		this.fetchPage(this.state.currentPageIndex);
	}

	_renderFooter(){
		if (this.state.loadStatus === 'all loaded') {
				return (
						<View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
								<Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
										没有更多数据了
								</Text>
						</View>
				);
		} else if(this.state.loadStatus === 'loading') {
				return (
					<View style={styles.footer}>
							<ActivityIndicator />
							<Text>正在加载更多数据...</Text>
					</View>
				);
		} //else 'not loading'
		return (
			<View style={styles.footer}>
					<Text></Text>
			</View>
		);
	}

	render(){
		return(
			<View style= {styles.pageViewStyle}>
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
								if (!this.state.classSelected) {
									ToastAndroid.show("请选择班级", ToastAndroid.SHORT);
									this.props.navigation.navigate('ClassSelect', {callback: this._classSelectGoBack});
								} else {
									this.props.navigation.navigate('Bulletin');
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
							{/*<Image source={require('../images/arrowDown.png')} style = {styles.arrowStyle}/>*/}
						</TouchableOpacity>
						<Picker
							selectedValue={this.filter}
							style={{ height: 50, width: 120 }}
							onValueChange={(itemValue, itemIndex) => {
								this.filter=itemValue;
								this.UpdateData();
							}
						}>
							<Picker.Item label="全部" value="all" />
							<Picker.Item label="零回复博文" value="no_comment" />
							<Picker.Item label="老师/助教" value="tutor" />
							<Picker.Item label="学生" value="student" />
						</Picker>
					</View>
        </View>
				{/* 下面是博客项，用FlatList实现 */}
				{this._renderPosts()}
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
	postTitleStyle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10,
		marginBottom: 2,
		textAlign: 'left',
		color: 'black',
		fontFamily : 'serif',
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
	footer:{
		flexDirection:'row',
		height:24,
		justifyContent:'center',
		alignItems:'center',
		marginBottom:10,
	},
});