//holds most of the main website routes except auth
'use strict';
var express = require('express');
var router = express.Router();
var twitterSearch = require('../logic/twitterSearch');
//q create a variable for GoTo meeting var gotoMeeting = require('/gotoMeeting')
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Home'
  });
});

router.post('/search', function(req, res) {
  twitterSearch(req.body.search, function(data) {
    res.json(data);
  });
});

router.get('/data', function(req, res) {
  res.json(require('diskdb')
  	        .connect('db', ['sentiments'])
  	        .sentiments.find());
});

//*q adding new file
router.get('./meeting', function(req, res) {
  res.render('meeting.html', {
    title: 'Meeting'
  });
});
//end
module.exports = router;
