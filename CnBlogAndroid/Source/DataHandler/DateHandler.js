const aMinuteInMilliseconds = 60 * 1000;
const anHourInMilliseconds = 60 * aMinuteInMilliseconds;
const aDayInMilliseconds = 24 * anHourInMilliseconds;
const aMonthInMilliseconds = 30 * aDayInMilliseconds;
const aYearInMilliseconds = 12 * aMonthInMilliseconds;

/**参数date是一个字符串，
 * 必须包含YYYY-MM-DD和HH:SS:MM两个部分，例如：
 * '2019-05-28T19:18:00', 
 * '2019-05-28T11:49:14.093', 毫秒部分会被舍弃
 * '2019-04-09T17:05:00+08:00', '+08:00'部分会被舍弃
 * '2019-05-28 11:49:14',
 * '11:49:14 2019-05-28',
 * 返回相对时间：
 * 与当前时间相差1分钟内：刚刚
 * 1(-1)小时内：n分钟前(后)
 * 1(-1)天内：n小时前(后)
 * 1(-1)个月内：n天前(后)
 * 1(-1)年内：n个月前(后)
 */
function relativeTime(date) {
    let ymd;
    let hms;
    try {
        ymd = date.match(/\d{4}-\d{2}-\d{2}/)[0].replace(/-/g, '/');
        hms = date.match(/\d{2}:\d{2}:\d{2}/)[0];
    } catch (err) {
        return err.message;  // 不正确的日期格式
    }
    let time = new Date(ymd + ' ' + hms);
    let currentTime = new Date();
    let timeDiff = currentTime.getTime() - time.getTime();
    let relativeTimeSuffix = '前';
    if (timeDiff < 0) {
        timeDiff = -timeDiff;
        relativeTimeSuffix = '后';
    }
    let result = '';
    if (timeDiff < aMinuteInMilliseconds) {
        result = '刚刚';
    } else if (timeDiff < anHourInMilliseconds) {
        result = Math.floor(timeDiff / aMinuteInMilliseconds) + '分钟' + relativeTimeSuffix;
    } else if (timeDiff < aDayInMilliseconds) {
        result = Math.floor(timeDiff / anHourInMilliseconds) + '小时' + relativeTimeSuffix;
    } else if (timeDiff < aMonthInMilliseconds) {
        result = Math.floor(timeDiff / aDayInMilliseconds) + '天' + relativeTimeSuffix;
    } else if (timeDiff < aYearInMilliseconds) {
        result = Math.floor(timeDiff / aMonthInMilliseconds) + '个月' + relativeTimeSuffix;
    } else { // 传入参数的时间比当前相差1年以上，返回YYYY-MM-DD
        result = ymd;
    }

    return result;
}

module.exports = relativeTime;