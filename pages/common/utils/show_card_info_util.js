var getShowCardNumContent = function (cardInfo) {

  let cardType = '/pages/images/sr.png'
  let content = "普通碎片 "
  let contentInfo = '该碎片[已经被收集]的数量 / 该碎片[全部发行]的数量。'
  let getType = '收集'
  let show_infinite = false
  let num = cardInfo.surplus_card_num + '/' + cardInfo.total_card_num
  if (cardInfo.card_type == 'SSR') {
    cardType = '/pages/images/ssr.png'
    content = "稀有碎片  "
  } else if (cardInfo.card_type == 'FUNCATION') {
    num = ''
    cardType = '/pages/images/function.png'
    content = "功能碎片  "
    contentInfo = '功能碎片总数量没有上限。每人同一种功能碎片最多持有5块。 '
    show_infinite = true
  } else if (cardInfo.card_type == 'TRUE_CARD') {
    getType = '兑换'
    cardType = '/pages/images/true_card.png'
    content = "实物碎片  "
    contentInfo = '该碎片[已经被兑换]的数量/该碎片[全部可兑换]的数量。'
  } else if (cardInfo.card_type == 'SQUARE') {
    getType = '购买'
    cardType = '/pages/images/square.png'
    content = "地盘碎片  "
    contentInfo = '该碎片[已经被购买]的数量/该碎片[全部可购买]的数量。'
  }else if(cardInfo.card_type == 'BONUS'){
    num = ''
    show_infinite = true
  }

  let result = {
    backgroud_color: '#848DC8',
    info_icon_urlj: cardType,
    info_icon_size: 100,
    info_icon_to_top_size: 15,
    info_title: content + '数量: ' + num,
    info_content: contentInfo,
    info_content2: '数量变化：',
    icon1: cardType,
    icon_size: 40,
    icon2: "",
    icon3: "",
    content3: "被" + getType + "数量",
    content11: "+ " + cardInfo.card_got_day1,
    content12: "",
    content13: "",
    content21: "+ " + cardInfo.card_got_day7,
    content22: "",
    content23: "",
    content31: "+ " + cardInfo.card_got_day30,
    content32: "",
    content33: "",
    show_infinite: show_infinite
  }
  return result
}

