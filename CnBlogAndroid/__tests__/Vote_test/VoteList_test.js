const VoteListHandler = require('../../Source/DataHandler/VoteList/VoteList');

test('List test', ()=>{
	expect(VoteListHandler(1)).toBe(1);
});