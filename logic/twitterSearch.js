//includes
var util = require('util'),
  twitter = require('twitter'),
  sentimentAnalysis = require('./sentimentAnalysis'),
  db = require('diskdb');

db = db.connect('db', ['sentiments']);

//config
var config = {
  consumer_key: 'Uj94w8vaKwUXq03mMBVuTrc2o',
  consumer_secret: 'YnyVs9VBKUlhtzHuZtVRNHyJM0xgMTFcW3nflRijuVumGIC2fE',
  access_token_key: '247650633-PxbJSaiQJuk1qkGB97MrDwlWRjXDbZi7WBZSDcoH',
  access_token_secret: 'cep3hCOULWBeFcTsZ8RN6qVK6aPlfSl20Ef10hFICVbhq'
}

module.exports = function(text, callback) {
  var twitterClient = new twitter(config);
  var response = [], dbData = []; // to store the tweets and sentiment
  twitterClient.search(text, function(data) {
    for (var i = 0; i < data.statuses.length; i++) {
      var resp = {};
      resp.tweet = data.statuses[i];
      resp.sentiment = sentimentAnalysis(data.statuses[i].text);
      dbData.push({
        "tweet" : resp.tweet.text,
        "score" : resp.sentiment.score
      });
      response.push(resp);
    };
    db.sentiments.save(dbData);
    callback(response);
  });
}
