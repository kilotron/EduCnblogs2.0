const VoteListHandler = require('../../Source/DataHandler/VoteList/VoteList');

test('List test', ()=>{
	expect(VoteListHandler(1)).tobe(1);
});