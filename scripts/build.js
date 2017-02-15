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

  fs.readdir('src/templates/html', function(err, files) {
    if (err) throw err;

    fs.readFile('src/templates/html/base.html', function(err, base_template) {
      if (err) throw err;

      records = [];
      files.forEach(function(fileName) {
        if (fileName != 'base.html') {
          fs.readFile('src/templates/html/' + fileName, function(err, template) {
            if (err) throw err;

            html = juice('<style>' + css + '</style>' + base_template.toString().replace('{{body}}', template.toString().trim()));
            fs.writeFile(
                'build/html/' + fileName, html,
                function(err) { if (err) throw err; }
            );
            if (fileName != 'example.html') {
              records.push({'name': fileName.replace(".html", ""), 'html': html});
            }
          });
        }
      });

      buildXml(records);
    });
  });
}

function buildXml(records) {
  fs.readFile('src/templates/xml/base.xml', function(err, base_template) {
    if (err) throw err;

    fs.readFile('src/templates/xml/record.xml', function(err, record_template) {
      if (err) throw err;

      rendered_records = [];
      records.forEach(function(record) {
        rendered_record = record_template.toString()
          .replace("{{id}}", record.name)
          .replace("{{name}}", record.name.charAt(0).toUpperCase() + record.name.substr(1).replace(/_/g, " "))
          .replace("{{html}}", record.html.trim());
        rendered_records.push(rendered_record);
      });
      xml = base_template.toString().replace("{{records}}", "  " + rendered_records.join("").trim());
      fs.writeFile(
          'build/xml/mail_templates.xml', xml,
          function(err) { if (err) throw err; }
      );
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
