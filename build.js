var path = require('path');
var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var handlebars = require('handlebars');
var assets = require('metalsmith-assets');
var autoprefixer = require('metalsmith-autoprefixer');
var collections = require('metalsmith-collections');
var drafts = require('metalsmith-drafts');
var excerpts = require('metalsmith-excerpts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var templates = require('metalsmith-templates');
var each = require('metalsmith-each');
var moment = require('moment');

handlebars.registerHelper('formatDate', function(date) {
  return moment(date).format("Do MMM YYYY");
});

build();

function build() {
  Metalsmith(__dirname)
  .source('./content')
  .destination('./build')
  .use(drafts())
  .use(excerpts())
  .use(assets({
    source: 'styles',
    destination: 'styles'
  }))
  .use(each(extractDataFromFilename))
  .use(collections({
    articles: {
      pattern: 'articles/*/*.md',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(markdown({
    gfm: true
  }))
  .use(each(addPaths))
  .use(templates({
    engine: 'handlebars',
    directory: 'templates'
  }))
  .use(autoprefixer())
  .build(function(err, files) {
    if (err) throw err;
  });
}

function extractDataFromFilename(file, filename) {
  var ext = path.extname(filename);
  if (ext !== '.md') return;

  var segments = filename.split(path.sep);
  var container = segments[segments.length - 2];
  if (!container) return;

  var year = parseInt(container.substr(0, 4), 10);
  var month = parseInt(container.substr(4, 2), 10) - 1;
  var day = parseInt(container.substr(6, 2), 10);
  file.date = new Date(year, month, day);
  file.thumb = path.join(path.dirname(filename), 'thumb.jpg');
}

function addPaths(file, filename) {
  if (path.extname(filename) !== '.html') return;
  file.path = '/' + filename;
}
