import React, { Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    Switch,
    Image,
    Alert,
} from 'react-native';
import { themes } from '../styles/theme-context';
import PropTypes from 'prop-types';
import { StorageKey } from '../config';
import MyAdapter from './MyAdapter.js';
import * as storage from '../Storage/storage';
import * as umengPush from '../umeng/umengPush';
import * as Push from '../DataHandler/Push/PushHandler';
import SettingItemSwitch from '../component/SettingItemSwitch';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;

class ThemeTogglerButton extends Component {
    render() {
        return (
            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}
                onPress={this.context.toggleTheme}
            >
                <Text style={{color: this.context.theme.textColor, fontSize: 20}}>切换主题</Text>
            </TouchableOpacity>
        )
    }
}

ThemeTogglerButton.contextTypes = {
    theme: PropTypes.object,
    toggleTheme: PropTypes.func,
};

export default class Settings extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerStyle: {
            height: 45,
            elevation: 1,
            backgroundColor: global.theme.headerBackgroundColor,
        },
        headerTintColor: global.theme.headerTintColor,
    })

    constructor(props) {
        super(props);
        this.toggleTheme = (isDarkMode) => {
            this.setState(state => ({
                theme: isDarkMode ? themes.dark : themes.light,
            }), ()=>{this.props.navigation.setParams({theme: this.state.theme});});
            global.theme = isDarkMode ? themes.dark : themes.light;
            global.refreshAll();
        };
        this.state = {
            theme: global.theme,
            toggleTheme: this.toggleTheme,
        }
        this.props.navigation.setParams({theme: this.state.theme});
    }

    getChildContext() {
        return {theme: this.state.theme, toggleTheme: this.toggleTheme};
    }

    render() {
        return (
            <View style={{backgroundColor: this.state.theme.backgroundColor, flex: 1}}>
                <SettingItemSwitch
                    text='黑暗模式'
                    imageSource={require('../images/moon.png')}
                    imageBackgroundColor={global.theme.darkModeIconBackgroundColor}
                    imageTintColor={global.theme.darkModeIconTintColor}
                    onValueChange={(value) => {
                        this.toggleTheme(value);
                        storage.setItem(StorageKey.IS_DARK_MODE, value)
                    }}
                    initialValue={async () => {
                        let isDarkMode = await storage.getItem(StorageKey.IS_DARK_MODE);
                        if (typeof(isDarkMode) != 'boolean') {  // 没有初值时
                            isDarkMode = false; // 默认关闭黑暗模式
                            this.toggleTheme(isDarkMode);
                            storage.setItem(StorageKey.IS_DARK_MODE, isDarkMode);
                        }
                        return isDarkMode;
                    }}
                />
                <SettingItemSwitch
                    text='接收推送'
                    imageSource={require('../images/paper_plane.png')}
                    imageBackgroundColor={global.theme.recvPushIconBackgroundColor}
                    imageTintColor={global.theme.recvPushIconTintColor}
                    onValueChange={(value) => {
                        storage.setItem(StorageKey.RECEIVE_PUSH, value);
                        if(value == false){
                            umengPush.closePush();
                        }
                        else{
                            umengPush.openPush();
                            Push.initPush();
                        }
                    }}
                    initialValue={async () => {
                        let recvPush = await storage.getItem(StorageKey.RECEIVE_PUSH);
                        if (typeof(recvPush) != 'boolean') {
                            recvPush = true;    // 默认打开推送
                            storage.setItem(StorageKey.RECEIVE_PUSH, recvPush);
                            umengPush.openPush();
                            Push.initPush();
                        }
                        return recvPush;
                    }}
                />
                
            </View>
        )
    }
}

Settings.childContextTypes = {
    theme: PropTypes.object,
    toggleTheme: PropTypes.func,
};