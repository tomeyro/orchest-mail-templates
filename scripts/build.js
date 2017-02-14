let fs = require('fs');

function buildCss() {
  let less = require('less');

  fs.readFile('src/less/style.less', function(err, style) {
    if (err) throw err;

    less.render(style.toString(), {
      compress: true
    }, function(err, output) {
      if (err) throw err;

      buildHtml(output.css);
    });
  });
}

function buildHtml(css) {
  let juice = require('juice');

  fs.readdir('src/templates', function(err, files) {
    if (err) throw err;

    fs.readFile('src/templates/base.html', function(err, base) {
      if (err) throw err;

      files.forEach(function(fileName) {
        if (fileName != 'base.html') {
          fs.readFile('src/templates/' + fileName, function(err, template) {
            if (err) throw err;

            html = juice('<style>' + css + '</style>' + base.toString().replace('{{body}}', template.toString().trim()));
            fs.writeFile(
                'build/html/' + fileName, html,
                function(err) { if (err) throw err; }
            );
          });
        }
      });
    });
  });
}

buildCss();
/**
fs.readFile('data/vauxoo.json', function(err, json) {
  if (err) throw err;

  data = JSON.parse(json.toString());

  for (dir in data['pages']) {
    fs.mkdir(dir, function(err) {
      if (err) {
        if (err.code != 'EEXIST') throw err;
      }
    });
    for (page in data['pages'][dir]) {
      fs.writeFile(
          dir + '/' + page + '.html',
          compiler(data['pages'][dir][page]),
          function(err) { if (err) throw err; }
      )
    }
  }
});

let less = require('less');

fs.readFile('src/less/style.less', function(err, style) {
  if (err) throw err;

  less.render(style.toString(), {
    compress: true
  }, function(err, output) {
    fs.writeFile(
        'res/css/style.css',
        output.css,
        function(err) { if (err) throw err; }
    );
  });
});
**/
