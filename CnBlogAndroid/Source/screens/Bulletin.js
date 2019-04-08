import Config from '../config';
import api from '../api/api.js';
import {authData} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import * as storage from '../Storage/storage.js'
import {StorageKey} from '../config'
import {UI} from '../config'
import {err_info} from '../config'

import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    FlatList,
    TouchableHighlight
} from 'react-native';

import {
    StackNavigator,
    TabNavigator,
    NavigationActions,

} from 'react-navigation';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
export default class Bulletin extends Component {
    constructor(props){
        super(props);
        this.state = {
            schoolClassId: this.props.navigation.state.params.schoolClassId,
        }
    }
    _isMounted;

    user_url;

    componentWillMount() {
        this._isMounted=true;
        let url = Config.BulletinList + this.state.schoolClassId;
        //let url = 'https://api.cnblogs.com/api/edu/schoolclass/' + this.state.schoolClassId;
        console.log(url);
        Service.Get(url).then((jsonData)=>{
            if(jsonData!=='rejected')
            {
              console.log(jsonData);
            }
        })
        .then(()=>{;
        })
        .catch((error) => {;
        });
    }

    _renderBulletinList() {
  		var data = [];
      /*
  		for(var i in this.state.blogs)
  		{
  				data.push({
  						key: this.state.blogs[i].blogId,
  						Title: this.state.blogs[i].title,
  						Url: this.state.blogs[i].url,
  						Description: this.state.blogs[i].description,
  						PostDate: this.state.blogs[i].dateAdded,
  						ViewCount: this.state.blogs[i].viewCount,
  						CommentCount: this.state.blogs[i].commentCount,
  				})
  		}
      */
      /*
  		return(
  			<FlatList
  				ItemSeparatorComponent={this._separator}
  				renderItem={this._renderItem}
  				data= {data}
  				onRefresh = {this.UpdateData}
  				refreshing= {false}
  				onEndReached={this._onEndReached.bind(this)}
  				onEndReachedThreshold={0.1}
  				ListFooterComponent={this._renderFooter.bind(this)}
  			/>
  		)*/
  	}

    UpdateData = () => { ;
  	}

    componentWillUnmount() {
        this._isMounted = false;
    }

    _onPress = ()=>{
      this.props.navigation.navigate('BulletinAdd',{
        schoolClassId: this.state.schoolClassId,});
    }

    render() {
        return (
            <View style = {styles.container}>

                <View style={{ height: 1, backgroundColor: 'rgb(225,225,225)',  marginTop: 0.005*screenHeight, alignSelf:'stretch'}}/>
                <View
                    style= {{
                        flexDirection: 'row',
                        justifyContent:'flex-start',
                        alignItems: 'flex-start',
                        alignSelf: 'stretch',
                        flex:1,
                    }}
                >
                    <FlatList
                        refreshing= {false}
                    />
					<TouchableHighlight
						underlayColor="#3b50ce"
						activeOpacity={0.5}
						style={{
							position:'absolute',
							bottom:20,
							right:10,
							backgroundColor: "#3b50ce",
							width: 52,
							height: 52,
							borderRadius: 26,
							justifyContent: 'center',
							alignItems: 'center',
							margin: 20}}
							onPress={this._onPress} >

						<Text
                            style= {{
                                fontSize: 30,
                                color: '#ffffff',
                                textAlign: 'center',
                                fontWeight: '100',
                            }}
                        >
                            +
                        </Text>

					</TouchableHighlight>
                </View>
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
    listcontainer: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        backgroundColor: 'white',
        marginLeft: 8,
        marginRight: 12,
        //alignSelf: 'stretch',
    },
    avatarstyle: {
        width: 0.15*screenWidth,
        height: 0.15*screenWidth,
        marginBottom: 5,
        marginTop: 5,
        borderRadius : 40,
        left : 2,
    },
    textcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex: 4,
        backgroundColor: 'white',
        //alignSelf: 'stretch',
    }
});
