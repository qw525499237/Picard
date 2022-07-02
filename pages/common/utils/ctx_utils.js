var spliceString = function (content, maxWidth, rowWidth, ctx) {
  let splieContent = content
  if (content == '' || content == undefined) {
    return [];
  }
  if (content.length == 1) {
    return [{
      row: 1,
      content: content
    }];
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
  // console.log(result)
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
      // console.log(mid, width)
      if (j == arrayContent.length - 1) {
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
        // console.log('splieContent',a)

        result.push(a);
        length = length + j;
        if (length == originLength) {
          return result;
        }
        arrayContent = subArrayCus(arrayContent, j , arrayContent.length - 1);
        
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


/**该方法用来绘制一个有填充色的圆角矩形 
 *@param cxt:canvas的上下文环境 
 *@param x:左上角x轴坐标 
 *@param y:左上角y轴坐标 
 *@param width:矩形的宽度 
 *@param height:矩形的高度 
 *@param radius:圆的半径 
 *@param fillColor:填充颜色 
 **/
let fillRoundRect = function (cxt, x, y, width, height, radius, /*optional*/ fillColor) {
  //圆的直径必然要小于矩形的宽高          
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }

  cxt.save();
  cxt.translate(x, y);
  //绘制圆角矩形的各个边  
  drawRoundRectPath(cxt, width, height, radius);
  cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
  cxt.fill();
  cxt.restore();
}


let drawRoundRectPath = function (cxt, width, height, radius) {
  cxt.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI  
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

  //矩形下边线  
  cxt.lineTo(radius, height);

  //左下角圆弧，弧度从1/2PI到PI  
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

  //矩形左边线  
  cxt.lineTo(0, radius);

  //左上角圆弧，弧度从PI到3/2PI  
  cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

  //上边线  
  cxt.lineTo(width - radius, 0);

  //右上角圆弧  
  cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

  //右边线  
  cxt.lineTo(width, height - radius);
  cxt.closePath();
}

let createVerticalImage = function (ctx, canvas, cardInfo1, callBack) {
  let _this = this
  let beishu = 8
  let left = beishu * 7
  let top = -(2 * beishu);
  let cardInfo = cardInfo1
  fillRoundRect(ctx, beishu * 148 + left, beishu * 97 + top, beishu * 75, beishu * 31, beishu * 5, '#858BC7')
  fillRoundRect(ctx, beishu * 148 + left, beishu * 129 + top, beishu * 75, beishu * 31, beishu * 5, '#58B8B7')
  fillRoundRect(ctx, beishu * 148 + left, beishu * 161 + top, beishu * 75, beishu * 31, beishu * 5, '#E5C383')

  addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
  fillRoundRect(ctx, beishu * 10 + left, beishu * 8 + top, beishu * 142, beishu * 190, beishu * 10, '#000000')
  clearShadow(ctx)

  // console.log(ress.path)
  let seal = canvas.createImage();
  seal.src = cardInfo.images[0].image_url;
  seal.onload = () => {
    // ctx.drawImage(seal, 80, 940, 150, 150);
    drawRoundImage(ctx, beishu * 11 + left, beishu * 9 + top, beishu * 140, beishu * 188, beishu * 10, seal, seal.width, seal.height)
    fillRoundRect(ctx, beishu * 5 + left, beishu * 2 + top, beishu * 40, beishu * 20, beishu * 5, '#F46563')
    drawWord(ctx, beishu * 25 + left, beishu * 13 + top, beishu * 13, "#FFFFFF", "热门")

    if (cardInfo.have_card_badge) {
      let badge = canvas.createImage();
      badge.src = this.data.data.card_badge_url;
      badge.onload = () => {
        ctx.drawImage(badge, beishu * 143 + left, beishu * 2 + top, beishu * 80, beishu * 80);
        setTimeout(function (e) {
          wx.canvasToTempFilePath({ //将canvas生成图片
            canvas: canvas,
            x: 0,
            y: 0,
            destWidth: beishu * 250,
            destHeight: beishu * 200,
            quality: 1,
            success: function (res) {
              // console.log('生成图片成功：', res)
              shareInfo.image_url = res.tempFilePath
              setData({
                isCreateShareImage: true
              })
            },
          }, _this)
        }, 500)
      }
    } else {
      setTimeout(function (e) {
        wx.canvasToTempFilePath({ //将canvas生成图片
          canvas: canvas,
          x: 0,
          y: 0,
          destWidth: beishu * 250,
          destHeight: beishu * 200,
          quality: 1,
          success: function (res) {
            // console.log('生成图片成功：', res)
            shareInfo.image_url = res.tempFilePath
            setData({
              isCreateShareImage: true
            })
          },
        }, _this)
      }, 500)
    }
  }

  let num = canvas.createImage();
  if (cardInfo.card_type == "SSR") {
    num.src = '/pages/images/ssr.png';
  } else if (cardInfo.card_type == "FUNCATION") {
    num.src = '/pages/images/function.png';
  } else if (cardInfo.card_type == "TRUE_CARD") {
    num.src = '/pages/images/true_card.png';
  } else {
    num.src = '/pages/images/sr.png';
  }
  num.onload = () => {
    ctx.drawImage(num, beishu * 154 + left, beishu * 100 + top, beishu * 25, beishu * 25);
  }
  if (this.data.data.card_type == 'FUNCATION') {
    let infinite = canvas.createImage();
    infinite.src = '/pages/images/infiniteness.png'
    infinite.onload = () => {
      // ctx.drawImage(infinite, beishu * 194 + left, beishu * 100 + top, beishu * 25, beishu * 25);
      ctx.drawImage(infinite, beishu * 180 + left, beishu * 95 + top, beishu * 35, beishu * 35);

    }
  } else {
    drawWord(ctx, beishu * 197 + left, beishu * 114 + top, beishu * 12, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
  }

  let lv = canvas.createImage();
  lv.src = '/pages/images/c_info_lv.png';
  lv.onload = () => {
    ctx.drawImage(lv, beishu * 154 + left, beishu * 132 + top, beishu * 25, beishu * 25);
  }
  if (this.data.data.card_type == 'FUNCATION') {
    let infinite = canvas.createImage();
    infinite.src = '/pages/images/infiniteness.png'
    infinite.onload = () => {
      // ctx.drawImage(infinite, beishu * 194 + left, beishu * 132 + top, beishu * 25, beishu * 25);
      ctx.drawImage(infinite, beishu * 180 + left, beishu * 125 + top, beishu * 35, beishu * 35);
    }
  } else {
    drawWord(ctx, beishu * 194 + left, beishu * 146 + top, beishu * 12, "#FFFFFF", cardInfo.card_lv)
  }

  let cp = canvas.createImage();
  cp.src = '/pages/images/c_info_point.png';
  cp.onload = () => {
    ctx.drawImage(cp, beishu * 156 + left, beishu * 167 + top, beishu * 20, beishu * 20);
  }
  if (this.data.data.card_type == 'FUNCATION') {
    let infinite = canvas.createImage();
    infinite.src = '/pages/images/infiniteness.png'
    infinite.onload = () => {
      ctx.drawImage(infinite, beishu * 180 + left, beishu * 158 + top, beishu * 35, beishu * 35);
    }
  } else {
    drawWord(ctx, beishu * 194 + left, beishu * 179 + top, beishu * 12, "#FFFFFF", cardInfo.card_cpoint)
  }
}


let createShareHorizontalImage = function (ctx, canvas) {
  let _this = this
  let beishu = 8
  let left = beishu * 7
  let top = -10;
  let width = (beishu * 212 - 120) / 3
  let cardInof = this.data.data
  fillLeftBottomRoundRect(ctx, beishu * 18 + left, beishu * 169 + top, width, beishu * 31, beishu * 5, '#858BC7')
  fillLeftBottomRoundRect(ctx, beishu * 18 + left + width, beishu * 169 + top, width, beishu * 31, 0, '#58B8B7')
  fillRightBottomRoundRect(ctx, beishu * 18 + left + width * 2, beishu * 169 + top, width, beishu * 31, beishu * 5, '#E5C383')

  addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
  fillRoundRect(ctx, beishu * 10 + left, beishu * 8 + top, beishu * 214, beishu * 161, beishu * 10, '#000000')
  clearShadow(ctx)

  let seal = canvas.createImage();
  seal.src = data.data.images[0].image_url;
  seal.onload = () => {
    // ctx.drawImage(seal, 80, 940, 150, 150);

    drawRoundImage(ctx, beishu * 11 + left, beishu * 9 + top, beishu * 212, beishu * 159, beishu * 10, seal, seal.width, seal.height)
    if (cardInof.hot_card) {
      fillRoundRect(ctx, beishu * 5 + left, beishu * 2 + top, beishu * 40, beishu * 20, beishu * 5, '#F46563')
      drawWord(ctx, beishu * 25 + left, beishu * 13 + top, beishu * 13, "#FFFFFF", "热门")
    }


    if (cardInof.have_card_badge) {
      let badge = canvas.createImage();
      badge.src = this.data.data.card_badge_url;
      badge.onload = () => {
        addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
        ctx.drawImage(badge, beishu * 157 + left, beishu * 2 + top, beishu * 80, beishu * 80);
        clearShadow(ctx)

        setTimeout(function (e) {
          wx.canvasToTempFilePath({ //将canvas生成图片
            canvas: canvas,
            x: 0,
            y: 0,
            destWidth: beishu * 250,
            destHeight: beishu * 200,
            quality: 1,
            success: function (res) {
              // console.log('生成图片成功：', res)
              shareInfo.image_url = res.tempFilePath
              setData({
                isCreateShareImage: true
              })
            },
          }, _this)
        }, 500)
      }
    } else {
      setTimeout(function (e) {
        wx.canvasToTempFilePath({ //将canvas生成图片
          canvas: canvas,
          x: 0,
          y: 0,
          destWidth: beishu * 250,
          destHeight: beishu * 200,
          quality: 1,
          success: function (res) {
            // console.log('生成图片成功：', res)
            shareInfo.image_url = res.tempFilePath
            setData({
              isCreateShareImage: true
            })
          },
        }, _this)
      }, 500)
    }

  }


  let num = canvas.createImage();
  if (cardInof.card_type == "SSR") {
    num.src = '/pages/images/ssr.png';
  } else if (cardInof.card_type == "FUNCATION") {
    num.src = '/pages/images/function.png';
  } else if (cardInof.card_type == "TRUE_CARD") {
    num.src = '/pages/images/true_card.png';
  } else {
    num.src = '/pages/images/sr.png';
  }
  num.onload = () => {
    ctx.drawImage(num, beishu * 18 + left, beishu * 171 + top, beishu * 25, beishu * 25);
  }
  drawWord(ctx, beishu * 58 + left, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.surplus_card_num + "/" + cardInof.total_card_num)

  let lv = canvas.createImage();
  lv.src = '/pages/images/c_info_lv.png';
  lv.onload = () => {
    ctx.drawImage(lv, beishu * 24 + left + width, beishu * 172 + top, beishu * 25, beishu * 25);
  }
  drawWord(ctx, beishu * 60 + left + width, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_lv)

  let cp = canvas.createImage();
  cp.src = '/pages/images/c_info_point.png';
  cp.onload = () => {
    ctx.drawImage(cp, beishu * 25 + left + width * 2, beishu * 174 + top, beishu * 20, beishu * 20);
  }
  drawWord(ctx, beishu * 58 + left + width * 2, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_cpoint)

}


module.exports.spliceString = spliceString;
module.exports.changeCardInfo = changeCardInfo;
module.exports.createVerticalImage = createVerticalImage;