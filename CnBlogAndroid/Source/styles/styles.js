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
})