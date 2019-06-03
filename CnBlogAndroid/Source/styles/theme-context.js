
export const themes = {
    light: {
        headerBackgroundColor: '#F8F8F8',
        headerTintColor: '#0077FF',
        backgroundColor: '#FDFDFD',
        textColor: '#444',
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
        
        // 设置页面的黑暗模式
        darkModeIconBackgroundColor: '#0079FF',
        darkModeIconTintColor: 'white',

        // 设置页面的接收推送图标
        recvPushIconBackgroundColor: '#4BD864', // 绿色
        recvPushIconTintColor: 'white',
    },

    // 下面的配色未完成
    dark: {
        headerBackgroundColor: '#363636',
        headerTintColor: '#FFCC00',
        backgroundColor: '#262626',
        textColor: '#EEE',
        buttonTextColor: '#FFCC00',
        buttonColor: '#3A3A3A',
        buttonBorderColor: '#FFCC00',
        selectionColor: '#555555',
        seperatorColor: '#DADADA',
        tabBarActiveTintColor: '#FFCC00',
        tabBarInactiveTintColor: '#DDD', // 需要调整
        addBackgroundColor: '#FFCC00',
        addUnderlayColor: '#0077FF',
        addTextColor: '#444',

        settingsSeperatorColor: '#666',
        darkModeIconBackgroundColor: '#CC9900',
        darkModeIconTintColor: '#DADADA',
        recvPushIconBackgroundColor: '#0B8A8C',
        recvPushIconTintColor: '#DDD',
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
