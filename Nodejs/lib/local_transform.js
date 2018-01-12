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
  
var cnt = 0
var _t = {}
var fs = require('fs')
var util = require('util')
//写入中文要先进行编码转换
var iconv = require('iconv-lite'); 

function local_transform(){
  fs.readFile('./map/t.csv',{encoding:'binary'}, function (err, data) {
      let table = new Array();
      if (err) {
          console.log(err.stack);
          return;
      }
      ConvertToTable(data, function (table) {
          console.log('Start to transform the temperature to heat');
      })
    });
}
  
function ConvertToTable(data, callBack) {
    let csv_md = ''
    var buf = new Buffer(data, 'binary');
    var data = iconv.decode(buf, 'GBK');
    data = data.toString();
    let table = new Array();
    let rows = new Array();
    rows = data.split("\r\n");
    for (let i = 0; i < rows.length; i++) {
        table.push(rows[i].split(","));
          for(let j in geoCoord){
              if(j === rows[i].split(",")[0]){
                let JD = geoCoord[j][0]
                let WD = geoCoord[j][1]
                 let wd = parseFloat(rows[i].split(",")[1])
                 //先变正再进行字典序排序
                 //解决温度相同的bug
                 if(_t[wd + 50.0]){
                   if(_t[wd + 50.0] instanceof Array)
                      _t[wd + 50.0].push(j)
                    else
                      _t[wd + 50.0] = [j, _t[wd + 50.0]]
                 }
                  else
                    _t[wd + 50.0] = j
                 let alpha_k = 2
                  if(wd < 0)
                      wd = wd /200
                  else{
                    if(wd / 4 > 1.0){
                      alpha_k = 2
                    }
                    if (wd / 4 > 2.0){
                      alpha_k = 3
                    }
                    if ( wd / 4 > 3.0){
                      alpha_k = 4
                    }
                    wd = wd / 100
                  }
                  csv_md += JD + ',' + WD + ',' + wd.toString() +'\r\n'
                if(wd > 0){
                  for(let k=1;k<alpha_k;k++){
                    csv_md += (parseFloat(JD) - k * 0.01) .toString() + ',' + WD + ',' + wd.toString() +'\r\n'
                  }
                }
              }
          }
    }
    csv_md =  iconv.encode(csv_md, 'gbk');
    // console.log(csv_md)
    fs.writeFile('./map/heat.csv',csv_md, {flag:'w'}, function(err){
      if(err){
        console.error(err);
      }else{
        cnt += 1
        let str = util.format('[%d / +∞] '+'Have updated Province-Heat by local data into ./map/heat.csv successfully', cnt)
        util.log(str)
        province_sort()
      }
      })
      callBack(table)
}
function get_province(){
  console.log('省份\t经度\t纬度\t')
  for(var p in geoCoord){
    console.log(p + '\t' + geoCoord[p][0] + '\t' + geoCoord[p][1])
  }
}

//按温度排名省份,并生成轨迹顺序图csv数据,用于绘制类迁徙温度地图
function province_sort(){
    let oa = Object.keys(_t).sort();
    let sort_t = {};
    for(let i=0;i<oa.length;i++){
      sort_t[oa[i]] = _t[oa[i]]
    }
    var migrate_str = '起点,目的地\r\n'
    for(let i=1;i<oa.length;i++){
      if(sort_t[oa[i-1]] instanceof Array){
        if(sort_t[oa[i]] instanceof Array){
          migrate_str += sort_t[oa[i-1]][0] + ',' + sort_t[oa[i]][0] + '\r\n'
        }
        else{
          migrate_str += sort_t[oa[i-1]][0] + ',' + sort_t[oa[i]] + '\r\n'
        }
        // for(let j=1; j<sort_t[oa[i-1]].length;j++){
        //   migrate_str += sort_t[oa[i-1]][j-1] + ',' + sort_t[oa[i-1]][j] + '\r\n'
        // }
        for(let j=sort_t[oa[i-1]].length-1; j>0;j--){
          migrate_str += sort_t[oa[i-1]][j] + ',' + sort_t[oa[i-1]][j-1] + '\r\n'
        }
      }
      else{
        if(sort_t[oa[i]] instanceof Array){
          migrate_str += sort_t[oa[i-1]] + ',' + sort_t[oa[i]][0] + '\r\n'
        }
        else{
          migrate_str += sort_t[oa[i-1]] + ',' + sort_t[oa[i]] + '\r\n'
        }
      }
    }
    if(sort_t[oa[oa.length-1]] instanceof Array){
      for(let j=sort_t[oa[oa.length-1]].length-1; j>0;j--){
        migrate_str += sort_t[oa[oa.length-1]][j] + ',' + sort_t[oa[oa.length-1]][j-1] + '\r\n'
      }
    }
    migrate_str =  iconv.encode(migrate_str, 'gbk');
    fs.writeFile('./map/migrate.csv',migrate_str, {flag:'w'}, function(err){
      if(err){
        console.error(err);
      }else{
        cnt += 1
        let str = util.format('[%d / +∞] '+'Have output Sorted-Provinces by local data into ./map/migrate.csv successfully', cnt)
        util.log(str)
      }
      })
}

module.exports ={
  local_transform,
  get_province
}