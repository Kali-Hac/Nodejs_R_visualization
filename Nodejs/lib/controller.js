
//通过心知api获取全国天气情况，下面的账号和密钥可修改为自己去官网申请的
const UID = "U60781D44D"; 
const KEY = "fmyzlw8bv3faia8j"; 

var Api = require('./api.js')
var fs = require('fs')
var util = require('util')
var {local_transform, get_province} = require('./local_transform')
//写入中文要先进行编码转换
var iconv = require('iconv-lite'); 
var cnt = 0
var h_cnt = 0
var api = new Api(UID, KEY);
var ps = "黑龙江、吉林、辽宁、江苏、山东、安徽、河北、河南、湖北、湖南、江西、陕西、山西、四川、青海、海南、广东、贵州、浙江、福建、台湾、甘肃、云南、内蒙古、宁夏、新疆、西藏、广西"
var sh = "哈尔滨、长春、沈阳、南京、济南、合肥、石家庄、郑州、武汉、长沙、南昌、西安、太原、成都、西宁、海口、广州、贵阳、杭州、福州、台北、兰州、昆明、呼和浩特、银川、乌鲁木齐、拉萨、南宁"
var special = "北京、上海、天津、重庆、香港、澳门"



//标的是省会的经纬度
var geoCoord = {
  '甘肃':[103.73, 36.03],
  '青海':[101.74, 36.56],
  '四川':[104.06, 30.67],
  '河北':[114.48, 38.03],
  '云南':[102.73, 25.04],
  '贵州':[106.71, 26.57],
  '湖北':[114.31, 30.52],
  '河南':[113.65, 34.76],
  '山东':[117, 36.65],
  '江苏':[118.78, 32.04],
  '安徽':[117.27, 31.86],
  '浙江':[120.19, 30.26],
  '江西':[115.89, 28.68],
  '福建':[119.3, 26.08],
  '广东':[113.23, 23.16],
  '湖南':[113, 28.21],
  '海南':[110.35, 20.02],
  '辽宁':[123.38, 41.8],
  '吉林':[125.35, 43.88],
  '黑龙江':[126.63, 45.75],
  '山西':[112.53, 37.87],
  '陕西':[108.95, 34.27],
  '台湾':[121.30, 25.03],
  '北京':[116.46, 39.92],
  '上海':[121.48, 31.22],
  '重庆':[106.54, 29.59],
  '天津':[117.2, 39.13],
  '内蒙古':[111.65, 40.82],
  '广西':[108.33, 22.84],
  '西藏':[91.11, 29.97],
  '宁夏':[106.27, 38.47],
  '新疆':[87.68, 43.77],
  '香港':[114.17, 22.28],
  '澳门':[113.54, 22.19]
  };

ps = ps.split('、')
sh = sh.split('、')
special = special.split('、')
var province_temperature = new Array()


//p——省份 t——温度 weather——天气情况
var p_t = {p: '', t: '', weather: ''}

//通过心知api获取全国天气情况
function get_T_from_Api(){
  //普通省份天气获取
  for(let i = 0;i<sh.length;i++){
    api.getWeatherNow(sh[i]).then(function(data) {
      // console.log(JSON.stringify(data, null, 4));
      p_t.p = ps[i]
      p_t.t = data.results[0].now.temperature
      p_t.weather = data.results[0].now.text
      province_temperature.push(Object.assign({}, p_t))
      // console.log(JSON.stringify(province_temperature, null, 4))
    }).catch(function(err) {
      console.log(err.error.status);
    });
  }
  //直辖市、特别行政区天气获取
  for(let i = 0;i<special.length;i++){
    api.getWeatherNow(special[i]).then(function(data) {
      // console.log(JSON.stringify(data, null, 4));
      p_t.p = special[i]
      p_t.t = data.results[0].now.temperature
      p_t.weather = data.results[0].now.text
      province_temperature.push(Object.assign({}, p_t))
      console.log(JSON.stringify(province_temperature, null, 4))
    }).catch(function(err) {
      console.log(err.error.status);
    });
  }
}


//把获取的天气情况按(省+气温)写入csv文件中
//再写一个csv(经度+纬度+热密度(气温))用于绘制热力图
function update_T_data(){
  let csv_str = '省份,气温\r\n'
  for(let i=0 ; i< province_temperature.length; i++){
    csv_str += province_temperature[i].p + ',' + province_temperature[i].t + '\r\n'
    // console.log(csv_str)
  }
    csv_str =  iconv.encode(csv_str, 'gbk');  
    fs.writeFile('./map/t.csv',csv_str, {flag:'w'}, function(err){
    if(err){
      console.error(err);
    }else{
      cnt += 1
      let str = util.format('[%d / +∞] '+'Have updated Province-Temperature into ./map/t.csv successfully', cnt)
      util.log(str)
      local_transform()
    }
  })
}


// get_T_from_Api()
// setTimeout(function(){
//   update_T_data()
// }, 5000)

module.exports = {
    get_T_from_Api,
    update_T_data
}

