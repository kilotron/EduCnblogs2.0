import React, {Component} from 'react';
import {
    View,
} from 'react-native';
import VoteCommit from '../component/VoteCommit';

/**props.navigation传递memberId和voteId和voteContent */
export default class VoteMemberCommit extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const params = this.props.navigation.state.params;
        return (
            <View style={{flex:1, backgroundColor:'white'}}>
                <VoteCommit
                    memberId={params.memberId}
                    voteId={params.voteId}
                    voteContent={params.voteContent}
                />
            </View>
        )
    }
}