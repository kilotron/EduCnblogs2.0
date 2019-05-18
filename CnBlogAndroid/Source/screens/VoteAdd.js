import MyAdapter from './MyAdapter.js';
import Config, { UI } from '../config';
import api from '../api/api.js';
import config, { authData, err_info } from '../config'
import * as Service from '../request/request.js'
import React, { Component } from 'react';
import {
    Stepper,
    Wheel,
    Toast
} from 'teaset';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    TextInput,
    Picker,
    ToastAndroid,
    Modal,
    ScrollView,
    Alert,
    Button,
} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { RichTextEditor, RichTextToolbar } from 'react-native-zss-rich-text-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import RadioModal from 'react-native-radio-master';
const screenWidth = MyAdapter.screenWidth;
const screenHeight = MyAdapter.screenHeight;
const titleFontSize = MyAdapter.titleFontSize;
const abstractFontSize = MyAdapter.abstractFontSize;
const informationFontSize = MyAdapter.informationFontSize;
const btnFontSize = 16;
const marginHorizontalNum = 16;
const constBorderColor = 'gray';
const constBorderDistance = screenHeight / 128;
const constBorderMarginWidth = screenWidth / 32;
const constBorderWidth = 0.5;

const constQuestionInitial = 1; //每个投票初始一个问题
const constOptionInitial = 2; //每个问题设置两个初始选项

