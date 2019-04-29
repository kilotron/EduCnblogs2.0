import MyAdapter from './MyAdapter.js';
import Config from '../config';
import api from '../api/api.js';
import { authData, err_info } from '../config'
import * as Service from '../request/request.js'
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ToastAndroid,
    Button,
} from 'react-native';
const screenWidth = MyAdapter.screenWidth;

export default class VoteAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schoolClassId: this.props.classId,
            name: "",
            content: "",
            privacy: 0,
            deadline: "",
            voteContents : [],
            voteOptions: [],
        }
    }

    _onpress2AddVote(){

    }

    render() {
        return (
            <View style = {styles.container}>
                {/* <View style={styles.detailView}>
                    <Text style={styles.promptText}>公告内容</Text>
                    <TextInput style={styles.bulletinDetail} multiline={true}
                        onChangeText= {(text)=>
                            this.setState({bulletinText: text})
                            }
                        defaultValue={this.state.bulletinText}>
                    </TextInput>
                </View>
                <View  style= {{
                      width:0.35*screenWidth,
                      alignSelf: 'center', }}
                >
                    <Button style={styles.commitBtn}
                        title='添加公告'
                        onPress={ this._onPress}>
                    </Button>
                </View> */}
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
        flex: 8,
    },
    commitBtn: {
        flex: 1,
    },
    promptText: {
        fontSize: 16,
        color: 'gray',
    },
    bulletinDetail: {
        flex: 1,
        borderColor: 'gray',
        textAlignVertical: 'top',
        borderRadius: 10,
    },
});
