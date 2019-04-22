
const ItemHandler = require('../Source/DataHandler/ClassMember/ItemHandler')
it('renders correctly', () => {
  expect(ItemHandler(null)).not.toBe(null);
});
test('test1',()=>{
  expect(ItemHandler('null')).not.toBe('null');
})