export default class VoteAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schoolClassId: this.props.navigation.state.params.classId,
            name: '', //投票名称
            content: "", //投票说明
            privacy: 1, //（1.公开、2.匿名）
            deadline: "", //"2017-09-10 17:00"
            voteContents: [],
            voteQuestions: [],//投票问题列表

            ModalVisible: false, //是否可见日历
            hour: "00",
            minute: "00",

            questionInitial: constQuestionInitial,
            questionNum: constQuestionInitial, //question的个数,初始值为1

        }
    }

    //判断函数
    judgeAddEmpty(test) {
        //如果test为空或者全空格，返回true
        if (test.match(/^[ ]*$/))
            return true;
        return false;
    }


    /** 自定义alert函数 */
    myAlert(propsText) {
        Alert.alert('提示', propsText, [
            { text: '确定', },
        ]);
    }

    //判断此时的投票是否符合条件，不符合则返回false
    judgeAddOk() {
        var varThisState = this.state;
        if (this.judgeAddEmpty(varThisState.name) || this.judgeAddEmpty(varThisState.content)) {
            this.myAlert('请输入投票名称或说明');
            return false;
        }
        if (this.judgeAddEmpty(varThisState.deadline)) {
            this.myAlert('请选择日期');
            return false;
        }
        var num, i;
        for (num = 0; num < varThisState.voteContents.length; num++) {
            if (this.judgeAddEmpty(varThisState.voteContents[num].title)) {
                this.myAlert('问题' + (num + 1) + '标题未填写');
                return false;
            }
            var varVoteOptions = varThisState.voteContents[num].voteOptions;
            for (i = 0; i < varVoteOptions.length; i++) {
                if (this.judgeAddEmpty(varVoteOptions[i].option)) {
                    this.myAlert('问题' + (num + 1) + ' 选项' + (i + 1) + '未填写');
                    return false;
                }
            }
        }
        return true;
    }

    /** 发布投票函数 */
    _onpress2AddVote() {
        //设定各个部分不为空
        if (!this.judgeAddOk()) return;

        let postBody = {
            schoolClassId: this.state.schoolClassId,
            name: this.state.name, //投票名称
            content: this.state.content, //投票说明
            privacy: this.state.privacy, //（1.公开、2.匿名）
            deadline: this.state.deadline + ' ' + this.state.hour + ':' + this.state.minute, //"2017-09-10 17:00"
            voteContents: this.state.voteContents,
        }
        let body = JSON.stringify(postBody);
        let url = Config.VoteAdd;
        Service.UserAction(url, body, 'POST').then((response) => {
            if (response.status !== 200) {
                return null;
            }
            else {
                return response.json();
            }
        }).then((jsonData) => {
            if (jsonData === null) {
                ToastAndroid.show('请求失败！', ToastAndroid.SHORT);
            }
            else if (jsonData.isSuccess) {
                ToastAndroid.show('添加成功！', ToastAndroid.SHORT);
                this.props.navigation.state.params.callback();
                this.props.navigation.goBack();
            }
            else if (jsonData.isWarning) {
                ToastAndroid.show(jsonData.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('发生错误，请稍后重试！', ToastAndroid.SHORT);
            }
        }).catch((error) => {
            ToastAndroid.show(err_info.NO_INTERNET, ToastAndroid.SHORT);
            this.props.navigation.state.params.callback();
            this.props.navigation.goBack();
        });
    }

    /** 投票名称*/
    getTitle() {
        return (
            <View style={styles.titleAndContent}>
                <View>
                    <Text style={styles.text}>
                        投票名称：
                    </Text>
                </View>

                <View style={styles.title}>
                    <TextInput style={styles.bulletinDetail} multiline={true}
                        placeholder={'请在此输入投票名称'}
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                        onChangeText={(text) =>
                            this.setState({ name: text })
                        }

                    >
                    </TextInput>
                </View>
            </View>
        );
    }

    /** 投票说明 */
    getContent() {
        return (
            <View style={styles.titleAndContent}>
                <View>
                    <Text style={styles.text}>
                        投票详情：
                    </Text>
                </View>

                <View style={styles.content}>
                    <TextInput style={styles.bulletinDetail} multiline={true}
                        placeholder={'请在此输入投票说明'}
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                        onChangeText={(text) =>
                            this.setState({ content: text })
                        }
                    ></TextInput>
                </View>
            </View>

        );
    }

    /** 返回选择日期 */
    getCalendar() {
        return (
            <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.ModalVisible}
                onRequestClose={() => { ToastAndroid.show("请选择一个日期", ToastAndroid.SHORT); }}
            >
                <View style={styles.container}>
                    <Calendar
                        onDayPress={(day) => {
                            this.setState({ deadline: day.dateString });
                            this.setState({ ModalVisible: !this.state.ModalVisible });
                        }}
                        theme={{
                            selectedDayBackgroundColor: '#3b50ce',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: 'red'
                        }}
                    />
                </View>
            </Modal>
        );
    }

    /** 投票隐私 */
    getPrivacy() {
        return (
            <View style={styles.titleAndContent}>
                <View>
                    <Text style={styles.text}>
                        投票隐私：
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <RadioModal
                        selectedValue={this.state.privacy}
                        onValueChange={(id, item) => this.setState({ privacy: id })}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <Text value={1}>公开</Text>
                        <Text value={2}>匿名</Text>
                    </RadioModal>
                </View>
            </View>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.questionNum != nextState.questionNum) return true;
        if (this.state.name != nextState.name) return true;
        if (this.state.content != nextState.content) return true;
        if (this.state.deadline != nextState.deadline) return true;
        if (this.state.hour != nextState.hour) return true;
        if (this.state.minute != nextState.minute) return true;
        if (this.state.ModalVisible != nextState.ModalVisible) return true;
        if (this.state.voteQuestions != nextState.voteQuestions) return true;
        if (this.state.voteContents != nextState.voteContents) return true;
        if (this.state.privacy != nextState.privacy) return true;
        return false;
    }

    componentWillUpdate(nextProps, nextState) {
        var array = this.state.voteQuestions;
        var arrayContents = this.state.voteContents;
        var varQuestionNum = this.state.questionNum;
        if (nextState.questionNum > array.length) {
            varQuestionNum++;
            array.push(
                <Question
                    titleNum={varQuestionNum}
                    optionInitial={constOptionInitial}
                    myThis={this}
                    isVisible={true}
                />
            )
            arrayContents.push(
                {}
            )
        }
        this.setState({ voteQuestions: array });
        this.setState({ voteContents: arrayContents });
    }

    /** 增加一个投票问题，暂时未实现 */
    addQuestion() {
        var varQuestionNum = this.state.questionNum;
        this.setState({ questionNum: varQuestionNum + 1 });
    }

    /** 投票添加问题按钮 */
    getQuestionAddButton() {
        return (
            <TouchableOpacity style={{
                justifyContent: 'center',
                backgroundColor: 'white',
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
                marginRight: screenWidth / 5,
                width: screenWidth / 6,
                height: screenHeight / 14,
            }}
                onPress={() => { this.addQuestion() }}
            >
                <Text style={styles.textAddOption}

                >
                    {'添加问题'}
                </Text>
            </TouchableOpacity>
        )
    }

    editVoteContents(propsTitleNum, propsArray) {
        var array = this.state.voteContents;
        var num;
        {
            for (num = 1; num <= array.length; num++) {
                if (num == propsTitleNum) {
                    array[num - 1] = propsArray;
                }
            }
        }
        this.setState({ voteContents: array });
    }

    componentWillMount() {
        var array = [];
        var arrayContents = [];
        /** 生成一个初始问题 */
        var num = 0;
        for (num = 1; num <= this.state.questionNum; num++) {
            if (num <= this.state.questionInitial) { //如果小于等于初始值，则不设定删除按钮
                array.push(
                    <Question
                        titleNum={num}
                        optionInitial={constOptionInitial}
                        myThis={this}
                        isVisible={true}
                    />
                );
                arrayContents.push(
                    { 'title': 'hhh' }
                );
            }
        }

        this.setState({ voteQuestions: array });
        this.setState({ voteContents: arrayContents });
    }

    /** 获得整个投票内容 */
    getAllVoteContent() {
        /** 这个地方应该有投票添加按钮，每个投票都有唯一的标识符，是其在voteContent中的index */
        var array = this.state.voteQuestions;
        return (
            <View style={styles.voteContentContainer}>
                {array}
            </View>
        );
    }

    /** 投票按钮 */
    getVoteAddButton() {
        return (
            <TouchableOpacity
                style={styles.submitButton}
                onPress={() => { this._onpress2AddVote() }}
            >
                <Text style={styles.submitText}>
                    投票发布
            </Text>
            </TouchableOpacity>

        )
    }

    /** 投票头部 */
    getTitlePart() {
        /** 欠缺添加问题按钮 */

        return (
            <View style={styles.titlePart}>
                {/**投票名称 */}
                {this.getTitle()}

                {/**投票说明 */}
                {this.getContent()}

                {/**投票日期 */}
                {this.getCalendar()}
                <View style={styles.calendar}>
                    <MyBar
                        title="截止时间："
                        onPress={() => { this.setState({ ModalVisible: true }); }}
                        placeholder={this.state.deadline}
                        myThis={this}
                    />
                </View>

                {/** 投票隐私 */}
                {this.getPrivacy()}

            </View>
        )
    }

    getButton() {
        return (
            <View style={styles.titleAndContent}>
                {/** 添加问题按钮 */}
                {this.getQuestionAddButton()}

                {/** 投票发布按钮 */}
                {this.getVoteAddButton()}
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <KeyboardAwareScrollView>

                    {/** 投票头部 */}
                    {this.getTitlePart()}

                    {/** 整个投票内容 */}
                    {this.getAllVoteContent()}

                    {/** 按钮部分 */}
                    {this.getButton()}
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const buttonWidthRatio = 0.2;
const buttonHeightRatio = 0.1;

const styles = StyleSheet.create({
    submitText: {
        fontSize: 16,
        color: '#0077FF',
    },
    submitButton: {
        //flex: 1,
        height: buttonHeightRatio * screenWidth,
        width: buttonWidthRatio * screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        //marginLeft: (1 - buttonWidthRatio) / 2 * screenWidth, //居中
        backgroundColor: 'white',
        borderColor: '#0077FF',
        borderWidth: 0.5,
        borderRadius: 4,
    },

    nullLine: {
        marginTop: 5,
    },

    textAddOption: {
        textDecorationLine: 'underline',
        color: 'blue',
    },

    buttons: {
        marginHorizontal: constBorderMarginWidth,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    titleAndContent: {
        marginHorizontal: constBorderMarginWidth,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    titlePart: { //投票头部

    },

    titleAndContentBottom: {
        //marginRight: constBorderMarginWidth,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderColor: constBorderColor,
        borderBottomWidth: constBorderWidth,
    },

    questionPart: { //问题部分
        marginBottom: constBorderDistance * 2,
        marginHorizontal: constBorderMarginWidth,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        borderColor: constBorderColor,
        borderWidth: constBorderWidth,

        backgroundColor: 'white',
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'stretch',
        // alignSelf: 'stretch',
    },

    optionContainer: { //与voteContentTitle完全相同
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: screenHeight / 16,
        borderColor: UI.TOP_COLOR,
        borderWidth: 1,
    },
    voteContentContainer: { //存放voteContent这一个大项
        flex: 1,
    },
    voteContentTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: screenHeight / 16,
        borderColor: UI.TOP_COLOR,
        borderWidth: 1,
    },
    mybarContainer: { //与HomeworkPost中一致
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginHorizontal: constBorderMarginWidth
    },

    calendar: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        //marginTop: constBorderDistance,
    },

    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
    },
    questionText: {
        width: 0.25 * screenWidth - constBorderMarginWidth,
        fontSize: 16,
        color: 'black',
        textAlign: 'left',
        //marginLeft : constBorderMarginWidth,
    },
    text: {
        width: 0.25 * screenWidth,
        fontSize: 16,
        color: 'black',
        textAlign: 'left',
    },
    textInput: {
        flex: 1,
        //marginLeft: 8,
        height: screenHeight / 16,
        borderColor: constBorderColor,
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
    content: {
        marginTop: constBorderDistance,
        height: screenHeight / 8,
        borderColor: constBorderColor,
        borderWidth: 1,
        flex: 1,
    },
    title: {
        marginTop: constBorderDistance,
        height: screenHeight / 16,
        borderColor: constBorderColor,
        borderWidth: 1,
        flex: 1,
        //width
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
        textAlignVertical: 'center',
        borderRadius: 10,
    },
    button: {
        flexDirection: 'row',
        width: screenWidth / 4,
    },
    buttonContainer: {
        flex: 1,
        //marginTop: constBorderDistance,
        justifyContent: 'center',
        flexDirection: 'row',
        height: screenHeight / 16,
        borderColor: 'transparent',
        borderWidth: 1,
    },
    touchbutton: {
        justifyContent: 'center',
        backgroundColor: 'white',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        marginRight: constBorderMarginWidth,
        //flex: 1,
        width: screenWidth / 8,
        height: screenHeight / 14,
    },
});

class MyBar extends Component {
    hours;
    minutes;
    constructor(props) {
        super(props);
        this.hours = [];
        this.minutes = [];
        for (var i = 0; i < 24; i++)
            this.hours.push((i < 10 ? '0' : '') + i);
        for (var i = 0; i < 60; i++)

            this.minutes.push((i < 10 ? '0' : '') + i);

    }
    render() {
        return (
            <View style={styles.mybarContainer}
            >
                <Text
                    style={styles.text}
                >
                    {this.props.title}
                </Text>
                <TextInput
                    onFocus={this.props.onPress}
                    placeholder={this.props.placeholder}
                    style={styles.textInput}
                    underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                />
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    marginLeft: 8
                }}>
                    <Wheel
                        style={{ height: 48, width: 30 }}
                        itemStyle={{ textAlign: 'center' }}
                        items={this.hours}
                        onChange={(index) => {
                            this.props.myThis.setState({ hour: (index.length == 1 ? ("0" + index) : ("" + index)) });
                        }}
                    />
                    <Text>:</Text>
                    <Wheel
                        style={{ height: 48, width: 30 }}
                        itemStyle={{ textAlign: 'center' }}
                        items={this.minutes}
                        onChange={(index) => {
                            this.props.myThis.setState({ minute: (index.length == 1 ? "0" + index : "" + index) });
                        }}
                    />
                </View>
            </View>
        );
    }
}

