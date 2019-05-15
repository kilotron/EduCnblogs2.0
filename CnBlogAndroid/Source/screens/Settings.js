import React, { Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
} from 'react-native';
import { themes } from '../styles/theme-context';
import PropTypes from 'prop-types';

class ThemeTogglerButton extends Component {
    render() {
        return (
            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}
                onPress={this.context.toggleTheme}
            >
                <Text style={{color: this.context.theme.textColor, fontSize: 20}}>toggle</Text>
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
        }
        this.props.navigation.setParams({theme: this.state.theme});
    }    

    getChildContext() {
        return {theme: this.state.theme, toggleTheme: this.toggleTheme};
    }

    render() {
        return (
            <View style={{backgroundColor: this.state.theme.backgroundColor, flex: 1}}>
                <Text 
                    style={{
                        fontSize: 30,
                        textAlign: 'center',
                        marginTop: 280,
                        color: this.state.theme.textColor,
                        fontStyle: 'italic',
                    }}
                >COMING SOON!!!</Text>
                <ThemeTogglerButton/>
            </View>
        )
    }
}

Settings.childContextTypes = {
    theme: PropTypes.object,
    toggleTheme: PropTypes.func,
};