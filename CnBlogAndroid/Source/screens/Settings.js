import React, { Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    Switch,
    Image,
} from 'react-native';
import { themes } from '../styles/theme-context';
import PropTypes from 'prop-types';
import { StorageKey } from '../config';
import MyAdapter from './MyAdapter.js';

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
        this.toggleTheme = () => {
            this.setState(state => ({
                theme:
                    state.theme === themes.dark
                    ? themes.light
                    : themes.dark,
            }), ()=>{this.props.navigation.setParams({theme: this.state.theme});});
            global.theme = global.theme === themes.dark
                ? themes.light
                : themes.dark;
        };
        this.state = {
            theme: global.theme,
            toggleTheme: this.toggleTheme,
            isDarkMode: false,
        }
        this.props.navigation.setParams({theme: this.state.theme});
    }

    componentWillMount() {
        global.storage.load({key: StorageKey.IS_DARK_MODE})
        .then((isDarkMode) => {
            this.setState({isDarkMode: isDarkMode});
        })
        .catch((error) => {
            global.storage.save({key: StorageKey.IS_DARK_MODE, data: this.state.isDarkMode});
        })
        
    }

    getChildContext() {
        return {theme: this.state.theme, toggleTheme: this.toggleTheme};
    }

    render() {
        return (
            <View style={{backgroundColor: this.state.theme.backgroundColor, flex: 1}}>
                <View
                    style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        height: 0.08*screenHeight,
                        marginBottom: 0.01*screenHeight,
                        backgroundColor: this.state.theme.backgroundColor,
                        paddingLeft: 0.05*screenWidth,
                        paddingRight: 0.05*screenWidth,
                    }}
                >
                    {/* 文字旁边的图标 */}
                    <View style={{
                        borderRadius: 4, 
                        backgroundColor: global.theme.darkModeIconBackgroundColor,
                        height: 26,
                        width: 26,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image 
                            source={require('../images/moon.png')}
                            style={{height: 15, width: 15}}
                            resizeMode='contain'
                            tintColor={global.theme.darkModeIconTintColor}
                        />
                    </View>

                    <View style={{
                        flexGrow: 1, 
                        paddingLeft: 0.06*screenWidth,
                    }}>
                        {/* 文字'黑暗模式'和右边的开关 */}
                        <View style={{
                            flexGrow: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Text style={{fontSize: 18, color: global.theme.textColor}}>黑暗模式</Text>
                            <Switch
                                style={{alignItems: 'flex-end'}}
                                value={this.state.isDarkMode}
                                onValueChange={(value) => {
                                    this.toggleTheme();
                                    this.setState({isDarkMode: value});
                                    global.storage.save({key: StorageKey.IS_DARK_MODE, data: value});
                                }}
                            />
                        </View>
                        {/* 分隔线 */}
                        <View style={{height: 1, backgroundColor: global.theme.settingsSeperatorColor, }}></View>
                    </View>
                </View>
            </View>
        )
    }
}

Settings.childContextTypes = {
    theme: PropTypes.object,
    toggleTheme: PropTypes.func,
};