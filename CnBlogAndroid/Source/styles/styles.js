import {StyleSheet} from 'react-native';
import MyAdapter from '../screens/MyAdapter';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
//flatList统一样式表
export const flatStyles = StyleSheet.create({
    //容器样式
    listContainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        alignSelf: 'stretch',
        backgroundColor: 'white',
        paddingLeft: 0.03*screenWidth,
        paddingRight: 0.04*screenWidth,
    },
    //分割线样式
    separatorStyle:{
        height:1,
        justifyContent:'center',
        marginLeft: 15,
        marginRight: 0,
        backgroundColor:'#dcdcdc',
    },
    /* 列表项的样式。公告、博文等列表可使用此样式。具体的使用方法：
       对每个列表项，例如_renderItem()函数中的最顶层View应用此样式。*/
    cell:{
        flex: 1,
        padding: 8,
        marginLeft: 5,
        marginRight: 5,
        marginVertical: 3,
        borderColor: '#dddddd',
        borderStyle: null,
        //borderWidth: 0.5,
        borderRadius: 2,
    },
})
export const flatStylesWithAvatar = StyleSheet.create({
    cell:{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 5,
        paddingBottom: 8,
        marginLeft: 5,
        marginRight: 5,
        borderColor: '#dddddd',
    },
    listcontainer:{
        flex:1,
        flexDirection: 'row',
        marginRight: 5,
        maxHeight: screenHeight*0.25,
    },
    separatorStyle:{
        width: screenWidth,
        height:screenHeight*0.005,
        backgroundColor: '#EEEEF0',
    },
    avatarstyle: {
        width: 0.15*screenWidth,
        height: 0.15*screenWidth,
        marginBottom: 5,
        marginTop: 5,
        borderRadius : 40,
        left : 2,
    },
    promptText:{
        color:'#999999',
        fontSize:14,
        marginTop:5,
        marginBottom:5,
    },
    promptTextContainer:{
        height:30,
        alignItems:'center',
        justifyContent:'flex-start',
    },
})
export const nameImageStyles = StyleSheet.create({
    nameContainer:{
        width: 0.15*screenWidth,
        height: 0.15*screenWidth,
        borderRadius : 40,
        left : 2,
        marginTop: 5,
        marginRight: 10,
        backgroundColor: '#F5F5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameText:{
        fontSize: 24,
        color: '#0A140A',
    }
})
export const tabViewStyles = StyleSheet.create({
    ScrollableTabViewStyle:{

    },
})
