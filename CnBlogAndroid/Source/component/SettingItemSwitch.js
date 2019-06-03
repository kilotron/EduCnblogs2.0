import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    Image,
    Switch,
    StyleSheet,
} from 'react-native';
import MyAdapter from '../screens/MyAdapter.js';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

SettingItemSwitchProps = {
    text: PropTypes.string.isRequired,                  // 显示的文字
    imageSource: PropTypes.string.isRequired,           // 文字左边的图标路径
    imageBackgroundColor: PropTypes.string.isRequired,  // 图标的背景颜色
    imageTintColor: PropTypes.string.isRequired,        // 图标前景颜色
    onValueChange: PropTypes.func.isRequired,           // 开关状态改变时调用的函数，有1个参数value, 其值为true/false
    initialValue: PropTypes.func.isRequired,            // 一个异步函数，返回开关初始值
}

/**SettingItemSwitch可用于设置页面，显示一个带有图标、开关的设置项。
 * 此组件自带分隔线、上下左右边距，使用此组件不需要设置分隔线与上下左右边距。
 */
export default class SettingItemSwitch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOn: false,
        };
    }

    componentWillMount() {
        this.props.initialValue()
        .then((isOn) => {
            this.setState({isOn: isOn});
        })
    }

    render() {
        return (
            <View style={[styles.outermostView, {backgroundColor: global.theme.backgroundColor}]}>
                {/* 文字旁边的图标 */}
                <View style={[styles.imageWrapperView, {backgroundColor: this.props.imageBackgroundColor}]}>
                    <Image 
                        source={this.props.imageSource}
                        style={{height: 15, width: 15}}
                        resizeMode='contain'
                        tintColor={this.props.imageTintColor}
                    />
                </View>

                <View style={{
                    flexGrow: 1, 
                    paddingLeft: 0.06*screenWidth,
                }}>
                    {/* 文字'黑暗模式'和右边的开关 */}
                    <View style={styles.textAndSwitchView}>
                        <Text style={{fontSize: 18, color: global.theme.textColor}}>{this.props.text}</Text>
                        <Switch
                            style={{alignItems: 'flex-end'}}
                            onTintColor='#4BD862'  //开关打开时的背景颜色
                            thumbTintColor='#ececec' //开关上按钮的颜色
                            tintColor='#abb0b4' //关闭时背景颜色
                            value={this.state.isOn}
                            onValueChange={(value) => {
                                this.setState({isOn: value});
                                this.props.onValueChange(value);
                            }}
                        />
                    </View>
                    {/* 分隔线 */}
                    <View style={{height: 1, backgroundColor: global.theme.settingsSeperatorColor, }}/>
                </View>
            </View>
        )
    }
}

SettingItemSwitch.PropTypes = SettingItemSwitchProps;

const styles = StyleSheet.create({
    outermostView: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 0.07*screenHeight,
        marginTop: 0.01*screenHeight,
        backgroundColor: global.theme.backgroundColor,
        paddingLeft: 0.05*screenWidth,
        paddingRight: 0.05*screenWidth,
    },
    imageWrapperView: {
        borderRadius: 4, 
        height: 26,
        width: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textAndSwitchView: {
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})