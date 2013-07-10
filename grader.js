#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
// rest to download
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
/* this! */
var URL_DEFAULT = "http://arcane-atoll-2085.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(val)
{
    return val.toString();
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var getChecksResult = function(html, checks)
{
  console.log('Checking HTML content against checks.');
  var checkJson = checkHtmlFile(html, checks);
  console.log('Converting check results from JSON to a string.');
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log('Echoing the results:');
  console.log(outJson);
}

if(require.main == module) {
    magic
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'url to check', clone(assertUrlExists), URL_DEFAULT)
        .parse(process.argv);

if (magic.url)
{
  console.log('URL arg exists. Going to read its contents.');
  restler.get(magic.url).on('complete', function(result)
  {
    if (result instanceof Error)
      {
        console.log('URL fails to load.')
        process.exit(1);
      }
      var htmlContent = result;
      console.log('Contents read from ' + magic.url);
      getChecksResult(htmlContent, magic.checks);
    });
  }
  else if (magic.file)
  {
    console.log('File arg exists. Going to read its contents.');
    var htmlContent = fs.readFileSync(magic.file);
    console.log('File contents read:\n' + htmlContent);
    getChecksResult(htmlContent, magic.checks);
  }
}
else {
  exports.checkHtmlFile = checkHtmlFile;
}
