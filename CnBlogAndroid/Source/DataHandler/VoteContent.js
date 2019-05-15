function extractData(voteContent) {
    let result = [];
    let cnt = 1;    // 题目序号
    for (let i in voteContent) {
        let vote = {};
        vote.serialNumber = cnt;
        if (voteContent[i].voteMode == 1) {
            vote.type = 'Single';
        } else if (voteContent[i].voteMode == 2) {
            vote.type = 'Multiple';
        } else {
            continue; // 未知的投票模式，跳过
        }
        vote.title = voteContent[i].title;
        vote.imageSource = voteContent[i].picture;
        vote.options = [];
        for (let j in voteContent[i].voteOptions) {
            let option = {};
            option.id = voteContent[i].voteOptions[j].voteOptionId;
            option.text = voteContent[i].voteOptions[j].option;
            option.selected = false;
            vote.options.push(option);
        }
        vote.contentId = voteContent[i].voteContentId;
        result.push(vote);
        cnt++;
    }
    return result;
}

module.exports = extractData;