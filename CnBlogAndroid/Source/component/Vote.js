/** 投票详情
 * 显示一组投票的标题、图片、选项。
 * */
import React, {Component} from 'react';
import Choice from './Choice';
import PropTypes from 'prop-types';

import {
    View,
    Text,
    FlatList,
} from 'react-native';
import Echarts from 'native-echarts';

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
    /**如果disabled=true，不能修改选项。 */
    disabled: PropTypes.bool,
    recvSelectedIds: PropTypes.func,
    displayStats: PropTypes.bool,   // 是否显示投票统计, 如果true，则需要提供voteStats
    /* 一个数组，元素个数是投票题目的个数，顺序与投票题目顺序相同，每个元素是可以
     * 直接提供给Echarts组件的数据。如果数据还未准备好，voteStats请设为undefined */
    voteStats: PropTypes.array,     
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
        this.displayStats = typeof(this.props.displayStats) == 'boolean' ? this.props.displayStats : false;
        this.displayStats = this.displayStats && typeof(this.props.voteStats) != 'undefined';
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
        this.resetOptionIdsState(nextProps.data);
    }

    /**所有的投票内容 */
    render() {
        // extraData用于footerComponent的更新。
        return (
            <View style={{flex:1}}>
                <FlatList
                    renderItem={this.renderVoteItem}
                    data={this.props.data}
                    extraData={[]} // 强制重新渲染
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={this.headerComponent}
                    ListFooterComponent={this.footerComponent}
                />
            </View>
        );
    }

    renderVoteItem = ({item, index}) => {
        return (
            <View>
                <Choice
                    serialNumber={item.serialNumber}
                    type={item.type}
                    title={item.title}
                    imageSource={item.imageSource}
                    options={item.options}
                    disabled={this.props.disabled}
                    onClick={this.onClick.bind(this)}
                />
                {  
                    this.displayStats ? (
                        <View style={{marginHorizontal: 15, marginVertical: 5}} >
                            <Echarts option={this.props.voteStats[index]}/>
                        </View>
                    ) : null
                }
            </View>
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