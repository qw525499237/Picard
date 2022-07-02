var spliceString = function (content, maxWidth, rowWidth, ctx) {
  let splieContent = content
  if (content == '') {
    return [];
  }
  // console.log(Array.from(content))
  let arrayContent = Array.from(content)
  if (ctx.measureText(content).width > maxWidth) {
    for (let i = 0; i < content.length; i++) {
      if (ctx.measureText(substringCus(arrayContent, 0, i)).width > maxWidth) {
        splieContent = substringCus(arrayContent, 0, i - 2) + '...'
        break
      }
    }
  }
  return spliceToEveryLing(splieContent, rowWidth, ctx)
}

var substringCus = function (arrayContent, start, end) {
  let result = ''
  for (let i = start; i <= end; i++) {
    result = result + arrayContent[i]
  }
  return result
}


var subArrayCus = function (arrayContent, start, end) {
  let result = []
  for (let i = start; i <= end; i++) {
    result.push(arrayContent[i])
  }
  console.log(result)
  return result
}


var spliceToEveryLing = function (content, rowWidth, ctx) {
  let result = []
  let length = 0
  let arrayContent = Array.from(content)
  let originLength = arrayContent.length
  for (let i = 1;; i++) {
    for (let j = 1; j < arrayContent.length; j++) {
      let mid = substringCus(arrayContent, 0, j);
      let width = ctx.measureText(mid).width
      if (j == arrayContent.length-1) {
        let a = {
          row: i,
          content: substringCus(arrayContent, 0, j)
        }
        result.push(a);
        return result;
      }

      if (width > rowWidth) {
        let a = {
          row: i,
          content: substringCus(arrayContent, 0, j - 1)
        }
        result.push(a);
        length = length + j;
        if (length == originLength) {
          return result;
        }
        arrayContent = subArrayCus(arrayContent, j - 1, arrayContent.length - 1);
        break;
      }
    }
  }
  return result;
}

var changeCardInfo = function (cardInfo, canvas) {
  let content = ''


  if (cardInfo.title.length > 0) {
    content = cardInfo.title
  } else if (cardInfo.content.length > 0) {
    content = cardInfo.content
  }

  let get_card_height = 579.5
  let titleFontSize = 0.054 * get_card_height
  let width = 0.18 * 3 * get_card_height
  canvas.font = 'bold ' + titleFontSize + 'px Arial';
  let titleLists = spliceString(content, width * 1.9, width, canvas)
  cardInfo.content1 = ''
  cardInfo.content2 = ''
  for (let i = 0; i < titleLists.length; i++) {
    if (i == 0) {
      cardInfo.content1 = titleLists[i].content
    }
    if (i == 1) {
      cardInfo.content2 = titleLists[i].content
    }
  }
  return cardInfo
}



module.exports.changeCardInfo = changeCardInfo;