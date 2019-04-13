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
        backgroundColor:'#dcdcdc'
    },
    /* 列表项的样式。公告、博文等列表可使用此样式。具体的使用方法：
       对每个列表项，例如_renderItem()函数中的最顶层View应用此样式。*/
    cell:{
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        paddingVertical:10,
        marginLeft: 5,
        marginRight: 5,
        marginVertical: 3,
        borderColor: '#dddddd',
        borderStyle: null,
        borderWidth: 0.5,
        borderRadius: 2,
        shadowColor: 'gray',    // 设置阴影
        shadowOffset: {width:0.5, height: 0.5},
        shadowOpacity: 0.4,   // 透明度
        shadowRadius: 1,
        elevation:3   //   高度，设置Z轴，可以产生立体效果
    },
})
export const tabViewStyles = StyleSheet.create({
    ScrollableTabViewStyle:{

    }, 
})