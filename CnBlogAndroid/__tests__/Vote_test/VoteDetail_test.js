const VoteDetailHandler = require('../../Source/DataHandler/VoteDetail/VoteDetail');

test('List test', ()=>{
	expect(VoteDetailHandler(1)).toBe(1);
});