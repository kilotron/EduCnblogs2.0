
const CommentHandler = require('../Source/DataHandler/BlogComment/CommentHandler')
it('renders correctly', () => {
  expect(CommentHandler('')).not.toBe(null);
});

test('renders correctly',()=>{
  expect(CommentHandler('<><><>引用 引 啊啊啊啊啊啊')).not.toBe(null);
})