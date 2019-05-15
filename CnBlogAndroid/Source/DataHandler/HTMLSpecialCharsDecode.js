/**将部分HTML实体转换成对应字符 */
function HTMLSpecialCharsDecode(str){           
    str = str.replace(/&amp;/g, '&'); 
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");  
    str = str.replace(/&#39;/g, "'");  
    //转义为Markdown格式
    // str = str.replace(/<br\/>/g,"\n\n");
    // str = str.replace(/<b>/g,"**");
    // str = str.replace(/<\/b>/g,"**");
    str = ConvertHref(str);
    str = ConvertPicture(str);
    str = ConvertCode(str);
    str = ConvertQuote(str);
    return str;
}

//API返回的是带有自定义标签的HTML代码
//1. 第一种是将API返回的数据转换为Markdown形式
//2. 第二种是将API返回的数据处理为HTML标签形式

//图片解析
//<a href="url"><img src = "url" border="0" onload="..."/></a> => ![图片](url)
//<a href="url"><img src = "url" border="0" onload="..."/></a> => <img src="url"/>
function ConvertPicture(raw){
    // let result = raw.replace(/<a href=(.*?) target="_blank"><img(.*?)<\/a>/g,'![图片]($1)');
    let result = raw.replace(/<a href=(.*?) target="_blank"><img(.*?)<\/a>/g,'<img src=$1 alt="图片"/>');
    return result;
}

//代码解析
//[code=java]代码内容[/code]  => \n\n>代码内容\n\n
//[code=java]代码内容[/code]  => <strong>代码内容</strong>
function ConvertCode(raw){
    // let result = raw.replace(/\[code=(.*?)\](.*?)\[\/code\]/g,"\\n\\n>$2\\n\\n");
    let result = raw.replace(/\[code=(.*?)\](.*?)\[\/code\]/g,'<strong>$2</strong>');
    return result;
}

//超链接解析
//<a href="http://www.hao123.com" target="_blank">测试超链接</a> => [测试超链接]("url")
//<a href="http://www.hao123.com" target="_blank">测试超链接</a> => 暂时不需要解析
function ConvertHref(raw){
    // let result = raw.replace(/<a href=(.*?) target="_blank">(.*?)<\/a>/g,'["$2"]("$1")');
    result = raw;
    return result;
}

//引用解析
//<fieldset class="comment_quote"><legend>引用</legend>引用内容</fieldset>  =>  \n\n>引用内容\n\n
//<fieldset class="comment_quote"><legend>引用</legend>引用内容</fieldset>  =>  <em>引用内容</em>
function ConvertQuote(raw){
    // let result = raw.replace(/<fieldset class="comment_quote"><legend>引用<\/legend>(.*?)<\/fieldset>/g,'\\n\\n>"$1"\\n\\n');
    let result = raw.replace(/<fieldset class="comment_quote"><legend>引用<\/legend>(.*?)<\/fieldset>/g,'<em>"$1"</em>');
    return result;
}

module.exports = HTMLSpecialCharsDecode;