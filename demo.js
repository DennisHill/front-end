var path = require('path');
var fs = require('fs');

var jsFileList = fs.readdirSync(path.resolve(__dirname, 'doc/AngularJS面面观'))

var ret = [];

jsFileList.forEach(file => {
  ret.push(`- [${file.split('.')[0]}](AngularJS面面观/${file})`)
})



console.log(ret.join('\n'))
