const VoteDetailHandler = require('../../Source/DataHandler/VoteDetail/VoteDetail');

test('Detail test', ()=>{
	expect(VoteDetailHandler(1)).toBe(1);
});