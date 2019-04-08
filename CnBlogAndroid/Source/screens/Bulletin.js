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
} from 'react-native';

import {
    StackNavigator,
    TabNavigator,
    NavigationActions,
} from 'react-navigation';

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
        let url = Config.BulleinList + this.state.schoolClassId;
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

    render() {
        return (
            <View>
                <Text>什么也没有...(未实现)</Text>
            </View>
        );
    }
}