class Option extends Component {
    constructor(props) {
        super(props);
        //alert('哈哈哈哈');
        this.state = {
            isVisible: true, //选项是否可见，待删
            deleteButton: this.props.deleteButton, //删除按钮是否可见
            rank: this.props.rank, //不可修改
            titleNum: this.props.titleNum, //显示的标题num，可修改
            optionInput: '',
            optionText: this.props.text,
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //if (nextProps.rank != this.props.rank) return false;
        return true;
        return false;
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.text != this.state.optionText) {
            this.setState({ optionText: nextProps.text });
        }
    }

    funcOnChangeText(propsRank, propsText) {
        this.setState({ optionText: propsText });
        this.props.myThis.editOption(propsRank, propsText);
    }

    render() {
        //alert(this.props.titleNum + '这是Option的render');
        if (this.state.deleteButton)
            return (
                <View>
                    <View style={styles.titleAndContent}>
                        <Text style={styles.questionText}>
                            {'选项 ' + this.state.titleNum}
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                            onChangeText={(text) =>
                                this.funcOnChangeText(this.props.rank, text)
                            }
                            value={this.state.optionText}
                        />
                        <TouchableOpacity
                            onPress={() => { this.props.myThis._onPress2DeleteOption(this.props.rank) }}
                        >
                            <Image
                                source={require('../images/delete.png')}
                                style={{
                                    height: 22,
                                    width: 22,
                                    marginLeft: 12
                                }}
                                tintColor={global.theme.headerTintColor}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.nullLine}>

                    </View>
                </View>
            );
        else return (
            <View>
                <View style={styles.titleAndContent}>
                    <Text style={styles.questionText}>
                        {"选项 " + this.state.titleNum}
                    </Text>

                    <TextInput
                        style={styles.textInput}
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                        onChangeText={(text) =>
                            this.funcOnChangeText(this.props.rank, text)
                        }
                        value={this.state.optionText}
                    />
                </View>
                <View style={styles.nullLine}>

                </View>
            </View>
        );
    }
}

