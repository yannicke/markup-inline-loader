var PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;

var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');

var svgo = new SVGO({
  plugins: [
    {
      removeTitle: true
    }
  ]
});

module.exports = function (content) {
  var loader = this;
  content = content.replace(PATTERN, function (match, element, preAttributes, fileName, postAttributes) {
    var isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    var isImg = element.toLowerCase() === 'img';

    if (!isSvgFile && isImg) {
      return match;
    }

    var filePath = path.join(loader.context, fileName);
    loader.addDependency(filePath);
    var fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    if (isSvgFile) {
      // It's callback, But it's sync
      svgo.optimize(fileContent, function (result) {
        fileContent = result.data;
      });
    }
    return fileContent.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  });
  return content;
};
