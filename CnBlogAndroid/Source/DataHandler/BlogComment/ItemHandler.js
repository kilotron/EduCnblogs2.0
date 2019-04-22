const CommentHandler = require('./CommentHandler');

function ItemHandler(item){
    let item1 = item;
    if(item!=null){
        item = item1.item;
    }
    else return null;
    item.Author = item.Author?item.Author:'';
    item.Body = item.Body?CommentHandler(item.Body):'';
    item.DateAdded = item.DateAdded?item.DateAdded:'';
    return item;
}

module.exports = ItemHandler;