import React, {Component} from 'react';
import {
    View,
} from 'react-native';
import {flatStyles} from '../styles/styles';

export default class ListSeperator extends Component {
    render() {
        return (
            <View style={[flatStyles.separatorStyle, {backgroundColor: global.theme.flatListSeperatorColor}]}/>
        )
    }
}