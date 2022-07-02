 //生成图片实体卡文字内容部分
 let createImgCardContent = function (data, cxt) {
   let beishu = 2.8
   let contentleft = 721 * beishu
   let contenttop = 30 * beishu
   let trueWidth = 324 * beishu
   let width = 520 * beishu
   let changeRate = trueWidth / width
   let title = data.title
   let content = data.content

   let titleFontSize = 70 * beishu * changeRate
   cxt.font = 'bold ' + titleFontSize + 'px Arial';
   let titleLists = spliceString(title, titleFontSize * 11, titleFontSize * 6, cxt)
   console.log(titleLists)
   let contentFontSize = 38 * beishu * changeRate
   cxt.font = 'bold ' + contentFontSize + 'px Arial';
   let contentLists
   if (titleLists.length > 1) {
     contentLists = spliceString(content, contentFontSize * 11 * 1.8, contentFontSize * 11, cxt)
   } else {
     contentLists = spliceString(content, contentFontSize * 11 * 3.8, contentFontSize * 11, cxt)
   }
   console.log(contentLists)


   let titleLine = titleLists.length;
   let lineNum = contentLists.length;
   if (lineNum == 0) {
     lineNum = -1
   }
   let height = 0
   if (titleLine > 1) {
     height = (lineNum * 40 + 70 + 40 + 260 + 30) * beishu * changeRate;
   } else if (data.title.length > 0) {
     height = (lineNum * 40 + 70 + 40 + 170 + 30) * beishu * changeRate
   } else {
     height = (lineNum * 40 + 70 + 40 + 50 + 30) * beishu * changeRate
   }
   fillRoundRect(cxt, 5 * beishu + contentleft, 5 * beishu + contenttop, 100 * beishu / 1.5, 8 * beishu / 1.5, 0, '#A68B57')
   fillRoundRect(cxt, 5 * beishu + contentleft, 5 * beishu + contenttop, 8 * beishu / 1.5, 91 * beishu / 1.5, 0, '#A68B57')
   fillRoundRect(cxt, 500 * beishu * changeRate - 13 * beishu / 1.5 + 20 + contentleft + 15, height - 85 * beishu / 1.5 - 11 * 3 + contenttop, 8 * beishu / 1.5, 91 * beishu / 1.5, 0, '#A68B57')
   fillRoundRect(cxt, contentleft + 500 * beishu * changeRate - 105 * beishu / 1.5 + 20 + 15, height - 13 * beishu / 1.5 + contenttop, 100 * beishu / 1.5, 8 * beishu / 1.5, 0, '#A68B57')
   for (let i = 0; i < data.card_show_id.length; i++) {
     let string = data.card_show_id.substr(i, 1);
     drawWord2(cxt, (35 + 15 + 29 * i - 15) * beishu * changeRate + contentleft, (65 + 10) * beishu * changeRate + contenttop, 40 * beishu * changeRate, "#000000", string)
   }
   let titleList = canvasWorkBreak(6, title);
   let addHeight = 0;
   for (let i = 0; i < titleLists.length; i++) {
     addHeight = i * 120 * changeRate;
     drawWord2(cxt, (35 + 15) * beishu * changeRate + contentleft, (140 + i * 120 * changeRate) * beishu * changeRate + contenttop, 70 * beishu * changeRate, "#000000", titleLists[i].content)
   }
   let contentList = canvasWorkBreak(11, content);
   let contentTop = 235
   if (title == undefined || title.length == 0) {
     contentTop = 140
   }
   for (let i = 0; i < contentLists.length; i++) {
     drawWordNoBold2(cxt, (35 + 15) * beishu * changeRate + contentleft, (contentTop + i * 80 * changeRate + addHeight) * beishu * changeRate + contenttop, 38 * beishu * changeRate, "#000000", contentLists[i].content)
   }
 }
 let spliceString = function (content, maxWidth, rowWidth, ctx) {
   let splieContent = content
   if (content == '') {
     return [];
   }
   if (ctx.measureText(content).width > maxWidth) {
     for (let i = 0; i < content.length; i++) {
       if (ctx.measureText(content.substring(0, i)).width > maxWidth) {
         splieContent = content.substring(0, i - 2) + '...'
         break
       }
     }
   }
   console.log(splieContent)
   return spliceToEveryLing(splieContent, rowWidth, ctx)
 }
 let spliceToEveryLing = function (content, rowWidth, ctx) {
   let result = []
   let length = 0
   let originLength = content.length
   console.log(">>>>>>>>>>>>>>>>>>>>>")
   for (let i = 1;; i++) {
     for (let j = 1; j <= content.length; j++) {
       let mid = content.substring(0, j);
       let width = ctx.measureText(mid).width
       if (j == content.length) {
         let a = {
           row: i,
           content: content.substring(0, j)
         }
         result.push(a);
         console.log(result)
         return result;
       }

       if (width > rowWidth) {
         let a = {
           row: i,
           content: content.substring(0, j - 1)
         }
         result.push(a);
         length = length + j;
         if (length == originLength) {
           console.log(result)

           return result;
         }
         content = content.substring(j - 1);
         break;
       }
     }
   }
   return result;
 }
 //切割字符串
 let canvasWorkBreak = function (maxLength, text) {
   const textLength = text.length
   let textRowArr = []
   let tmp = 0
   while (1) {
     textRowArr.push(text.substr(tmp, maxLength))
     tmp += maxLength
     if (tmp >= textLength) {
       return textRowArr
     }
   }
 }
 //创造图片实体卡卡片信息部分
 let createImgCardBottom = function (data, cxt, canvas) {
   let beishu = 2.8
   let contentleft = 592 * beishu
   let contenttop = 941 * beishu
   fillRoundRect(cxt, 0 * beishu + contentleft, 0 * beishu + contenttop, 342 * beishu + 3, 3 * 2, 0, '#000000')
   fillRoundRect(cxt, 0 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
   fillRoundRect(cxt, 0 * beishu + contentleft, 45 * beishu + contenttop, 342 * beishu + 3 * 2, 3 * 2, 0, '#000000')
   fillRoundRect(cxt, 342 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
   fillRoundRect(cxt, 45 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
   let num = canvas.createImage();
   if (data.card_type == "SSR") {
     num.src = '/pages/images/ssr_no_bg.png';
   } else if (data.card_type == "TRUE_CARD") {
     num.src = '/pages/images/true_card_no_bg.png';
   } else {
     num.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/sr2.png';
   }
   num.onload = () => {
     cxt.drawImage(num, 8 * beishu + contentleft, 8 * beishu + contenttop, 30 * beishu, 30 * beishu);
   }
   let cardNum = data.total_card_num - data.surplus_card_num

   if (data.card_type == "SSR") {
     drawWord2(cxt, 79 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '稀有碎片')
   } else if (data.card_type == "TRUE_CARD") {
     drawWord2(cxt, 79 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '实物碎片')
   } else {
     drawWord2(cxt, 75 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '元宇宙碎片')
   }
   drawWord2(cxt, 194 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '剩余' + cardNum + '块')
   // drawWord2(cxt, 0 * beishu + contentleft, (118) * beishu + contenttop, 36 * beishu, "#000000", "还需")

   if (data.want_pick_account > 99) {
     drawWord2(cxt, (246 - 79 + 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
   } else if (data.want_pick_account > 9) {
     drawWord2(cxt, (246 - 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
   } else {
     drawWord2(cxt, (246 - 79 - 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
   }

   drawWord2(cxt, 0 * beishu + contentleft, (204) * beishu + contenttop, 26 * beishu, "#000000", "这块碎片近期升值：")
   if (!data.no_qccode) {
     drawWordNoBold2(cxt, 0 * beishu + contentleft, (370) * beishu + contenttop, 34 * beishu, "#000000", "长按Pick我的碎片  一起升值")
     drawWordNoBold2(cxt, 0 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "或微信搜索")
     drawWordNoBold2(cxt, 263 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "小程序")
   } else {
     drawWordNoBold2(cxt, 0 * beishu + contentleft, (370) * beishu + contenttop, 34 * beishu, "#000000", "Pick我的碎片  一起升值")
     drawWordNoBold2(cxt, 0 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "微信搜索")
     drawWordNoBold2(cxt, (263 - 34) * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "小程序")
   }
   if (data.want_pick_account > 9999) {
     drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8 + 40) * beishu + contenttop, 80 * beishu, "#F46563", data.want_pick_account)
   } else if (data.want_pick_account > 999) {
     drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8 + 30) * beishu + contenttop, 95 * beishu, "#F46563", data.want_pick_account)
   } else {
     drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8) * beishu + contenttop, 135 * beishu, "#F46563", data.want_pick_account)
   }

   let bottomCPMoveLeft
   if (data.card_type == 'SR') {
     bottomCPMoveLeft = judgeContentWidth(cxt, data.card_cpoint_day30, 104)
     drawWord2(cxt, 0 * beishu + contentleft, (237 + 15) * beishu + contenttop, 104 * beishu, "#E4C383", data.card_cpoint_day30)
   } else {
     bottomCPMoveLeft = judgeContentWidth(cxt, data.card_cpoint, 104)
     drawWord2(cxt, 0 * beishu + contentleft, (237 + 15) * beishu + contenttop, 104 * beishu, "#E4C383", data.card_cpoint)
   }
   let cp = canvas.createImage();
   cp.src = '/pages/images/c_info_point.png';
   cp.onload = () => {
     cxt.drawImage(cp, (bottomCPMoveLeft + 10) * beishu + contentleft, (237 + 15) * beishu + contenttop, 95 * beishu, 95 * beishu);
   }
   let logo = canvas.createImage();
   logo.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/logo3.png';
   logo.onload = () => {
     if (!data.no_qccode) {
       cxt.drawImage(logo, 182 * beishu + contentleft, (422 - 12) * beishu + contenttop, 67 * beishu, 67 * beishu);
     } else {
       cxt.drawImage(logo, (182 - 34) * beishu + contentleft, (422 - 12) * beishu + contenttop, 67 * beishu, 67 * beishu);
     }
   }
 }
 let startMakeTrueCard = function (ctx, canvas, cardInfo, callBack) {
   createVerticalImage(ctx, canvas, cardInfo, callBack)
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
 /**
  * 微信小程序canvas绘制圆觉圆角角片
  * @param 图片宽 imageWidth 
  * @param 图片高 imageHeight 
  * @param x坐标 pointX 
  * @param y坐标 pointY 
  * @param 图片路径 iamgePath 
  */
 let drawRoundImage = function (ctx, pointX, pointY, width, height, imageCorner, iamgePath, imageWidth, imageHeight) {
   // cxt, x, y, width, height, radius, /*optional*/ fillColor
   console.log(width)
   console.log(height)
   console.log(pointX)
   console.log(pointY)
   console.log(imageCorner)
   console.log(iamgePath)
   // 绘制海报背景图片圆角
   ctx.save()
   ctx.beginPath()
   ctx.arc(pointX + imageCorner, pointY + imageCorner, imageCorner, Math.PI, Math.PI * 1.5)
   ctx.arc(pointX + width - imageCorner, pointY + imageCorner, imageCorner, Math.PI * 1.5, Math.PI * 2)
   ctx.arc(pointX + width - imageCorner, pointY + height - imageCorner, imageCorner, 0, Math.PI * 0.5)
   ctx.arc(pointX + imageCorner, pointY + height - imageCorner, imageCorner, Math.PI * 0.5, Math.PI)
   ctx.clip()
   let imgWidth = imageWidth
   let imgHeight = imageHeight
   let dw = width / imgWidth
   let dh = height / imgHeight
   if (imgWidth > width && imgHeight > height || imgWidth < width && imgHeight < height) {
     if (dw > dh) {
       ctx.drawImage(iamgePath, 0, (imgHeight - height / dw) / 2, imgWidth, height / dw, pointX, pointY, width, height)
     } else {
       ctx.drawImage(iamgePath, (imgWidth - width / dh) / 2, 0, width / dh, imgHeight, pointX, pointY, width, height)
     }
   } else {
     if (imgWidth < width) {
       ctx.drawImage(iamgePath, 0, (imgHeight - height / dw) / 2, imgWidth, height / dw, pointX, pointY, width, height)
     } else {
       ctx.drawImage(iamgePath, (imgWidth - width / dh) / 2, 0, width / dh, imgHeight, pointX, tpointYop, width, height)
     }
   }
   ctx.restore()
 }
 let drawWordNoBold = function (cxt, x, y, size, /*optional*/ fillColor, content) {
   cxt.font = 'bold ' + size + 'px Arial';
   cxt.textAlign = 'center';
   cxt.textBaseline = 'middle';
   cxt.fillStyle = fillColor;
   cxt.fillText(content, x, y);
 }
 let drawWord = function (cxt, x, y, size, /*optional*/ fillColor, content) {
   cxt.font = 'bold ' + size + 'px Arial';
   cxt.textAlign = 'center';
   cxt.textBaseline = 'middle';
   cxt.fillStyle = fillColor;
   cxt.fillText(content, x, y);

 }
 let drawWordNoBold2 = function (cxt, x, y, size, /*optional*/ fillColor, content) {
   cxt.font = 'normal ' + size + 'px Arial';
   cxt.textAlign = 'left';
   cxt.textBaseline = 'top';
   cxt.fillStyle = fillColor;
   cxt.fillText(content, x, y);

 }
 let drawWord2 = function (cxt, x, y, size, /*optional*/ fillColor, content) {
   cxt.font = 'bold ' + size + 'px Arial';
   cxt.textAlign = 'left';
   cxt.textBaseline = 'top';
   cxt.fillStyle = fillColor;
   cxt.fillText(content, x, y);

 }
 let addShadow = function (ctx, x, y, size, color) {
   // 阴影的y偏移
   ctx.shadowOffsetY = y;
   ctx.shadowOffsetX = x;
   // 阴影颜色
   ctx.shadowColor = color;
   // 阴影的模糊半径
   ctx.shadowBlur = size;
 }
 let clearShadow = function (ctx) {
   addShadow(ctx, 0, 0, 0, 'rgba(0,0,0,0)')
 }
 //图片实体卡生成主体
 let createVerticalImage = function (ctx, canvas, data, qcCodeUrl, no_qccode, callBack, callBack2) {
   let _this = this
   let beishu = 2.8
   let left = 0
   let top = 0
   let cardInfo = data
   console.log(data)
   fillRoundRect(ctx, 0, 0, beishu * 1080, beishu * 1440, 0, '#FFFFFF')
   fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 465 + top, beishu * 341, beishu * 141, beishu * 15, '#858BC7')
   fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 616 + top, beishu * 341, beishu * 141, beishu * 15, '#58B8B7')
   fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 765 + top, beishu * 341, beishu * 141, beishu * 15, '#E5C383')
   let hand1 = canvas.createImage();
   let hand1Loaded = false
   hand1.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/hand1.png';
   hand1.onload = () => {
     hand1Loaded = true
   }

   let seal = canvas.createImage();
   seal.src = cardInfo.images[0].image_url;
   let sealLoaded = false
   seal.onload = () => {
     sealLoaded = true
   }

   let back = canvas.createImage();
   back.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/pick_logo2.png';
   let backLoaded = false
   back.onload = () => {
     backLoaded = true
   }

   let playBtn = canvas.createImage();
   playBtn.src = '/pages/images/play.png';
   let playLoaded = false
   playBtn.onload = () => {
     playLoaded = true
   }

   let hand2 = canvas.createImage();
   hand2.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/hand2.png';
   let hand2Loaded = false
   hand2.onload = () => {
     hand2Loaded = true
   }


   let qcCode = canvas.createImage();
   qcCode.src = qcCodeUrl;
   let qcLoaded = false
   qcCode.onload = () => {
     qcLoaded = true
   }


   let topBar = canvas.createImage();
   topBar.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/img_card_top_bar1.png';
   let topBarLoaded = false
   topBar.onload = () => {
     topBarLoaded = true
   }

   let userInfo = wx.getStorageSync('userInfo')
   let accountIcon = canvas.createImage();
   accountIcon.src = userInfo.account_icon;
   let accountIconLoaded = false

   accountIcon.onload = () => {
     accountIconLoaded = true
   }
   let intert = setInterval(function (e) {
     if (hand1Loaded && sealLoaded && backLoaded && playLoaded && hand2Loaded && qcLoaded && topBarLoaded && accountIconLoaded) {
       clearInterval(intert)
       ctx.drawImage(hand1, beishu * 0 + left, beishu * 834 + top - 20, beishu * 394, beishu * 714);
       addShadow(ctx, beishu * 6, beishu * 6, beishu * 6, 'rgba(0,0,0,0.4)')
       fillRoundRect(ctx, beishu * 36 + left, beishu * 30 + top, beishu * 666, beishu * 890, beishu * 15, '#000000')
       clearShadow(ctx)
       if (cardInfo.images[0].vertical) {
         drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (890 - 6), beishu * 15, seal, seal.width, seal.height)
         if (data.images[0].type == 'video') {
           ctx.drawImage(playBtn, beishu * (36 + 3) + left + beishu * (666 - 6) - beishu * 80, beishu * (30 + 3) + top + beishu * (890 - 6) - beishu * 80, beishu * 60, beishu * 60);
         }
       } else {
         let width = beishu * (666 - 6)
         let height = width * (cardInfo.images[0].height / cardInfo.images[0].width)
         drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (890 - 6), beishu * 15, back, back.width, back.height)
         drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top + (beishu * (890 - 6) - height) / 2, beishu * (666 - 6), height, 0, seal, seal.width, seal.height)
         if (data.images[0].type == 'video') {
           ctx.drawImage(playBtn, beishu * (36 + 3) + left + beishu * (666 - 6) - beishu * 80, beishu * (30 + 3) + top + (beishu * (890 - 6) - height) / 2 + height - beishu * 80, beishu * 60, beishu * 60);
         }

       }
       let handWidth = 132 * 0.93
       ctx.drawImage(hand2, beishu * 189 + left, beishu * 834 + top - 20, beishu * handWidth, beishu * handWidth * (184 / 132));

       if (!no_qccode) {
         ctx.drawImage(qcCode, beishu * 818 + left, beishu * 322 + 10 + top - 20, beishu * 131, beishu * 131);
       }
       createImgCardContent(cardInfo, ctx)
       ctx.drawImage(topBar, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (89 - 6));
       drawRoundImage(ctx, beishu * (56 + 3) + left, beishu * (42 + 3) + top, beishu * (61 - 6), beishu * (61 - 6), beishu * 27.5, accountIcon, accountIcon.width, accountIcon.height)
       let accountName = userInfo.account_name
       if (accountName.length > 6) {
         accountName = accountName.substr(0, 5)
         moveLeft = accountName.length * 32 + 44
         accountName = accountName + '...'
       }
       accountName = accountName + ''
       let moveLeft = judgeContentWidth(ctx, accountName, 32)
       drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft / 2 - 32) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", accountName)
       if (cardInfo.card_type == 'TRUE_CARD') {
         drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '兑换')
         moveLeft = moveLeft + 8 + 64 + 32 - 8 + 32
       } else if (cardInfo.account_id == userInfo.account_id) {
         drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '创造')
         moveLeft = moveLeft + 8 + 64 + 32 - 8 + 32
       } else {
         drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8 + 4) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", 'PICK')
         moveLeft = moveLeft + 8 + 128 - 32 + 3 + 32
       }
       drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '了这块碎片')
       moveLeft = moveLeft + 128 + 8 + 8 - 32 + 32
       drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '拥有')
       let haveCardNumWidth = judgeContentWidth(ctx, cardInfo.have_card_num, 32)
       moveLeft = moveLeft + haveCardNumWidth / 2 + 32 + 6
       drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '' + cardInfo.have_card_num)
       moveLeft = moveLeft + 16 + 6 + haveCardNumWidth / 2
       drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '块')

       setTimeout(function (e) {


         console.log("生成了，哈哈哈哈")
         wx.canvasToTempFilePath({ //将canvas生成图片
           canvas: canvas,
           x: 0,
           y: 0,
           destWidth: 1080 * 2,
           destHeight: 1440 * 2,
           quality: 1,
           success: function (res) {

             callBack()
             wx.saveImageToPhotosAlbum({
               filePath: res.tempFilePath,
               success: function (res1) {
                 console.log('图片生成成功，已存入相册')

                 wx.showToast({
                   title: '[实体碎片]生成完成  已存入相册',
                   icon: 'none'
                 })
               },
               fail: function (res) {
                 console.log(res)
               }
             })

             callBack2(res)

           },
           fail: function (res) {
             console.log(res)
           }
         }, _this)
       }, 200)
     }

   }, 500)

   createImgCardBottom(cardInfo, ctx, canvas)
   let num = canvas.createImage();
   if (cardInfo.card_type == "SSR") {
     num.src = '/pages/images/ssr.png';
   } else {
     num.src = '/pages/images/sr.png';
   }
   num.onload = () => {
     ctx.drawImage(num, beishu * 711 + left, beishu * 474 + top, beishu * 125, beishu * 125);
   }
   if (cardInfo.surplus_card_num > 99) {
     drawWord(ctx, beishu * (711 + 211) + left, beishu * (465 + 75) + top, beishu * 50, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
   } else {
     drawWord(ctx, beishu * (711 + 211) + left, beishu * (465 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
   }

   let lv = canvas.createImage();
   lv.src = '/pages/images/pick.png';
   lv.onload = () => {
     ctx.drawImage(lv, beishu * 711 + left, beishu * 647 + top, beishu * 120 * 2 / 3 * 2, beishu * 120 * 2 / 3);
   }
   drawWord(ctx, beishu * (711 + 181 + 20) + left, beishu * (616 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_lv)

   let cp = canvas.createImage();
   cp.src = '/pages/images/c_info_point.png';
   cp.onload = () => {
     ctx.drawImage(cp, beishu * (711 + 10) + left, beishu * 786 + top, beishu * 95, beishu * 95);
   }
   if (cardInfo.card_cpoint > 9999) {
     drawWord(ctx, beishu * (711 + 211 + 20) + left, beishu * (765 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_cpoint)
   } else {
     drawWord(ctx, beishu * (711 + 181 + 20) + left, beishu * (765 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_cpoint)
   }
 }
 let fillLeftBottomRoundRect = function (cxt, x, y, width, height, radius, /*optional*/ fillColor) {
   //圆的直径必然要小于矩形的宽高          
   if (2 * radius > width || 2 * radius > height) {
     return false;
   }
   cxt.save();
   cxt.translate(x, y);
   //绘制圆角矩形的各个边  
   drawLeftBottomRoundRectPath(cxt, width, height, radius);
   cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
   cxt.fill();
   cxt.restore();
 }
 let drawLeftBottomRoundRectPath = function (cxt, width, height, radius) {
   cxt.beginPath(0);
   //从右下角顺时针绘制，弧度从0到1/2PI  
   cxt.arc(width - 0, height - 0, 0, 0, Math.PI / 2);
   //矩形下边线  
   cxt.lineTo(radius / 2, height);
   //左下角圆弧，弧度从1/2PI到PI  
   cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
   //矩形左边线  
   cxt.lineTo(0, radius / 2);
   //左上角圆弧，弧度从PI到3/2PI  
   cxt.arc(0, 0, 0, Math.PI, Math.PI * 3 / 2);
   //上边线  
   cxt.lineTo(width - 0, 0);
   //右上角圆弧  
   cxt.arc(width - 0, 0, 0, Math.PI * 3 / 2, Math.PI * 2);
   //右边线  
   cxt.lineTo(width, height - 0);
   cxt.closePath();
 }
 let fillRightBottomRoundRect = function (cxt, x, y, width, height, radius, /*optional*/ fillColor) {
   //圆的直径必然要小于矩形的宽高          
   if (2 * radius > width || 2 * radius > height) {
     return false;
   }
   cxt.save();
   cxt.translate(x, y);
   //绘制圆角矩形的各个边  
   drawRightBottomRoundRectPath(cxt, width, height, radius);
   cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
   cxt.fill();
   cxt.restore();
 }
 let drawRightBottomRoundRectPath = function (cxt, width, height, radius) {
   cxt.beginPath(0);
   //从右下角顺时针绘制，弧度从0到1/2PI  
   cxt.arc(width - radius, height - radius, radius, radius, Math.PI / 2);
   //矩形下边线  
   cxt.lineTo(radius / 2, height);
   //左下角圆弧，弧度从1/2PI到PI  
   cxt.arc(0, height - 0, 0, Math.PI / 2, Math.PI);
   //矩形左边线  
   cxt.lineTo(0, 0);
   //左上角圆弧，弧度从PI到3/2PI  
   cxt.arc(0, 0, 0, Math.PI, Math.PI * 3 / 2);
   //上边线  
   cxt.lineTo(width - 0, 0);
   //右上角圆弧  
   cxt.arc(width - 0, 0, 0, Math.PI * 3 / 2, Math.PI * 2);
   //右边线  
   cxt.lineTo(width, height - radius / 2);
   cxt.closePath();
 }


 let judgeContentWidth = function (cxt, content, rpNum) {
   if (content == null || content == undefined || content.length == 0) {
     return 0;
   }

   cxt.font = 'bold ' + rpNum + 'px Arial';

   let width = cxt.measureText(content).width
   return width
 }





 let createShareVerticalImage = function (ctx, canvas, cardInfo1, that, callBack) {
   // let _this = this
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
       badge.src = cardInfo.card_badge_url;
       badge.onload = () => {
         ctx.drawImage(badge, beishu * 143 + left, beishu * 2 + top, beishu * 80, beishu * 80);
         setTimeout(function (e) {
           callBack()
         }, 500)
       }
     } else {
       setTimeout(function (e) {
         callBack()

       }, 500)
     }

     console.log(cardInfo)
     if (cardInfo.card_type == "SQUARE") {
       let squareBg = canvas.createImage();
       squareBg.src = "/pages/images/square_blue.png";
       squareBg.onload = () => {

         drawRoundImage(ctx, beishu * (188 * 0.266 + 11) + left, beishu * (188 * 0.198 + 9) + top, beishu * (188 * 0.205), beishu * (188 * 0.205), beishu * 0, squareBg, squareBg.width, squareBg.height)

         let accountIcon = canvas.createImage();
         accountIcon.src = cardInfo.account_icon;
         accountIcon.onload = () => {
           fillRoundRect(ctx, beishu * (188 * 0.329 + 11) + left, beishu * (188 * 0.211 + 9 + 3) + top, beishu * (188 * 0.079), beishu * (188 * 0.079), beishu * ((188 * 0.079) / 2), '#FFFFFF')
           drawRoundImage(ctx, beishu * (188 * 0.329 + 11 + 1) + left, beishu * (188 * 0.211 + 9 + 1 + 3) + top, beishu * (188 * 0.079 - 2), beishu * (188 * 0.079 - 2), beishu * ((188 * 0.079 - 2) / 2), accountIcon, accountIcon.width, accountIcon.height)

           drawWord(ctx, beishu * (188 * 0.366 + 11) + left, beishu * (188 * 0.322 + 9 + 3) + top, beishu * (188 * 0.027), "#FFFFFF", cardInfo.account_name)
           drawWord(ctx, beishu * (188 * 0.366 + 11) + left, beishu * (188 * 0.372 + 9) + top, beishu * (188 * 0.021), "#FFFFFF", '购于' + format(cardInfo.createtime, 'YY-MM-DD'))

           drawWord(ctx, beishu * (188 * 0.090 + 11) + left, beishu * (188 * 0.330 + 9) + top, beishu * (188 * 0.031), "#FFFFFF", cardInfo.city_name)
           if (cardInfo.deal_num == 0 || cardInfo.deal_num == 1) {
             drawWord(ctx, beishu * (188 * 0.638 + 11) + left, beishu * (188 * 0.330 + 9) + top, beishu * (188 * 0.031), "#FFFFFF", '初次购买')
           } else {
             drawWord(ctx, beishu * (188 * 0.638 + 11) + left, beishu * (188 * 0.330 + 9) + top, beishu * (188 * 0.031), "#FFFFFF", '交易' + cardInfo.deal_num + '次')
           }

           drawWord(ctx, beishu * (188 * 0.162 + 11) + left, beishu * (188 * 0.436 + 9) + top, beishu * (188 * 0.037), "#FFFFFF", cardInfo.area_name)
           drawWord(ctx, beishu * (188 * 0.587 + 11) + left, beishu * (188 * 0.436 + 9) + top, beishu * (188 * 0.037), "#FFFFFF", '第' + cardInfo.square_num + '块')

           drawWord(ctx, beishu * (188 * 0.460 + 11) + left, beishu * (188 * 0.858 + 9) + top, beishu * (188 * 0.037), "#E4C383", cardInfo.card_show_id)

         }
       }
       //  let squareBg = canvas.createImage();
       //  squareBg.src = "";
       //  squareBg.onload = () => {

       //  }
     }


   }



   let num = canvas.createImage();
   if (cardInfo.card_type == "SSR") {
     num.src = '/pages/images/ssr.png';
   } else if (cardInfo.card_type == "FUNCATION") {
     num.src = '/pages/images/function.png';
   } else if (cardInfo.card_type == "TRUE_CARD") {
     num.src = '/pages/images/true_card.png';
   } else if (cardInfo.card_type == "SQUARE") {
     num.src = '/pages/images/square.png';
   } else {
     num.src = '/pages/images/sr.png';
   }
   num.onload = () => {
     ctx.drawImage(num, beishu * 154 + left, beishu * 100 + top, beishu * 25, beishu * 25);
   }
   if (cardInfo.card_type == 'FUNCATION' || cardInfo.card_type == 'BONUS') {
     let infinite = canvas.createImage();
     infinite.src = '/pages/images/infiniteness.png'
     infinite.onload = () => {
       // ctx.drawImage(infinite, beishu * 194 + left, beishu * 100 + top, beishu * 25, beishu * 25);
       ctx.drawImage(infinite, beishu * 185 + left, beishu * 95 + top, beishu * 35, beishu * 35);

     }
   } else {
     drawWord(ctx, beishu * 197 + left, beishu * 114 + top, beishu * 12, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
   }

   let lv = canvas.createImage();
   if (cardInfo.card_type != "SQUARE") {
     lv.src = '/pages/images/pick.png';
   } else {
     lv.src = '/pages/images/c_info_lv.png';
   }
   lv.onload = () => {
     if (cardInfo.card_type != "SQUARE") {
       ctx.drawImage(lv, beishu * (154) + left, beishu * (132 + 3.5) + top, beishu * 25 * 1.5, beishu * 25 * 1.5 / 2);
     } else {
       ctx.drawImage(lv, beishu * (154) + left, beishu * (132) + top, beishu * 25, beishu * 25);
     }
   }
   if (cardInfo.card_type == 'FUNCATION' || cardInfo.card_type == 'BONUS') {
     let infinite = canvas.createImage();
     infinite.src = '/pages/images/infiniteness.png'
     infinite.onload = () => {
       // ctx.drawImage(infinite, beishu * 194 + left, beishu * 132 + top, beishu * 25, beishu * 25);
       ctx.drawImage(infinite, beishu * 185 + left, beishu * 125 + top, beishu * 35, beishu * 35);
     }
   } else {
     if (cardInfo.card_type != "SQUARE") {
       drawWord(ctx, beishu * (194 + 4) + left, beishu * 146 + top, beishu * 12, "#FFFFFF", cardInfo.pick_num)
     } else {
       drawWord(ctx, beishu * (197) + left, beishu * 146 + top, beishu * 12, "#FFFFFF", cardInfo.card_lv)
     }
   }

   let cp = canvas.createImage();
   cp.src = '/pages/images/c_info_point.png';
   cp.onload = () => {
     ctx.drawImage(cp, beishu * 156 + left, beishu * 167 + top, beishu * 20, beishu * 20);
   }
   if (cardInfo.card_type == 'FUNCATION' || cardInfo.card_type == 'SQUARE') {
     let infinite = canvas.createImage();
     infinite.src = '/pages/images/infiniteness.png'
     infinite.onload = () => {
       ctx.drawImage(infinite, beishu * 180 + left, beishu * 158 + top, beishu * 35, beishu * 35);
     }
   } else if (cardInfo.assessing) {
     drawWord(ctx, beishu * (194 + 4) + left, beishu * 177 + top, beishu * 10, "#FFFFFF", '宇宙首发')
   } else {
     drawWord(ctx, beishu * (194 + 4) + left, beishu * 179 + top, beishu * 12, "#FFFFFF", cardInfo.card_cpoint)
   }
 }


 let createHorizontalImage = function (ctx, canvas, cardInfo1, that, callBack) {
   let _this = this
   let beishu = 8
   let left = beishu * 7
   let top = -10;
   let width = (beishu * 212 - 120) / 3
   let cardInof = cardInfo1
   fillLeftBottomRoundRect(ctx, beishu * 18 + left, beishu * 169 + top, width, beishu * 31, beishu * 5, '#858BC7')
   fillLeftBottomRoundRect(ctx, beishu * 18 + left + width, beishu * 169 + top, width, beishu * 31, 0, '#58B8B7')
   fillRightBottomRoundRect(ctx, beishu * 18 + left + width * 2, beishu * 169 + top, width, beishu * 31, beishu * 5, '#E5C383')

   addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
   fillRoundRect(ctx, beishu * 10 + left, beishu * 8 + top, beishu * 214, beishu * 161, beishu * 10, '#000000')
   clearShadow(ctx)

   let seal = canvas.createImage();
   seal.src = cardInof.images[0].image_url;
   seal.onload = () => {
     // ctx.drawImage(seal, 80, 940, 150, 150);

     drawRoundImage(ctx, beishu * 11 + left, beishu * 9 + top, beishu * 212, beishu * 159, beishu * 10, seal, seal.width, seal.height)
     if (cardInof.hot_card) {
       fillRoundRect(ctx, beishu * 5 + left, beishu * 2 + top, beishu * 40, beishu * 20, beishu * 5, '#F46563')
       drawWord(ctx, beishu * 25 + left, beishu * 13 + top, beishu * 13, "#FFFFFF", "热门")
     }


     if (cardInof.have_card_badge) {
       let badge = canvas.createImage();
       badge.src = cardInof.card_badge_url;
       badge.onload = () => {
         addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
         ctx.drawImage(badge, beishu * 157 + left, beishu * 2 + top, beishu * 80, beishu * 80);
         clearShadow(ctx)
         setTimeout(function (e) {
           callBack()
         }, 500)
       }
     } else {
       setTimeout(function (e) {
         callBack()

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
   if (cardInof.card_type != "SQUARE") {
     lv.src = '/pages/images/pick.png';
   } else {
     lv.src = '/pages/images/c_info_lv.png';
   }
   lv.onload = () => {
     if (cardInof.card_type != "SQUARE") {
       ctx.drawImage(lv, beishu * 24 + left + width, beishu * (172 + 3.5) + top, beishu * 25 * 1.5, beishu * 25 * 1.5 / 2);
     } else {
       ctx.drawImage(lv, beishu * 24 + left + width, beishu * 172 + top, beishu * 25, beishu * 25);
     }
   }

   if (cardInof.card_type == 'FUNCATION') {
     let infinite = canvas.createImage();
     infinite.src = '/pages/images/infiniteness.png'
     infinite.onload = () => {
       // ctx.drawImage(infinite, beishu * 194 + left, beishu * 132 + top, beishu * 25, beishu * 25);
       ctx.drawImage(infinite, beishu * 180 + left, beishu * 125 + top, beishu * 35, beishu * 35);
     }
   } else {
     if (cardInof.card_type != "SQUARE") {
       drawWord(ctx, beishu * 68 + left + width, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.pick_num)
     } else {
       drawWord(ctx, beishu * 60 + left + width, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_lv)
     }
   }



   let cp = canvas.createImage();
   cp.src = '/pages/images/c_info_point.png';
   cp.onload = () => {
     ctx.drawImage(cp, beishu * 25 + left + width * 2, beishu * 174 + top, beishu * 20, beishu * 20);
   }


   if (cardInof.card_type == 'FUNCATION' || cardInof.card_type == 'SQUARE') {
     //  let infinite = canvas.createImage();
     //  infinite.src = '/pages/images/infiniteness.png'
     //  infinite.onload = () => {
     //    ctx.drawImage(infinite, beishu * 180 + left, beishu * 158 + top, beishu * 35, beishu * 35);
     //  }
   } else if (cardInof.assessing) {
     drawWord(ctx, beishu * 64 + left + width * 2, beishu * 185 + top, beishu * 9, "#FFFFFF", '宇宙首发')
   } else {
     drawWord(ctx, beishu * 58 + left + width * 2, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_cpoint)
   }

 }


 module.exports.createShareVerticalImage = createShareVerticalImage;
 module.exports.createHorizontalImage = createHorizontalImage;

 module.exports.createVerticalImage = createVerticalImage;





 function format(ts, option) {
   var date = new Date(ts)
   var year = date.getFullYear()
   var month = date.getMonth() + 1
   var day = date.getDate()
   var week = date.getDay()
   var hour = date.getHours()
   var minute = date.getMinutes()
   var second = date.getSeconds()

   //获取 年月日
   if (option == 'YY-MM-DD') return [year, month, day].map(formatNumber).join('-')

   //获取 年月
   if (option == 'YY-MM') return [year, month].map(formatNumber).join('-')

   //获取 年
   if (option == 'YY') return [year].map(formatNumber).toString()

   //获取 月
   if (option == 'MM') return [mont].map(formatNumber).toString()

   //获取 日
   if (option == 'DD') return [day].map(formatNumber).toString()

   //获取 年月日 周一 至 周日
   if (option == 'YY-MM-DD Week') return [year, month, day].map(formatNumber).join('-') + ' ' + getWeek(week)

   //获取 月日
   if (option == 'MM-DD') return [month, day].map(formatNumber).join('-')

   //获取 月日 周一 至 周日
   if (option == 'MM-DD Week') return [month, day].map(formatNumber).join('-') + ' ' + getWeek(week)

   //获取 周一 至 周日
   if (option == 'Week') return getWeek(week)

   //获取 时分秒
   if (option == 'hh-mm-ss') return [hour, minute, second].map(formatNumber).join(':')

   //获取 时分
   if (option == 'hh-mm') return [hour, minute].map(formatNumber).join(':')

   //获取 分秒
   if (option == 'mm-dd') return [minute, second].map(formatNumber).join(':')

   //获取 时
   if (option == 'hh') return [hour].map(formatNumber).toString()

   //获取 分
   if (option == 'mm') return [minute].map(formatNumber).toString()

   //获取 秒
   if (option == 'ss') return [second].map(formatNumber).toString()

   //默认 时分秒 年月日
   return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
 }

 function formatNumber(n) {
   n = n.toString()
   return n[1] ? n : '0' + n
 }

 function getWeek(n) {
   switch (n) {
     case 1:
       return '星期一'
     case 2:
       return '星期二'
     case 3:
       return '星期三'
     case 4:
       return '星期四'
     case 5:
       return '星期五'
     case 6:
       return '星期六'
     case 7:
       return '星期日'
   }
 }