import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import MyAdapter from '../screens/MyAdapter.js';
import PropTypes from 'prop-types';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

const BlogURLProps = {
    blogURL: PropTypes.string.isRequired,
}

export default class BlogURL extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <View>
                <View style={[styles.container, {backgroundColor: global.theme.backgroundColor,}]}>
                    <View style={[styles.imageWrapperView, {backgroundColor: global.theme.urlIconBackgroundColor}]}>
                        <Image source={require('../images/url.png')}
                            style={{height: 15, width: 15}}
                            resizeMode='contain'
                            tintColor={global.theme.urlIconTintColor}
                        />
                    </View>
                    <View style={{paddingLeft: 0.06*screenWidth, flex: 1}}>
                        <View style = {[styles.textView, {backgroundColor: global.theme.backgroundColor}]}>
                            <Text style = {{fontSize: 18, fontWeight: 'normal', color:global.theme.textColor}}>博客地址:</Text>
                            <Text style = {{fontSize: 15, color:global.theme.grayTextColor}}>{this.props.blogURL}</Text>
                        </View>
                        {/* 分隔线 */}
                        <View style={{height: 1, backgroundColor: global.theme.settingsSeperatorColor}}/>
                    </View>
                </View>
            </View>
        )
    }
}

BlogURL.PropTypes = BlogURLProps;

const styles = StyleSheet.create({
    container: {
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
        height: 0.1*screenHeight,
    },
})