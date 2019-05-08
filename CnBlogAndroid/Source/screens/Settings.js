import React, { Component} from 'react';
import { 
    View, 
    Text,
} from 'react-native';

export default class Settings extends Component {
    render() {
        return (
            <View style={{backgroundColor: '#555', flex: 1}}>
                <Text 
                    style={{
                        fontSize: 30,
                        textAlign: 'center',
                        marginTop: 280,
                        color: 'white',
                        fontStyle: 'italic',
                    }}
                >COMING SOON!!!</Text>
            </View>
        )
    }
}