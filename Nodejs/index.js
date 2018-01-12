var {get_T_from_Api, update_T_data} = require('./lib/controller')
var {local_transform, get_province} = require('./lib/local_transform')
var program = require('commander');
var util = require('util')


program
  .version('0.1.1')
  .option('-T, --temperature', 'Get Temperature From Apis and Transform it into Heat')
  .option('-L, --local_transformation', 'Transform the local temperature data to heat data')
  .option('-P, --provinces', 'Display all the provinces that can get info of weather')
  .parse(process.argv);

if (program.temperature){
  get_T_from_Api()
  //待API数据完全传回后再写入
  setTimeout(function(){
    update_T_data()
  }, 5000)
  // console.log(JSON.stringify(province_temperature, null, 4))
  }
else if (program.local_transformation){
  local_transform()
}
else if (program.provinces){
  get_province()
}
else{
  util.log('Please input the args to run this program\nYou can use "node index.js -h" to get the help info ');
}