var getShowCardLvContent = function (cardInfo) {
 

  let result = ''
  if (cardInfo.card_type == "SQUARE") {
    let show_infinite = false
    let contentInfo = '表示该碎片的受欢迎程度。基于该碎片的点赞、想要、评论等互动越多，等级越高。'
    let num = cardInfo.card_lv
    if (cardInfo.card_type == 'SSR') {
      contentInfo = '表示该碎片的受欢迎程度。'
    } else if (cardInfo.card_type == 'FUNCATION') {
      num = ''
      show_infinite = true
      contentInfo = '功能碎片没有等级。 '
    } else if (cardInfo.card_type == 'TRUE_CARD') {
      contentInfo = '表示该碎片的受欢迎程度。'
    } else if (cardInfo.card_type == 'SQUARE') {
      contentInfo = '表示该地盘及周边区域的火爆程度。越多人在地盘附近互动，等级越高。'
    }else if(cardInfo.card_type == 'BONUS'){
      num = ''
      show_infinite = true
    }
    result = {
      backgroud_color: '#58B8B7',
      info_icon_urlj: '/pages/images/c_info_lv.png',
      info_icon_size: 100,
      info_icon_to_top_size: 15,
      info_title: '等级：' + num,
      info_content: contentInfo,
      info_content2: '等级成长',
      icon1: "/pages/images/c_info_lv_black.png",
      icon_size: 40,
      icon2: "",
      icon3: "",
      content3: "",
      content11: "+ " + cardInfo.card_lv_day1,
      content12: "",
      content13: "",
      content21: "+ " + cardInfo.card_lv_day7,
      content22: "",
      content23: "",
      content31: "+ " + cardInfo.card_lv_day30,
      content32: "",
      content33: "",
      show_infinite: show_infinite
    }
  } else {
    let show_infinite = false
    let contentInfo = '表示该碎片的被Pick次数，被Pick次数越多，碎片价值也越高。'
    let num = cardInfo.pick_num
    if (cardInfo.card_type == 'SSR') {

      contentInfo = '表示该碎片的被Pick次数，被Pick次数越多，碎片价值也越高。'
    } else if (cardInfo.card_type == 'FUNCATION') {
      num = ''
      show_infinite = true
      contentInfo = '功能碎片没有等级。 '
    } else if (cardInfo.card_type == 'TRUE_CARD') {

      contentInfo = '表示该碎片的被Pick次数，被Pick次数越多，碎片价值也越高。'
    }else if(cardInfo.card_type == 'BONUS'){
      num = ''
      show_infinite = true
    }

    result = {
      backgroud_color: '#58B8B7',
      info_icon_urlj: '/pages/images/pick.png',
      info_icon_size: 130,
      info_icon_to_top_size: 15,
      info_title: 'Pick：' + num,
      info_content: contentInfo,
      info_content2: 'Pick成长',
      icon1: "/pages/images/pick.png",
      icon_size: 75,
      icon2: "",
      icon3: "",
      content3: "",
      content11: "+ " + cardInfo.card_lv_day1,
      content12: "",
      content13: "",
      content21: "+ " + cardInfo.card_lv_day7,
      content22: "",
      content23: "",
      content31: "+ " + cardInfo.card_lv_day30,
      content32: "",
      content33: "",
      show_infinite: show_infinite
    }
  }
  return result
}


var getShowCardCpContent = function (cardInfo) {
  
  let show_infinite = false
  let contentInfo = '表示该碎片的价值，售出可以换取对应的CP，会随着Pick等互动的增多而提升。'
  let num = cardInfo.card_cpoint
  if (cardInfo.card_type == 'SSR') {
    contentInfo = '表示该碎片的价值。'
  } else if (cardInfo.card_type == 'FUNCATION') {
    num = ''
    show_infinite = true
    contentInfo = '功能碎片无法通过C-point购买，只能通过收集或赠予获得。'
  } else if (cardInfo.card_type == 'TRUE_CARD') {
    contentInfo = '表示该碎片的价值，售出可以换取对应的CP，会随着Pick等互动的增多而提升。'
  } else if (cardInfo.card_type == 'SQUARE') {
    num = ''
    show_infinite = true
    contentInfo = '表示该碎片的价值，售出可以换取对应的CP，会随着Pick等互动的增多而提升。'
  }

  if (cardInfo.assessing) {
    num = '宇宙首发中'
    cardInfo.card_cpoint_day1 = 0
    cardInfo.card_cpoint_day7 = 0
    cardInfo.card_cpoint_day30 = 0
  }
  let result = {
    backgroud_color: '#E4C383',
    info_icon_urlj: '/pages/images/c_info_point.png',
    info_icon_size: 80,
    info_icon_to_top_size: 25,
    info_title: 'C-point: ' + num,
    info_content: contentInfo,
    info_content2: 'C-point成长：',
    icon1: "/pages/images/c_info_point_black.png",
    icon_size: 30,
    icon2: "",
    icon3: "",
    content3: "",
    content11: "+ " + cardInfo.card_cpoint_day1,
    content12: "",
    content13: "",
    content21: "+ " + cardInfo.card_cpoint_day7,
    content22: "",
    content23: "",
    content31: "+ " + cardInfo.card_cpoint_day30,
    content32: "",
    content33: "",
    show_infinite: show_infinite
  }

  return result
}

module.exports.getShowCardNumContent = getShowCardNumContent;
module.exports.getShowCardCpContent = getShowCardCpContent;
module.exports.getShowCardLvContent = getShowCardLvContent;