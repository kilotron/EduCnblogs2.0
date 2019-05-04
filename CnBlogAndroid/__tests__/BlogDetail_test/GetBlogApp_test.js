const GetBlogAppHandler = require('../../Source/DataHandler/BlogDetail/GetBlogApp');

test('GetBlogApp test1', ()=>{
	expect(GetBlogAppHandler('https://www.cnblogs.com/diral/p/10533.html')).toBe('diral');
});
