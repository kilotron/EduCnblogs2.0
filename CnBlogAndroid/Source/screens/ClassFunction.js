import Config from '../config';
import api from '../api/api.js';
import { authData } from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import HeaderNoBackComponent from './HeaderNoBackComponent.js';
import React, { Component } from 'react';
import { err_info } from '../config';
import { Button, Content } from 'native-base';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    ToastAndroid,
    TouchableHighlight,
    TextInput,
    FlatList,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    ScrollView
} from 'react-native';
import {
    StackNavigator,
} from 'react-navigation';

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = MyAdapter.btnFontSize;

export default class ClassFunction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classId: this.props.navigation.state.params.classId,
        }
    }
    render() {
        let classId = this.state.classId;
        console.log("classId是"+classId);
        return (
            <View style={styles.button_test}>
                <Content>
                <Button primary 
                    onPress={()=>this.props.navigation.navigate('Devote',{classId:classId})}
                    style = {styles.button}
                >
	                <Text style = {{fontSize: 20, color: 'white'}}>投票</Text>
                </Button>
                <Button primary 
                    onPress={()=>this.props.navigation.navigate('ClassMember',{classId:classId})}
                    style = {styles.button}
                >
	                <Text style = {{fontSize: 20, color: 'white'}}>班级成员</Text>
                </Button>
                </Content>
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
    button_test: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    button: {
        height: 0.2 * 0.618 * screenWidth,
        width: 0.618 * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 20,
    }
});