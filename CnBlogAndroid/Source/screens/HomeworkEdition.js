import Config from '../config';
import api from '../api/api.js';
import {authData,err_info} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {
    Stepper,
    Wheel,
    Toast
} from 'teaset';
import React, { Component} from 'react';
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
    ScrollView
} from 'react-native';
import {RichTextEditor, RichTextToolbar} from 'react-native-zss-rich-text-editor';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= 16;
const marginHorizontalNum= 16;
const HtmlDecode = require('../DataHandler/HomeworkDetails/HtmlDecode');
const head = '<!DOCTYPE html><html><head>'+
'<meta charset="utf-8"/>'+
'<meta name="viewport" content="width=device-width, initial-scale=1" />'+
'<style type="text/css">  * {word-wrap:break-word; word-break:break-all;}</style>'+
'</head>';
export default class homeworkEdition extends Component {
    constructor(props){
        super(props);
        let {title,startTime,deadline,content,formatType,isShowInHome} = this.props.navigation.state.params; 
        let startDateAndTime = startTime.split('T');
        let startDotTime = startDateAndTime[1].split(':');
        let endDateAndTime = deadline.split('T');
        let endDotTime = endDateAndTime[1].split(':');
        this.state={
            formatType: formatType,//1: TintMce 2: Markdown
            title: title,
            content: this.cutContent(content),
            isShowInHome: isShowInHome,// true or false
            startModalVisible: false,
            endModalVisible: false,
            startDate: startDateAndTime[0],
            endDate: endDateAndTime[0],
            startHour: startDotTime[0],
            startMinute:startDotTime[1],
            endHour:endDotTime[0],
            endMinute:endDotTime[1],
        };
    }
    cutContent(text){
        let newContent = text.replace(head,'');
        return newContent.replace(/(.*)<\/html>/,'');
    }
    // dateString : xxxx-xx-xx a:b
    StringtoDate= (dateString)=>{
        let date1 = dateString.split(' ')[0];
        let date2 = dateString.split(' ')[1];
        let yeartoday = date1.split('-');
        let hourtominute = date2.split(':');
        //let result  = new Date();
        return new Date(Number(yeartoday[0]),Number(yeartoday[1]),Number(yeartoday[2]),Number(hourtominute[0]),Number(hourtominute[1]),0);
        //return result;
    }
    _onPress=()=>{
        this.getHTML().then((result)=>{
            homeworkBody=result;
            if(homeworkBody.title!=''&&homeworkBody.content!='')
            {
                //let url = 'https://api.cnblogs.com/api/edu/homework/publish';
                let url = Config.HomeWorkEdit + this.props.navigation.state.params.homeworkId;
                let classId = Number(this.props.navigation.state.params.classId);
                let postBody = {
                    homeworkId:this.props.navigation.state.params.homeworkId,
                    operatorInfo:this.props.navigation.state.params.operatorInfo,
                    schoolClassId:this.props.navigation.state.params.operatorInfo.schoolClassId,
                    blogId:this.props.navigation.state.params.operatorInfo.blogId,
                    title: homeworkBody.title,
                    startTime: this.state.startDate+" "+this.state.startHour+":"+this.state.startMinute,
                    deadline: this.state.endDate+" "+this.state.endHour+":"+this.state.endMinute,
                    content: homeworkBody.content,
                    formatType: Number(this.state.formatType),
                    isShowInHome: this.state.isShowInHome,
                }
                let st = this.StringtoDate(postBody.startTime);
                let ed = this.StringtoDate(postBody.deadline);
                
                if(st>=ed)
                {
                    ToastAndroid.show("截止日期必须在开始日期之后！",ToastAndroid.SHORT);
                }
                else
                {
                    let body = JSON.stringify(postBody);
                    Service.UserAction(url,body,'PATCH').then((response)=>{
                        if(response.status !== 200)
                        {
                            return null;
                        }
                        else
                        {
                            return response.json();
                        }
                    }).then((jsonData)=>{
                        if(jsonData===null)
                        {
                            ToastAndroid.show('请求失败！',ToastAndroid.SHORT);
                        }
                        else if(jsonData.isSuccess)
                        {
                            ToastAndroid.show('编辑成功，请刷新查看！',ToastAndroid.SHORT);
                            this.props.navigation.goBack();
                        }
                        else if(jsonData.isWarning)
                        {
                            ToastAndroid.show(jsonData.message,ToastAndroid.SHORT);
                        }
                        else
                        {
                            ToastAndroid.show('发生错误，请稍后重试！',ToastAndroid.SHORT);
                        }
                    }).catch((error)=>{ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT)})  
                }
            }
            else
            {
                ToastAndroid.show("标题或内容不能为空！",ToastAndroid.SHORT);
            }
        })
    }
    setStartModalVisible(visible) {
        this.setState({startModalVisible: visible});
    }
    setEndModalVisible(visible) {
        this.setState({endModalVisible: visible});
    }
    render() {
    return (
        <View
            style= {{
                flexDirection: 'column',
                flex: 1,
                backgroundColor: 'white'
            }}
        >
            <Modal
              animationType={"slide"}
              transparent={false}
              visible={this.state.startModalVisible}
              onRequestClose={() => {ToastAndroid.show("请选择一个日期",ToastAndroid.SHORT);}}
              >
             <View style={{
                 flex: 1,
                 marginTop: 22
             }}>
                <View
                    style= {{
                        flex: 1,
                    }}
                >
                <Calendar
                  onDayPress={(day) => {
                      this.setState({startDate:day.dateString});
                      this.setStartModalVisible(!this.state.startModalVisible);
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#3b50ce',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: 'red'
                  }}                                                        
                />
                </View>
             </View>
            </Modal>
            <Modal
              animationType={"slide"}
              transparent={false}
              visible={this.state.endModalVisible}
              onRequestClose={() => {ToastAndroid.show("请选择一个日期",ToastAndroid.SHORT);}}
              >
             <View style={{
                 flex: 1,
                 marginTop: 22
             }}>
                <View
                    style= {{
                        flex: 1,
                    }}
                >
                <Calendar
                  onDayPress={(day) => {
                      this.setState({endDate:day.dateString});
                    this.setEndModalVisible(!this.state.endModalVisible);
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#3b50ce',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: 'red'
                  }}                                                        
                />
                </View>
             </View>
            </Modal>

            <View style= {styles.container}
            >

            </View>

            <MyBar
                title= "起始时间"
                onPress={()=>{this.setStartModalVisible(true);}}
                placeholder={this.state.startDate}
                myThis= {this}
                myPrefix= "start"
            />
            <MyBar
                title= "截止时间"
                onPress={()=>{this.setEndModalVisible(true);}}
                placeholder={this.state.endDate}
                myThis= {this}
                myPrefix= "end"
            />
            <View style= {styles.container}
            >
                <Text
                    style= {styles.text}
                >
                    格式类型
                </Text>
                <View
                    style= {styles.textInput}
                >
                    <Picker
                        style= {styles.picker}
                        mode= 'dropdown'
                          selectedValue={this.state.formatType === 1 ? '1' : '2'}
                          onValueChange={(type) => this.setState({formatType: type === '1' ? 1 : 2})}>
                          <Picker.Item label="TinyMce" value="1" />
                          <Picker.Item label="Markdown" value="2" />
                    </Picker>
                </View>
            </View>
            <View style= {styles.container}
            >
                <Text
                    style= {styles.text}
                >
                    首页显示
                </Text>
                <View
                    style= {styles.textInput}
                >
                    <Picker
                        style= {styles.picker}
                        mode= 'dropdown'
                          selectedValue={this.state.isShowInHome ? 'true' : 'false'}
                          onValueChange={(type) => {this.setState({isShowInHome: type === 'true'})}}>
                          <Picker.Item label="是" value="true" />
                          <Picker.Item label="否" value="false" />
                    </Picker>
                </View>
            </View>
            <View style= {styles.tichTextContainer}
            >
                <RichTextEditor
                    ref={(r)=>this.richtext = r}
                    style={styles.richText}
                    initialTitleHTML={this.state.title}
                    initialContentHTML={this.state.content}
                    editorInitializedCallback={() => this.onEditorInitialized()}
                />
                <RichTextToolbar
                    getEditor={() => this.richtext}
                />
                {Platform.OS === 'ios' && <KeyboardSpacer/>}
            </View>
            <View style= {{
                flexDirection: 'row',
                justifyContent:'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                marginVertical:16,
                marginHorizontal:marginHorizontalNum
            }}
            >
                <TouchableHighlight
                    underlayColor="#3b50ce"
                    activeOpacity={0.5}
                    style= {{
                        width:0.35*screenWidth,
                        alignSelf: 'flex-end',
                        borderRadius: 0.01*screenHeight,
                        padding: 0.01*screenHeight,
                        backgroundColor:"#3b50ce"
                    }}
                    onPress={()=>{
                        this._onPress();
                    }}//关联函数
                >
                    <Text
                        style= {{
                            fontSize: btnFontSize,
                            color: '#ffffff',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        发布
                    </Text>
                </TouchableHighlight>
            </View>
        </View>
    );
  }

  async getHTML() {
    const contentHtml = await this.richtext.getContentHtml();
    const titleText = await this.richtext.getTitleText();
    return {
        content:contentHtml,
        title:titleText,
    };
  }
}

class MyBar extends Component{
    hours;
    minutes;
    constructor(props){
        super(props);
        this.hours= [];
        this.minutes= [];
          for (var i= 0;i<24;i++)
              this.hours.push((i<10?'0':'')+i);
          for (var i= 0;i<60;i++)

              this.minutes.push((i<10?'0':'')+i);

    }
    render(){
        var initMinute = '00';
        var initHour = '00';
        if (this.props.myPrefix==="start"){
            initHour = this.props.myThis.state.startHour;
            initMinute = this.props.myThis.state.startMinute;
        }
        else if (this.props.myPrefix==="end"){
            initMinute = this.props.myThis.state.endMinute;
            initHour = this.props.myThis.state.endHour;
        }
        return(
            <View style= {styles.container}
            >
                <Text
                    style= {styles.text}
                >
                    {this.props.title}
                </Text>
                <TextInput
                    onFocus= {this.props.onPress}
                    placeholder= {this.props.placeholder}
                    style={styles.textInput}
                    underlineColorAndroid="transparent"//设置下划线背景色透明 达到去掉下划线的效果
                />
                <View style= {{
                    flexDirection: 'row',
                    justifyContent:'flex-start',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    marginLeft:8
                }}>
                    <Wheel
                      style={{height: 48, width: 30}}
                      itemStyle={{textAlign: 'center'}}
                      items={this.hours}
                      index={initHour.lengh == 1 ? '0'+initHour : initHour}
                      onChange= {(index)=>{
                          if (this.props.myPrefix==="start"){
                              this.props.myThis.setState({startHour:""+index});
                          }else if (this.props.myPrefix==="end"){
                              this.props.myThis.setState({endHour:""+index});
                          }
                      }}
                    />
                    <Text>:</Text>
                    <Wheel
                      style={{height: 48, width: 30}}
                      itemStyle={{textAlign: 'center'}}
                      items={this.minutes}
                      index={initMinute.lengh == 1 ? '0'+ initMinute : initMinute}
                      onChange= {(index)=>{
                          if (this.props.myPrefix==="start"){
                              this.props.myThis.setState({startMinute:""+index});
                          }else if (this.props.myPrefix==="end"){
                              this.props.myThis.setState({endMinute:""+index});
                          }
                      }}
                    />
                  </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop:16,
        marginHorizontal:16
    },
    text:{
        width:0.2*screenWidth,
        fontSize: 16,
        color: 'black',
        textAlign: 'left',
    },
    textInput:{
        flex:1,
        marginLeft:8,
        height: screenHeight/18,
        borderColor: 'gray',
        borderWidth: 1        
    },
    picker:{
        flex:1,
        height: screenHeight/18,
        color:'#000000',
    },
    richText: {
        height:screenHeight/2,
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tichTextContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        paddingTop: 40
    },
});