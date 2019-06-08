/**一个选择题 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import CheckBox from 'react-native-check-box';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';

const ChoiceProps = {
    serialNumber: PropTypes.number, // 编号不是必须的，有编号则显示
    type: PropTypes.oneOf(['Single', 'Multiple']).isRequired,
    title: PropTypes.string.isRequired,
    imageSource: PropTypes.string,  // 图片不是必须的
    options: PropTypes.array.isRequired,
    disabled: PropTypes.bool,       // 可选，默认disabled=false
    onClick: PropTypes.func,        // 选项改变时可调用的函数，函数的参数是被选中的选项id数组
}

export default class Choice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: new Map(),  // 各个选项的选中状态
        }
        this.selectedIndex = null; // 单选框的选中项
        this.getSelected(this.props.options);
    }

    getSelected(options) {
        this.selectedIndex = null; // 单选框的选中项，默认不选中
        for (let i in options) {
            this.state.isChecked.set(options[i].id, false); // 默认不选中
            if (options[i].selected) {
                this.selectedIndex = i; // 单选：获得初始时被选中的选项的index
                this.state.isChecked.set(options[i].id, true);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.getSelected(nextProps.options);
    }

    render() {
        return (
            <View>
                {this.renderHeader()}
                {
                    this.props.type=='Single' ? this.renderSingleChoiceOptions() :
                    this.renderMultipleChoiceOptions()
                }
            </View>
        )
    }

    /**一道题的序号、标题和图片 */
    renderHeader() {
        let title = '';

        // 序号可选
        if (typeof(this.props.serialNumber) == 'undefined') {
            title = this.props.title;
        } 
        else {
            title = this.props.serialNumber + '. ' + this.props.title;
        }

        return (
            <View style={styles.voteItemHeaderView}>
                <Text style={styles.voteItemTitleText}>{title}</Text>
                {
                    this.props.imageSource ? (
                        <Image
                            style={styles.voteItemImage}
                            source={{uri: this.props.imageSource}}
                            resizeMode='contain'
                            alignSelf='center'
                        />
                    ): (null)
                }
            </View>
        );
    }

    /**一个单选题的全部选项 */
    renderSingleChoiceOptions() {
        let options = this.props.options;
        let radioButtons = [];
        let disabled = typeof(this.props.disabled)=='undefined'?false:this.props.disabled;
        for (let i in options) {
            radioButtons.push(
                <RadioButton
                    value={options[i].id}
                    key={options[i].id}
                    style={styles.voteRadioButton}
                    disabled={disabled}
                >
                    <Text style={[styles.voteRadioButtonText, {color : disabled ? '#CCC': '#666'}]}>{options[i].text}</Text>
                </RadioButton>
            )
        }
        return (
            <RadioGroup 
                style={styles.voteRadioGroup}
                size={18}                   // radio button的大小
                thickness={2}
                color='#666'                // 圆圈的颜色
                highlightColor='#fdfdfd'    // 选中时的背景颜色
                onSelect={(index, id) => {  // 第二个参数是选项value
                    let optionIds = new Map();
                    this.state.isChecked.forEach((value, key, map) => {
                        if (id == key) {
                            optionIds.set(key, true);
                        } else {
                            optionIds.set(key, false);
                        }
                    })
                    this.state.isChecked = optionIds;
                    if (this.props.onClick) { // 传递被选中的选项ID
                        this.props.onClick(optionIds);
                    }
                }}
                selectedIndex={this.selectedIndex}
            >
                {radioButtons}
            </RadioGroup>
        )
    }


    /** 一个多选题的全部选项 */
    renderMultipleChoiceOptions() {
        let options = this.props.options;
        let checkBoxes = [];
        let disabled = typeof(this.props.disabled)=='undefined'?false:this.props.disabled;
        for (let i in options) {
            checkBoxes.push(
                <CheckBox 
                    key={options[i].id}
                    rightText={options[i].text} 
                    rightTextStyle={disabled ? styles.voteCheckBoxTextDisabled 
                        : styles.voteCheckBoxText}
                    onClick={() => {
                        // 选中状态取反
                        this.state.isChecked.set(options[i].id, 
                            !this.state.isChecked.get(options[i].id));
                        if (this._isMounted) {
                            this.setState({
                                isChecked: this.state.isChecked,
                            })
                        }
                        this.forceUpdate();
                        // 传递被选中选项的id的值
                        let optionIds = new Map();
                        this.state.isChecked.forEach((value, key, map) => {
                            optionIds.set(key, value);
                        });
                        if (this.props.onClick) {
                            this.props.onClick(optionIds);
                        }
                    }}
                    style={styles.voteCheckBox}
                    checkBoxColor={disabled ? '#CCC': '#666'}
                    isChecked={this.state.isChecked.get(options[i].id)}
                    disabled={disabled}
                />
            )
        }

        return (
            <View style={styles.checkBoxesView}>
                {checkBoxes}
            </View>
        );
    }
}

Choice.PropTypes = ChoiceProps;

const styles = StyleSheet.create({
    voteItemHeaderView: {
        marginHorizontal: 15,
        marginTop: 5
    },
    voteItemTitleText: {
        fontSize: 16, 
        color: '#444'
    },
    voteItemImage: {
        width: 200, 
        height: 100, 
        marginTop: 10
    },
    voteRadioGroup: {
        marginHorizontal: 15, 
        marginVertical: 10
    },
    checkBoxesView: {
        marginHorizontal: 15, 
        marginVertical: 10
    },
    voteRadioButton: {
        padding: 5, 
        marginHorizontal: 10, 
        marginVertical: 2
    },
    voteRadioButtonText: {
        fontSize: 15, 
        color: '#555', 
        marginLeft: 5
    },
    voteCheckBoxText: {
        fontSize: 15, 
        color: '#555', 
        marginLeft: 5
    },
    voteCheckBoxTextDisabled: {
        fontSize: 15, 
        color: '#BBB', 
        marginLeft: 5
    },
    voteCheckBox: {
        padding: 2, 
        marginHorizontal: 10, 
        marginVertical: 2
    },
})