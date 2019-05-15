import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {getHeaderStyle} from '../styles/theme-context';

const screenWidth= MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;

// membership
const student = 1;
const Teacher = 2;
const TA = 3;

/**navigation需要传递参数：
 * schoolClassId：
 * bulletinId：提交修改公告所需要的参数
 * bulletinText：修改公告需要公告原来的内容
 * className: 班级名
 * membership: 用户身份
 * callback：修改公告完毕后调用的函数
 */
export default class BulletinEdition extends Component {
    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(), 
        headerTintColor: global.theme.headerTintColor,
        headerRight: (
            navigation.state.params.membership == Teacher ||
            navigation.state.params.membership == TA 
            ? (
                <TouchableOpacity style={{marginRight:18}} onPress={()=>{
                    navigation.navigate('BulletinEdit', {
                        createNew: false,
                        schoolClassId: navigation.state.params.schoolClassId,
                        bulletinId: navigation.state.params.bulletinId,
                        bulletinText: navigation.state.params.bulletinText,
                        className: navigation.state.params.className,
                        callback: navigation.state.params.refresh,
                    })
                }}>
                    <Text style={{color: global.theme.headerTintColor, fontSize: 18}}>编辑</Text>
                </TouchableOpacity>)
            : (<View></View>)),
    })

    constructor(props){
        super(props);
        this.state={
            schoolClassId: this.props.navigation.state.params.schoolClassId,
            bulletinText: this.props.navigation.state.params.bulletinText,
            bulletinId: this.props.navigation.state.params.bulletinId,
            membership: this.props.navigation.state.params.membership,
        };
        this.props.navigation.setParams({refresh: this.refresh});
    }

    /** 修改公告之后需要更新列表和公告显示页面 */
    refresh = (newBulletinText) => {
        this.props.navigation.state.params.callback();
        this.setState({bulletinText: newBulletinText});
        this.props.navigation.setParams({bulletinText: newBulletinText});
    }

    render() {
        return (
            <View style = {[styles.container,{backgroundColor:global.theme.backgroundColor}]}>
                <ScrollView style={styles.detailView}
                    contentContainerStyle={styles.contentContainer}
                >
                    <Text style={[styles.bulletinDetail,{color:global.theme.textColor}]}
                        selectable={true}
                        selectionColor={global.theme.selectionColor}
                    >{this.state.bulletinText}</Text>
                    <TouchableOpacity style={[styles.commitBtn, {
                            backgroundColor:global.theme.buttonColor,
                            borderColor: global.theme.buttonBorderColor,
                        }]} onPress={()=>{this.props.navigation.goBack()}}>
                        <Text style={[styles.commitBtnText, {color: global.theme.buttonTextColor}]}>完成</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
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
    detailView:{
        marginLeft: 0,
        marginRight: 2, // 滚动条离屏幕右边缘有一点距离
        marginTop: 0,
        marginBottom: 0,
    },
    commitBtn: {
        flex: 0,
        width: 0.25*screenWidth,
        height: 0.1*screenWidth,
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 25,
        borderWidth: 0.75,
        borderRadius: 4,
    },
    commitBtnText: {
        fontSize: 18,
        textAlign:'center',
    },
    bulletinDetail: {
        flex: 1,
        color: 'black',
        fontSize: 17,
        lineHeight: 33,
        marginRight: 10,
        marginLeft: 18,
    },
    contentContainer: {
        flexGrow: 1,    // ScrollView的contentContainerStyle
    },
});
