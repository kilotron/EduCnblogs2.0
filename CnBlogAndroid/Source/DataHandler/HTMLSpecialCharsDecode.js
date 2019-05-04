/**将部分HTML实体转换成对应字符 */
function HTMLSpecialCharsDecode(str){           
    str = str.replace(/&amp;/g, '&'); 
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");  
    str = str.replace(/&#39;/g, "'");  
    return str;  
}

module.exports = HTMLSpecialCharsDecode;