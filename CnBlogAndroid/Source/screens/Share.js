import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {
    Platform,
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Alert,
    Share,
} from 'react-native';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;

export default class ShareButton extends Component{
    static defaultProps={
        url:'',
        iconStyle:0,
      }
    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={this._onPress}
                    activeOpacity = {this.props.url === '' ? 1 : 0.2}
                >
                    <Image 
                        style={styles.shareImg}
                        source={this.props.iconStyle === 0 ? require('../images/shareWhite.png') : require('../images/share.png')}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    _onPress=()=>{
        if(this.props.url == '') return;
        Share.share({
            title:'分享链接',
            message:this.props.url,
        });
    }
    
}
const styles = StyleSheet.create({
    container:{
        width: screenHeight/14,
        height: screenHeight/14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    shareImg:{
		height: screenHeight/22,
        width: screenHeight/22,
        resizeMode: 'stretch',
    },
});