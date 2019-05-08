
function GetDetailId(LinkUrl){
    let detailId = LinkUrl.match( /p\/([^%]+).html/);
    return detailId===null?'':detailId[1];
}
module.exports = GetDetailId;
