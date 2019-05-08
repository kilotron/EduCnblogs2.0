/** 投票详情
 * 显示一组投票的标题、图片、选项。
 * */
import React, {Component} from 'react';
import Choice from './Choice';
import PropTypes from 'prop-types';

import {
    View,
    FlatList,
} from 'react-native';

VoteProps = {
    /**data = [
     * {
     *  serialNumber:number,
     *  type:'Single'/'Multiple',
     *  title: string,
     *  imageSource: url/null,
     *  options: [{id: number, text: string, selected: bool},...],
     * },...] */
    data: PropTypes.array.isRequired,
    headerComponent: PropTypes.func,
    footerComponent: PropTypes.func,
    /**disabled=true，不能修改选项。 */
    disabled: PropTypes.bool,
    recvSelectedIds: PropTypes.func,
}

export default class Vote extends Component {
    constructor(props) {
        super(props);

        /** 各个选项的选中状态, key是题目编号，value是一个Map
         * 这个Map的key是选项id，value是true/false。
         * this.optionIdsState是维护Vote组件内所有选项选中状态的变量，在子组件Choice
         * 发生变化时，需要修改optionIdsState来保持选项选中状态的一致性，但
         * optionIdsState不决定子组件Choice的选中状态。
         */
        this.optionIdsState = new Map();  
        this.headerComponent = this.props.headerComponent ? this.props.headerComponent : null; 
        this.footerComponent = this.props.footerComponent ? this.props.footerComponent : null;
        // 设置optionsIdsState初始值
        this.resetOptionIdsState(this.props.data);
    }

    /**从参数data中提取各个选项的选中状态。此函数只在设置optionsIdsState初始值或者
     * 接收到新的data时更新optionsIdsState时调用。此函数不改变子组件Choice的选中状态。*/
    resetOptionIdsState(data) {
        for (let i in data) {
            let options = data[i].options;
            let ids = new Map();
            this.optionIdsState.set(data[i].serialNumber, ids);
            for (let j in options) {
                ids.set(options[j].id, 
                    typeof(options[j].selected)=='undefined'?false:options[j].selected);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        // 更新optionsIdsState变量
        this.resetOptionIdsState(nextProps.data)
    }

    /**所有的投票内容 */
    render() {
        // extraData用于footerComponent的更新。
        return (
            <View style={{flex:1}}>
                <FlatList
                    renderItem={this.renderVoteItem}
                    data={this.props.data}
                    extraData={this.props.disabled}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={this.headerComponent}
                    ListFooterComponent={this.footerComponent}
                />
            </View>
        );
    }

    renderVoteItem = ({item, index}) => {
        return (
            <Choice
                serialNumber={item.serialNumber}
                type={item.type}
                title={item.title}
                imageSource={item.imageSource}
                options={item.options}
                disabled={this.props.disabled}
                onClick={this.onClick.bind(this)}
            />
        )
    }

    /**参数_optionIds是一个Map */
    onClick(_optionIds) {
        _optionIds.forEach((isSelected, id, map) => {
            this.optionIdsState.forEach((oldIdState, serialNumber, map) => {
                if (oldIdState.get(id) != null) {
                    oldIdState.set(id, isSelected);
                }
            })
        })
        let ids = [];
        let selectedSerialNumber = [];//已经有选择的题的序号
        let unselectedSerialNumber = [];// 还没有选中的题的序号
        this.optionIdsState.forEach((idState, serialNumber, map) => {
            let selected = false;
            idState.forEach((isSelected, id, map) => {
                if (isSelected) {
                    ids.push(id);
                    selected = true;
                }
            });
            if (selected) {
                selectedSerialNumber.push(serialNumber);
            } else {
                unselectedSerialNumber.push(serialNumber);
            }
        });
        if (this.props.recvSelectedIds) {
            let info = {};
            info.unselectedNumbers = unselectedSerialNumber.toString();
            info.selectedNumbers = selectedSerialNumber.toString();
            info.complete = unselectedSerialNumber.toString() == '';
            this.props.recvSelectedIds(ids, info);
        }
    }
    
}

Vote.PropTypes = VoteProps;