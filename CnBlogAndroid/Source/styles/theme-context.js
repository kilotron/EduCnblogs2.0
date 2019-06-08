
export const themes = {
    light: {    // 主题色='#0077FF'，蓝色
        headerBackgroundColor: '#F8F8F8',   // 标题栏背景颜色，略比常规背景颜色深/浅
        headerTintColor: '#0077FF',         // 标题栏标题/图标颜色，与主题色相同：蓝色
        backgroundColor: '#FDFDFD',         // 常规背景颜色，一般场景下使用
        textColor: '#444',                  // 正文文字颜色，大段文字的情况下使用
        grayTextColor: '#666',              // 需要不突出显示的文字颜色，比正文文字颜色略浅
        buttonTextColor: '#0077FF',         // 按钮文字颜色，与主题色相同
        buttonColor: '#FBFBFB',             // 按钮背景颜色，比常规背景颜色略深/浅
        buttonBorderColor: '#0077FF',       // 按钮边框颜色，与主题色相同，例：公告详情页
        selectionColor: '#DDF1FF',          // 文字选择颜色，淡蓝色，例：公告详情页
        seperatorColor: '#DADADA',          // 分隔线颜色，比常规背景颜色更深/浅，灰色

        // 我的班级页面的4个标签栏，公告、作业、博文、投票
        tabBarActiveTextColor: '#0077FF',   // 标签栏选中颜色，与主题色相同
        tabBarInactiveTextColor: '#333',    // 标签栏未选择颜色，与正文文字颜色相近即可
        tabBarBackgroundColor: 'white',     // 标签栏背景颜色，白色
        tabBarBorderColor: '#CCC',          // 标签栏下边界的颜色，与标签栏背景颜色有区别即可
        tabBarActiveTintColor: '#0077FF',   // 底部标签栏选中颜色，与主题色相同
        tabBarInactiveTintColor: '#333',    // 底部标签栏未选择颜色，与正文文字颜色相近
        
        addBackgroundColor: '#777',         // 添加按钮背景颜色，灰色，例：公告列表页面
        addUnderlayColor: '#0077FF',        // 添加按钮按下时的颜色
        addTextColor: '#FFF',               // 添加按钮文字颜色，即'+'的颜色：白色
        promptTextColor: '#999',            // 列表提示文字，例：公告列表页最下方的文字
        cellBorderColor: '#DDD',            // 列表项边框的颜色，例：公告列表页
        avatarBackgroundColor: '#F5F5FF',   // 头像背景颜色，一般用于班级博客列表等
        avatarTextColor: '#444',            // 头像文字颜色
        filterBorderBottomColor: '#EEE',    // 班级博文列表的筛选框的下边界颜色
        filterBorderTopColor: '#bdbdbd',    // 班级博文列表的筛选框的上边界颜色

        // 作业列表
        homeworkTitleColor: '#111',                 // 作业标题颜色，与正文文本颜色相近
        homeworkGrayTitleColor: '#BBB',             // 需要不突出显示的作业标题颜色，灰色
        homeworkClosedTimeTextColor: '#BBB',        // 已关闭作业的时间显示，非常浅的灰色
        homeworkUnfinishedTimeTextColor: '#DD4242', // 未完成作业的时间，这里用红色突出显示
        homeworkFinishedTimeTextColor: '#666',      // 已完成作业的视觉，与正文文本颜色相近
        homeworkSectionHeaderTextColor: '#2C2C2C',  // 作业分区标题颜色
        
        // 需要突出显示的文字使用此颜色，例如退出登录
        hightlightTextColor: '#DD4242',     // 红色

        settingsSeperatorColor: '#DDD',     // 设置页面的分隔线颜色
        flatListSeperatorColor: '#DDD',     // flatlist的分隔线颜色, 我的博客页面
        flatListSeperatorColor2: '#EEEEF0', // 班级博客列表
        
        // 设置页面的黑暗模式，分别是图标背景色与图标前景色
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

        // 图片透明度，在黑暗模式下需要降低透明度，使之不显得刺眼
        imageOpacity: 1,

        calendarDisableColor : '#BABABA', //日历中未选中的字体颜色
        echartColor : '#4169E1', //图表中的柱子颜色
    },

    dark: {     // 主题色='#FFCC00'，黄色
        headerBackgroundColor: '#363636',
        headerTintColor: '#FFCC00',
        backgroundColor: '#262626',
        textColor: '#EEE',
        grayTextColor: '#AAA',
        buttonTextColor: '#FFCC00',
        buttonColor: '#3A3A3A',
        buttonBorderColor: '#FFCC00',
        selectionColor: '#555555',
        seperatorColor: '#262626',        // 与背景颜色相同，相当于隐藏分隔线
        tabBarActiveTextColor: '#FFCC00',
        tabBarInactiveTextColor: '#DDD',
        tabBarBorderColor: '#666',
        tabBarActiveTintColor: '#FFCC00',
        tabBarInactiveTintColor: '#DDD',
        tabBarBackgroundColor: '#262626',
        addBackgroundColor: '#FFCC00',
        addUnderlayColor: '#0077FF',
        addTextColor: '#666',
        promptTextColor: '#999',
        cellBorderColor: '#888',
        avatarBackgroundColor: '#514E2D',
        avatarTextColor: '#FFCC00',
        filterBorderBottomColor: '#666',
        filterBorderTopColor: '#666',
        homeworkTitleColor: '#EEE',
        homeworkGrayTitleColor: '#DDD',
        homeworkClosedTimeTextColor: '#DDD',
        homeworkUnfinishedTimeTextColor: '#FFCC00',
        homeworkFinishedTimeTextColor: '#DDD',
        homeworkSectionHeaderTextColor: '#DDD',
        hightlightTextColor: '#D8AD00',
        settingsSeperatorColor: '#666',
        flatListSeperatorColor: '#666',
        flatListSeperatorColor2: '#666',
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
        imageOpacity: 0.85,                         // 降低亮度
        calendarDisableColor : 'black', //日历中未选中的字体颜色
        echartColor : '#4BD864', //图表中的柱子颜色
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
