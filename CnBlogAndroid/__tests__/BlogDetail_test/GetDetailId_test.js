const GetDetailIdHandler = require('../../Source/DataHandler/BlogDetail/GetDetailId');

test('GetDetailId test1', ()=>{
	expect(GetDetailIdHandler('https://www.cnblogs.com/diral/p/10533.html')).toBe('10533');
});

test('GetDetailId test2', ()=>{
	expect(GetDetailIdHandler('https://www.cnblogs.com/diral/pf10533.html')).toBe('');
});
