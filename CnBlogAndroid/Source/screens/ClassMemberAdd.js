import MyAdapter from './MyAdapter.js';
import HeaderNoBackComponent from './HeaderNoBackComponent.js';
import Config from '../config';
import api from '../api/api.js';
import { authData, err_info } from '../config'
import * as Service from '../request/request.js'
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    TextInput,
    Picker,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native';
import { getHeaderStyle } from '../styles/theme-context';
const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = 16;
// 该页面使用navigate参数为classId
export default class ClassMemberAdd extends Component {
    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })
    constructor(props) {
        super(props);
        this.state = {
            displayName: '',//昵称
            realName: '',//真实姓名
            role: 1,//班级身份 1.学生、2.老师、3.助教
            studentNo: '',//学号
        };
    }
    _onPress = () => {
        let postBody = {
            schoolClassId: Number(this.props.navigation.state.params.classId),
            displayName: this.state.displayName,
            realName: this.state.realName,
            role: Number(this.state.role),
            studentNo: this.state.studentNo,
        }
        let body = JSON.stringify(postBody);
        //let url = 'https://api.cnblogs.com/api/edu/member/register/displayName';
        let url = Config.AddMember;
        Service.UserAction(url, body, 'POST').then((response) => {
            if (response.status !== 200) {
                return null;
            }
            else {
                return response.json();
            }
        }).then((jsonData) => {
            if (jsonData === null) {
                ToastAndroid.show('请求失败！', ToastAndroid.SHORT);
            }
            else if (jsonData.isSuccess) {
                ToastAndroid.show('添加成功，请刷新查看！', ToastAndroid.SHORT);
                this.props.navigation.goBack();
            }
            else if (jsonData.isWarning) {
                ToastAndroid.show(jsonData.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('发生错误，请稍后重试！', ToastAndroid.SHORT);
            }
        }).catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET, ToastAndroid.SHORT);
        });
    };
    render() {
        return (
            <View
                style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    flex: 1,
                    backgroundColor: global.theme.backgroundColor,
                    //paddingTop: 0.1*screenHeight,
                    //paddingBottom: 0.02*screenHeight
                }}
            >
                <View style={styles.container}
                >
                    <Text
                        style={[styles.text, {color:global.theme.textColor}]}
                    >
                        园子昵称
                </Text>
                    <TextInput
                        placeholder="使用博客园显示昵称添加"
                        placeholderTextColor = {global.theme.textColor}
                        style={[styles.textInput, {color:global.theme.textColor}]}
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果 	                
                        onChangeText={(text) => {
                            this.setState({
                                displayName: text,
                            })
                        }}
                    />
                </View>
                <View style={styles.container}
                >
                    <Text
                        style={[styles.text, {color:global.theme.textColor}]}
                    >
                        真实姓名
                </Text>
                    <TextInput
                        style={[styles.textInput, {color:global.theme.textColor}]}
                        accessibilityLabel='ClassMemberAdd_realName'
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果 	                
                        onChangeText={(text) => {
                            this.setState({
                                realName: text,
                            })
                        }}
                    />
                </View>
                <View style={styles.container}
                >
                    <Text
                        style={[styles.text, {color:global.theme.textColor}]}
                    >
                        身份
                </Text>
                    <View
                        style={[styles.textInput, {color:global.theme.textColor}]}
                    >
                        <Picker
                            style={[styles.picker, {color:global.theme.textColor}]}
                            mode='dropdown'
                            selectedValue={this.state.role}
                            onValueChange={(ident) => this.setState({ role: ident })}>
                            <Picker.Item label="学生" value={1} />
                            <Picker.Item label="老师" value={2} />
                            <Picker.Item label="助教" value={3} />
                        </Picker>
                    </View>
                </View>
                {this.state.role === 1 ? (<View style={styles.container}
                >
                    <Text
                        style={[styles.text, {color:global.theme.textColor}]}
                    >
                        学号
                </Text>
                    <TextInput
                        style={[styles.textInput, {color:global.theme.textColor}]}
                        accessibilityLabel='ClassMemberAdd_studentID'
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果              
                        onChangeText={(text) => {
                            this.setState({
                                studentNo: text,
                            })
                        }}
                    />
                </View>) : (null)
                }
                <View style={styles.container}
                >
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: global.theme.buttonColor }, { borderColor: global.theme.buttonBorderColor }]}
                        onPress={() => { this._onPress() }}
                    >
                        <Text style={[styles.submitText, { color: global.theme.buttonTextColor }]}>
                            添加
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


const buttonWidthRatio = 0.2;
const buttonHeightRatio = 0.1;

const styles = StyleSheet.create({
    submitText: {
        fontSize: 16,
        //color: constButtonTextColor, //待处理，这里不对
    },
    submitButton: {
        //flex: 1,
        height: buttonHeightRatio * screenWidth,
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        //marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        //backgroundColor: constButtonBGColor,
        //borderColor: constButtonBorderColor,
        borderWidth: 0.5,
        borderRadius: 4,
    },

    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 16,
        marginHorizontal: 16
    },
    text: {
        width: 0.2 * screenWidth,
        fontSize: 16,
        color: 'black',
        textAlign: 'left',
    },
    textInput: {
        flex: 1,
        marginLeft: 8,
        height: 48,
        borderColor: 'gray',
        borderWidth: 1
    },
    picker: {
        flex: 1,
        height: 48,
        color: '#000000',
    }
});