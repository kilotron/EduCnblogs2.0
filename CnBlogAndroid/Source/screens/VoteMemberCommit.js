import React, {Component} from 'react';
import {
    View,
} from 'react-native';
import VoteCommit from '../component/VoteCommit';
import { getHeaderStyle } from '../styles/theme-context';
/**props.navigation传递memberId和voteId和voteContent */
export default class VoteMemberCommit extends Component {

    static navigationOptions = ({ navigation }) => ({
        /* ??global.theme???????????static navigationOptions,
            ????????????*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })

    constructor(props) {
        super(props);
    }

    render() {
        const params = this.props.navigation.state.params;
        return (
            <View style={{flex:1, backgroundColor:global.theme.backgroundColor}}>
                <VoteCommit
                    memberId={params.memberId}
                    voteId={params.voteId}
                    voteContent={params.voteContent}
                />
            </View>
        )
    }
}