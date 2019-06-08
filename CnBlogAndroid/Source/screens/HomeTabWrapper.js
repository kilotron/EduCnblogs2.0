import React, {Component} from 'react'
import {
    View,
    Image,
    Dimensions,
} from 'react-native'
import {
    StackNavigator,
    TabNavigator,
    NavigationActions,
    TabBarBottom,
} from 'react-navigation';
import PersonalBlog from './PersonalBlog'
import ClassListsNew from './ClassListsNew'
import UserInformation from './UserInformation'
const { height, width } = Dimensions.get('window');

const TabBar = (props) => {
    const { navigationState } = props;
    let newProps = props;

    newProps = Object.assign(
        {},
        props,
        {
            style: {
                backgroundColor: 'transparent',
            },
            activeTintColor: global.theme.tabBarActiveTintColor,
            inactiveTintColor: global.theme.tabBarInactiveTintColor,
            labelStyle: {
                marginTop: 0,
                fontSize: 10,
            },
            iconStyle: {
                marginTop: 10,
            },
            tabStyle: {
                height: height/13,
            },
            indicatorStyle: {
                height: 0, // 去掉指示线
            },
        },
    );

    return (
        <TabBarBottom {...newProps} />
    )
};

const HomeTab = TabNavigator({
    PersonalBlog: {
        screen: PersonalBlog,
        navigationOptions: {
            tabBarLabel: '我的博客',
            tabBarIcon: ({focused, tintColor}) => (
                <Image
                    resizeMode='contain'
                    source={require('../images/nav_blog.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            )
        }
    },
    ClassListsNew: {
        screen: ClassListsNew,
        navigationOptions: {
            tabBarLabel: '我的班级',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image
                    resizeMode='contain'
                    source={require('../images/nav_class.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            )
        }
    },
    UserInformation: {
        screen: UserInformation,
        navigationOptions: {
            tabBarLabel: '我',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image
                    resizeMode='contain'
                    source={require('../images/nav_i.png')}
                    style={{height: 20, tintColor: tintColor}}
                ></Image>
            ),
        },
    },
},{
    tabBarPosition: 'bottom',
    initialRouteName: 'PersonalBlog',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
        showIcon: true,
        showLabel: true,
        activeTintColor: global.theme.tabBarActiveTintColor,
        inactiveTintColor: global.theme.tabBarInactiveTintColor,
        labelStyle: {
            marginTop: 0,
            fontSize: 10,
        },
        iconStyle: {
            marginTop: 10,
        },
        style: {
            backgroundColor: 'transparent',
        },
        tabStyle: {
            height: height/13,
        },
        indicatorStyle: {
            height: 0, // 去掉指示线
        },
    },
    tabBarComponent: TabBar,
})

// 测试使用
export default class HomeTabWrapper extends Component {

    constructor(props) {
        super(props);
        global.refreshAll = () => {
            this.forceUpdate();
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: global.theme.backgroundColor}}>
                <HomeTab navigation={this.props.navigation}/>
            </View>
        )
    }
}

HomeTabWrapper.router = HomeTab.router;