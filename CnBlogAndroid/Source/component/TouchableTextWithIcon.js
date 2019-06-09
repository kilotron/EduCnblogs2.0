import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import MyAdapter from '../screens/MyAdapter.js';
import PropTypes from 'prop-types';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

const TouchableTextWithIconProps = {
    text: PropTypes.string.isRequired,                  // 显示的文字
    imageSource: PropTypes.string.isRequired,           // 文字左边的图标路径
    imageBackgroundColor: PropTypes.string.isRequired,  // 图标的背景颜色
    imageTintColor: PropTypes.string.isRequired,        // 图标前景颜色
    onPress: PropTypes.func.isRequired,

    // 下面的可选
    textColor: PropTypes.string,
    boldText: PropTypes.bool,
}

/**此组件可用于个人信息页面，显示一个带有图标、文字的项。
 * 此组件自带上下左右边距，使用此组件不需要设置上下左右边距。
 * 此组件自带分隔线
 */
export default class TouchableTextWithIcon extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{this.props.onPress()}}
            >
                <View style={[styles.iconAndTextView, {backgroundColor: global.theme.backgroundColor,}]}>
                    <View style={[styles.imageWrapperView, {backgroundColor: this.props.imageBackgroundColor}]}>
                        <Image source={this.props.imageSource}
                            style={{height: 15, width: 15}}
                            resizeMode='contain'
                            tintColor={this.props.imageTintColor}
                        />
                    </View>
                    <View style={{paddingLeft: 0.06*screenWidth, flex: 1}}>
                        <View style={styles.textView}>
                            <Text style = {{fontSize: 18, fontWeight: this.props.boldText?'bold':'normal', color: this.props.textColor?this.props.textColor:global.theme.textColor}}>{this.props.text}</Text>
                        </View>
                        {/* 分隔线 */}
                        <View style={{height: 1, backgroundColor: global.theme.settingsSeperatorColor}}/>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

TouchableTextWithIcon.PropTypes = TouchableTextWithIconProps;

const styles = StyleSheet.create({
    touchable: {
        //flexDirection: 'row',
        //justifyContent: 'flex-start',
        //alignItems: 'center',
        height: 0.09*screenHeight,
        paddingLeft:0.05*screenWidth,
    },
    iconAndTextView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 0.09*screenHeight,
        paddingLeft:0.05*screenWidth,
    },
    imageWrapperView: {
        height: 26,
        width: 26,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textView: {
        flex: 1,
        justifyContent:'center',
        alignItems: 'flex-start',
        //paddingLeft: 0.06*screenWidth,
    },
})