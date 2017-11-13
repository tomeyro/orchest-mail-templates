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

      blocks = {};
      blocks_files = fs.readdirSync('src/templates/html/blocks');
      blocks_files.forEach(function(block_file) {
        blocks[block_file.replace('.html', '')] = fs.readFileSync('src/templates/html/blocks/' + block_file);
      });

      records = [];
      files.forEach(function(fileName) {
        if (!['base.html', 'blocks'].includes(fileName)) {
          fs.readFile('src/templates/html/' + fileName, function(err, template) {
            if (err) throw err;

            options = {};
            html = base_template.toString().replace('{{body}}', template.toString().trim());
            for (block in blocks) {
              html = html.replace('{{' + block + '}}', blocks[block]);
            }
            html = juice('<style>' + css + '</style>' + html);
            if (match = html.match(/<!--{[^]+}-->/)) {
              html = html.replace(match[0], '');
              options = JSON.parse(match[0].replace('<!--', '').replace('-->', ''));
            }
            html = html.replace(/\n{2,}/g, '\n');
            fs.writeFile(
                'build/html/' + fileName, html,
                function(err) { if (err) throw err; }
            );
            if (fileName != 'example.html') {
              records.push({'name': fileName.replace(".html", ""), 'html': html, 'options': options});
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
      records.sort(function(prev, next) {
        return next.name < prev.name ? 1 : (next.name > prev.name ? -1 : 0);
      }).forEach(function(record) {
        rendered_record = record_template.toString()
          .replace("{{id}}", record.name)
          .replace("{{name}}", record.name.charAt(0).toUpperCase() + record.name.substr(1).replace(/_/g, " "))
          .replace("{{html}}", record.html.trim());
        for (field in (record.options.field_values || {})) {
          rendered_record = rendered_record.replace(
            new RegExp('<field name="' + field + '"([^<]*\/>|[^]*<\/field>)', 'g'),
            '<field name="' + field + '">' + (record.options.field_values || {})[field] + '</field>'
          );
        }
        for (field in (record.options.field_refs || {})) {
          rendered_record = rendered_record.replace(
            new RegExp('<field name="' + field + '"([^<]*\/>|[^]*<\/field>)', 'g'),
            '<field name="' + field + '" ref="' + (record.options.field_refs || {})[field] + '"/>'
          );
        }
        for (field in (record.options.field_evals || {})) {
          rendered_record = rendered_record.replace(
            new RegExp('<field name="' + field + '"([^<]*\/>|[^]*<\/field>)', 'g'),
            '<field name="' + field + '" eval="' + (record.options.field_evals || {})[field] + '"/>'
          );
        }
        (record.options.exclude_fields || []).forEach(function(field) {
          rendered_record = rendered_record.replace(new RegExp('<field name="' + field + '"([^<]*\/>|[^]*<\/field>)', 'g'), '');
        });
        rendered_records.push(rendered_record);
      });
      xml = '';
      base_template.toString().replace("{{records}}", "  " + rendered_records.join("").trim()).split('\n').forEach(function(line) {
        if (line.trim()) {
          xml += line + '\n';
        }
      });
      fs.writeFile(
          'build/xml/mail_templates.xml', xml,
          function(err) { if (err) throw err; }
      );
    });
  });
}

buildCss();
