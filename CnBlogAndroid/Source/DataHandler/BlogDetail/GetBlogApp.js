
function GetBlogApp(LinkUrl){
    let arr = LinkUrl.split('/');
    let blogApp = arr[3];
    return blogApp;
}
module.exports = GetBlogApp;
