import {StyleSheet} from 'react-native';
import MyAdapter from '../screens/MyAdapter';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
//flatList统一样式表
export const blogListStyles = StyleSheet.create({
    blogTitleText:{
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 2,
        textAlign: 'left',
        color: 'black',
        fontFamily : 'serif',
    },
    blogSummaryText:{
        lineHeight: 25,
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'left',
        color: 'rgb(70,70,70)',
    },
    blogAppText:{
        fontSize: 10,
        textAlign: 'right',
        color: 'black',
        flex: 1,
    },
    blogAppAndTimeContainer:{
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
})