class Question extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true, //问题是否可见
            deleteButton: false, //删除按钮是否可见
            rank: this.props.rank, //不可修改
            titleNum: this.props.titleNum, //显示的问题标题num，可修改
            optionInitial: this.props.optionInitial, //初始值定为2，
            optionNum: this.props.optionInitial, //当前投票option的数量，每制造一个option则加一，每减少一个需要减一
            optionRank: this.props.optionInitial, //每个option的标识符，制造一个加一
            voteOptions: [],
            voteOptionsText: [], //放文本的
            voteTitle: '',
            voteMode: 1, //初始设置成1，即单选
            picture: null,
        }
    }

    _isMounted;

    /** 点击就加一个option */
    _onpress2AddOption() {
        var varOptionNum = this.state.optionNum;
        var varOptionRank = this.state.optionRank;
        //alert('first' + this.state.optionNum);
        this.setState({ optionNum: varOptionNum + 1 });
        this.setState({ optionRank: varOptionRank + 1 });
    }

    /** 点击就删除一个option */
    _onPress2DeleteOption(propsRank) {
        //alert('要删的rank是' + propsRank);
        var arrayTest = [];
        var array = this.state.voteOptions;
        var arrayLength = array.length;
        var arrayText = this.state.voteOptionsText;
        var num = 0;
        for (num = 0; num < arrayLength; num++) {
            if (array[num].props.rank == propsRank) {
                var l = 0;
                for (l = 0; l < num; l++) {
                    arrayTest[l] = array[l];
                }

                for (l = num; l < arrayLength - 1; l++) {
                    arrayTest.push(
                        <Option
                            rank={array[l + 1].props.rank}
                            titleNum={array[l + 1].props.titleNum}
                            deleteButton={true} //这里决定删除按钮
                            myThis={this}
                            isVisible={true}
                            text={arrayText[l + 1].option}
                        />

                    )
                }
                arrayText.splice(num, 1);
                varOptionNum = this.state.optionNum;
                this.setState({ optionNum: varOptionNum - 1 });
                this.setState({ voteOptions: arrayTest });
                this.setState({ voteOptionsText: arrayText });
                break;
            }
        }
    }

    /** 在这里将预先定好的两个option设置，并装入到voteOptions */
    componentWillMount() {
        //alert('先执行');
        var array = this.state.voteOptions;
        var arrayText = this.state.voteOptionsText;
        var num = 0;
        for (num = 1; num <= this.state.optionInitial; num++) {
            array.push(
                <Option
                    rank={num}
                    titleNum={num}
                    myThis={this}
                    isVisible={true}
                    deleteButton={false}
                    text=''
                />
            );
            arrayText.push(
                { 'option': "" }
            )
        }
        //var voteOptions = [{ 'option': option }, { 'option': varOption2 }];
        this.setState({ voteOptions: array }); //回调函数
        this.setState({ voteOptionsText: arrayText });
        this.editQuestion();
    }

    componentWillUpdate(nextProps, nextState) {
        //alert('更新在Question中执行方法');
        var array = this.state.voteOptions;
        var arrayText = this.state.voteOptionsText;
        if (nextState.optionNum > array.length) { //证明要添加新的
            array.push(
                <Option
                    rank={nextState.optionRank}
                    titleNum={nextState.optionNum}
                    deleteButton={true} //这里决定删除按钮
                    myThis={this}
                    isVisible={true}
                    text=''
                />
            );
            arrayText.push(
                { 'option': '' }
            )
            this.setState({ voteOptions: array });
        }
        else if (nextState.optionNum < array.length) { //证明要删除

        }
    }

    componentDidUpdate() {
        this.editQuestion();
    }

    editQuestion() {
        var array = { 'title': this.state.voteTitle, 'voteMode': this.state.voteMode, 'picture': this.state.picture, 'voteOptions': this.state.voteOptionsText };
        this.props.myThis.editVoteContents(this.props.titleNum, array);

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.optionNum != this.state.optionNum) return true;
        if (nextState.voteOptions != this.state.voteOptions) return true;
        if (nextState.voteOptionsText != this.state.voteOptionsText) return true;
        if (nextState.voteTitle != this.state.voteTitle) return true;
        if (nextState.voteMode != this.state.voteMode) return true;
        if (nextState.picture != this.state.picture) return true;

        return false;
    }

    /** 修改option */
    editOption(proRank, proText) {
        var array = this.state.voteOptions; //选项部分
        var arrayText = this.state.voteOptionsText;
        var num = 0;
        for (num = 0; num < array.length; num++) {
            if (array[num].props.rank == proRank) {
                arrayText[num] = { 'option': proText };
            }
        }
        this.setState({ voteOptionsText: arrayText });
    }


    /** 点击就删除该question，该方法需链接到主类的删除方法 */


    //测试方法，测试添加选项功能
    addOptionTest() { //需要传参
        var array = this.state.voteOptions;
        return (
            <View style={styles.voteContentContainer}>
                {array}
            </View>
        );

    }

    /** 投票标题 */
    getVoteContentTitle() {
        return (
            <View>
                <View style={styles.nullLine}>

                </View>
                <View style={styles.titleAndContent}>

                    <View>
                        <Text style={styles.questionText}>
                            标题
                    </Text>
                    </View>
                    <TextInput
                        placeholder={'请在此输入投票标题'}
                        onChangeText={(text) =>
                            this.setState({ voteTitle: text })
                        }
                        style={styles.textInput}
                        underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                    >
                    </TextInput>
                </View>
            </View>
        );
    }

    /** 投票模式 */
    getVoteContentVoteMode() {
        return (
            <View style={styles.titleAndContent}>
                <View>
                    <Text style={styles.questionText}>
                        模式
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <RadioModal
                        selectedValue={this.state.voteMode}
                        onValueChange={(id, item) => this.setState({ voteMode: id })}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <Text value={1}>单选</Text>
                        <Text value={2}>多选</Text>
                    </RadioModal>
                </View>
            </View>
        );
    }

    getQuestionHead() {
        return (
            <View
                style={styles.titleAndContentBottom}
            >
                {/** 问题标号 */}
                <Text style={{
                    width: 0.25 * screenWidth,
                    flex: 1,
                    fontSize: 16,
                    color: 'black',
                    textAlign: 'left',
                    marginLeft: constBorderMarginWidth,
                }}>
                    {'问题 ' + this.state.titleNum}
                </Text>

                {/* 添加选项*/}
                <TouchableOpacity style={styles.touchbutton}
                    onPress={() => { this._onpress2AddOption() }}
                >
                    <Text style={styles.textAddOption}

                    >
                        {'+ 选项'}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.questionPart}>

                {/** 头部 */}
                {this.getQuestionHead()}

                {/** 标题部分 */}
                {this.getVoteContentTitle()}

                {/** 投票模式 */}
                {this.getVoteContentVoteMode()}

                {/** 投票选项 */}
                {this.addOptionTest()}


            </View>
        );
    }

}