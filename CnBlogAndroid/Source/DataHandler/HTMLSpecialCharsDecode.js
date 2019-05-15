/**将部分HTML实体转换成对应字符 */
function HTMLSpecialCharsDecode(str){           
    str = str.replace(/&amp;/g, '&'); 
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");  
    str = str.replace(/&#39;/g, "'");  
    //转义为Markdown格式
    str = str.replace(/<br\/>/g,"\n\n");
    str = str.replace(/<b>/g,"**");
    str = str.replace(/<\/b>/g,"**");
    // str = str.replace(/<img.*?\/>/g,'![图片](https://img2018.cnblogs.com/blog/1193964/201905/1193964-20190511163528418-507766326.jpg)');
    //1. 获取所有<img>标签的url
    raw = str;
    let $cleanImg = raw.split(/<img src="/);
    $urls = new Array();
    for(var $i=1;$i < $cleanImg.length; $i++){
        $url = ($cleanImg[$i].split("\""))[0];
        $urls.push($url);
    }
    //2.替换所有<img>标签为![图片](url)形式
    $withoutImg = raw.split(/<img.*?\/>/);
    let $result = "";
    $result += $withoutImg[0];
    for(var $i=1; $i < $withoutImg.length; $i++){
        $plusImg = "![图片](" + $urls[$i-1] + ")" + $withoutImg[$i];
        $result += $plusImg;
    }
    return $result;  
    // return str;
    
}

module.exports = HTMLSpecialCharsDecode;