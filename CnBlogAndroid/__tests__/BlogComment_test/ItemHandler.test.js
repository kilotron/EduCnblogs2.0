const ItemHandler = require('../../Source/DataHandler/BlogComment/ItemHandler');

test('null test', ()=>{
	expect(ItemHandler(null)).toBe(null);
});

test('test1',()=>{
	var item = {
		item:{
			Author:'author',
			Body:'body',
			DateAdded:'dateAdded'
		}
	}
	expect(ItemHandler(item)).toBe(item.item);
})
test('test2',()=>{
	var item = {
		item:{
			
		}
	}
	expect(ItemHandler(item)).toBe(item.item);
})