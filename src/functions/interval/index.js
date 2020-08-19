
const env = 'test-xyh-zhitu'
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env
})
const db = cloud.database({
  env
})
const fetch = require('./fetch')
const cheerio = require('cheerio');

// 获取话题下面的精选 count个问题和回答
async function getZhituQuestions (topicId = 19602490, count = 50) {
  // 渲染URL
  const url = `https://www.zhihu.com/api/v4/topics/${topicId}/feeds/essence`;
  const getData = async (offset, limit) => {
    const res = await fetch({
      url,
      params: {
        include: 'data[?(target.type=topic_sticky_module)].target.data[?(target.type=answer)].target.content,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[?(target.type=topic_sticky_module)].target.data[?(target.type=answer)].target.is_normal,comment_count,voteup_count,content,relevant_info,excerpt.author.badge[?(type=best_answerer)].topics;data[?(target.type=topic_sticky_module)].target.data[?(target.type=article)].target.content,voteup_count,comment_count,voting,author.badge[?(type=best_answerer)].topics;data[?(target.type=topic_sticky_module)].target.data[?(target.type=people)].target.answer_count,articles_count,gender,follower_count,is_followed,is_following,badge[?(type=best_answerer)].topics;data[?(target.type=answer)].target.annotation_detail,content,hermes_label,is_labeled,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,answer_type;data[?(target.type=answer)].target.author.badge[?(type=best_answerer)].topics;data[?(target.type=answer)].target.paid_info;data[?(target.type=article)].target.annotation_detail,content,hermes_label,is_labeled,author.badge[?(type=best_answerer)].topics;data[?(target.type=question)].target.annotation_detail,comment_count;',
        offset,
        limit // 这个最多10条
      },
      method: 'get',
      timeout: 60000,
    });
    let answerList = []
    if (res && res.data && res.data.length) {
      res.data.forEach(e => {
        // 点赞数大约 10000
        if (e.target.voteup_count > 10000) {
          answerList.push({
            questionId: e.target.question.id,
            answerId: e.target.id,
            answerUpNum: e.target.voteup_count
          })
        }
      })
    }
    return answerList
  }
  let arr = []
  let len = Math.ceil(count / 10)
  for (let i = 0; i < len; i++) {
    let offset = 10 * i
    let limit = 10
    if (i === len - 1 && count % 10 !== 0) {
      limit = count % 10
    }
    arr.push(getData(offset, limit))
  }
  let allResArr = await Promise.all(arr)
  let allQuesIds = []
  allResArr.forEach(e => {
    allQuesIds.push(...e)
  })
  return allQuesIds // Array.from(new Set(allQuesIds))
}
// 获取知乎图片
async function getZhituAnswerItemImage(data) {
  let returnData;
  // 渲染URL
  const url = `https://www.zhihu.com/question/${data.questionId}/answer/${data.answerId}`;
  try {
    // 使用request.js库发送get请求
    const html = await fetch({
      url,
      params: {},
      method: 'get',
      timeout: 60000,
    });
    // 载入并初始化cheerio
    const $ = cheerio.load(html);
    let $box = $('.QuestionAnswer-content').eq(0);
    let $info = $box.find('.AnswerItem').eq(0);
    let dataZop = JSON.parse($info.attr('data-zop'));
    let answerId = dataZop.itemId;
    let questionName = dataZop.title;
    let authorName = dataZop.authorName;
    let questionFollowNum = $('.NumberBoard-itemValue').eq(0).attr('title');
    let questionReadNum = $('.NumberBoard-itemValue').eq(1).attr('title');
    let authorImg = $box.find('.AuthorInfo-avatar').eq(0).attr('src');
    let $domBadgeText = $box.find('.AuthorInfo-badgeText').eq(0);
    let authorBadgeText = $domBadgeText && $domBadgeText.text();
    let answerImgList = [];
    let imgDomlist = $box.find('.RichContent--unescapable').eq(0).find('img');
    let editTimeText = $box.find('.ContentItem-time').eq(0).find('span').eq(0).text();
    for (let i = 0; i < imgDomlist.length; i++) {
      let imgDomItem = $(imgDomlist[i]);
      // 原始图片url
      let originalUrl = imgDomItem.attr('data-original');
      if (originalUrl) {
        answerImgList.push(originalUrl);
      }
    }
    let saveData = {
      questionId: data.questionId,
      questionName,
      questionFollowNum, // 问题关注数
      questionReadNum, // 问题浏览量
      answerId,
      answerUpNum: data.answerUpNum, // 回答点赞数
      answerImgList,
      authorName,
      authorImg,
      authorBadgeText,
      editTimeText
    };
    returnData = saveData;
  } catch (err) {
    console.log(err)
  }
  return returnData
}

// 获取知乎作答图片
async function getZhituAnswerImages(data = {}) {
  let returnData;
  try {
    let questionAnswerIds = await getZhituQuestions(data.topicId, Number(data.count))
    let allRes = await Promise.all(
      questionAnswerIds.map(e => {
        return getZhituAnswerItemImage(e)
      })
    )
    let res2 = await cloud.callFunction({
      name: 'addDataToCould',
      data: {
        dbName: 'zhihuImgAnswer',
        primaryKey: 'answerId',
        list: [
          ...allRes
        ]
      }
    })
    returnData = res2
  } catch (err) {
    console.log(err)
  }
  return {
    data: returnData
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  let res = await getZhituAnswerImages({
    // 写死一个topicId
    topicId: event.topicId || 19602490,
    count: event.count || 50,
  })
  return res
}
