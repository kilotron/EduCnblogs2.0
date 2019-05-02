import MyAdapter from './MyAdapter.js';
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
    ToastAndroid,
    Modal,
    ScrollView,
} from 'react-native';
import { RichTextEditor, RichTextToolbar } from 'react-native-zss-rich-text-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = 16;
const marginHorizontalNum = 16;

export default class VoteAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schoolClassId: this.props.classId,
            name: '', //投票名称
            content: "", //投票说明
            privacy: 0, //（1.公开、2.匿名）
            deadline: "", //"2017-09-10 17:00"
            voteContents: [],
            voteOptions: [],
        }
    }

    _onpress2AddVote() {

    }

    render() {
        return (
            <View style={styles.container}>
                {/** 投票名称*/}
                {/* <RichTextEditor
                        ref={(r)=>this.richtext = r}
                        style={styles.richText}
                        titlePlaceholder={'请在此输入作业标题...'}
                        contentPlaceholder={'请在此输入作业内容...'}
                     />
                    <RichTextToolbar
                        getEditor={() => this.richtext}
                    /> */}
                {/* <TextInput style={styles.bulletinDetail} multiline={true}
                        onChangeText={(text) =>
                            this.setState({name : text })
                        }
                        defaultValue={this.state.name}>
                    </TextInput> */}

                <View style={styles.detailView}>
                    <TextInput style={styles.bulletinDetail} multiline={true}
                        placeholder = {'请在此输入投票标题'}
                        onChangeText={(text) =>
                            this.setState({ name: text })
                        }
                    >
                    </TextInput>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({

    container: {
        backgroundColor : 'white',
        flex : 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
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
        height: screenHeight / 18,
        borderColor: 'gray',
        borderWidth: 1
    },
    picker: {
        flex: 1,
        height: screenHeight / 18,
        color: '#000000',
    },
    richText: {
        height: screenHeight / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tichTextContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        paddingTop: 40
    },
    detailView: {
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

