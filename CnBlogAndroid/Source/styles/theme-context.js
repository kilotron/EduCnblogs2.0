
export const themes = {
    light: {
        headerBackgroundColor: '#F8F8F8',
        headerTintColor: '#0077FF',
        backgroundColor: '#FDFDFD',
        textColor: '#444',
        grayTextColor: 'gray',
        buttonTextColor: '#0077FF',
        buttonColor: '#FBFBFB',
        buttonBorderColor: '#0077FF',
        selectionColor: '#DDF1FF',
        seperatorColor: '#DADADA',
        tabBarActiveTintColor: '#0077FF',
        tabBarInactiveTintColor: '#333',
        addBackgroundColor: '#777',
        addUnderlayColor: '#0077FF',
        addTextColor: '#FFF',

        settingsSeperatorColor: '#DDD',
        flatListSeperatorColor: '#DDD',
        
        // 设置页面的黑暗模式
        darkModeIconBackgroundColor: '#0079FF',
        darkModeIconTintColor: 'white',

        // 设置页面的接收推送图标
        recvPushIconBackgroundColor: '#4BD864', // 绿色
        recvPushIconTintColor: 'white',

        // 个人信息页面的园龄
        seniorityBackgroundColor: '#E4F2FF',
        seniorityForegroundColor: '#0E97FF',

        // 个人信息页面的博客地址图标
        urlIconBackgroundColor: '#0079FF',
        urlIconTintColor: 'white',

        // 个人信息页面的日程提醒图标
        calendarIconBackgroundColor: '#0079FF',
        calendarIconTintColor: 'white',
        
        // 个人信息页面的收藏列表图标
        bookmarkIconBackgroundColor: '#4BD864',
        bookmarkIconTintColor: 'white',

        // 个人信息页面的浏览记录图标
        historyIconBackgroundColor: '#4BD864',
        historyIconTintColor: 'white',

        // 个人信息页面的设置图标
        settingIconBackgroundColor: '#8E8E8E',
        settingIconTintColor: 'white',

        // 个人信息页面的关于图标
        aboutIconBackgroundColor: '#34AADB',
        aboutIconTintColor: 'white',

        // 个人信息页面的退出登录图标
        logoutIconBackgroundColor: '#FD3A2F',
        logoutIconTintColor: 'white',
    },

    // 下面的配色未完成
    dark: {
        headerBackgroundColor: '#363636',
        headerTintColor: '#FFCC00',
        backgroundColor: '#262626',
        textColor: '#EEE',
        grayTextColor: '#DDD',
        buttonTextColor: '#FFCC00',
        buttonColor: '#3A3A3A',
        buttonBorderColor: '#FFCC00',
        selectionColor: '#555555',
        seperatorColor: '#262626',        // 与背景颜色相同，相当于隐藏分隔线
        tabBarActiveTintColor: '#FFCC00',
        tabBarInactiveTintColor: '#DDD', // 需要调整
        addBackgroundColor: '#FFCC00',
        addUnderlayColor: '#0077FF',
        addTextColor: '#444',

        settingsSeperatorColor: '#666',
        flatListSeperatorColor: '#666',
        darkModeIconBackgroundColor: '#CC9900',
        darkModeIconTintColor: '#DADADA',
        recvPushIconBackgroundColor: '#0B8A8C',
        recvPushIconTintColor: '#DDD',

        seniorityBackgroundColor: '#514E2D',
        seniorityForegroundColor: '#D8AD00',
        urlIconBackgroundColor: '#CC9900',
        urlIconTintColor: '#DDD',
        calendarIconBackgroundColor: '#CC9900',
        calendarIconTintColor: '#DDD',
        bookmarkIconBackgroundColor: '#0B8A8C',
        bookmarkIconTintColor: '#DDD',
        historyIconBackgroundColor: '#0B8A8C',
        historyIconTintColor: '#DDD',
        settingIconBackgroundColor: '#8E8E8E',
        settingIconTintColor: '#DDD',
        aboutIconBackgroundColor: '#34AADB',
        aboutIconTintColor: '#EEE',
        logoutIconBackgroundColor: '#FD3A2F',
        logoutIconTintColor: '#DDD',
    },
};

export const navigationHeaderHeight = 45;
export const homeTabHeaderHeight = 50;

export function getHeaderStyle() {
    return {
        height: navigationHeaderHeight,
        elevation: 1,
        backgroundColor: global.theme.headerBackgroundColor,
    };
}
