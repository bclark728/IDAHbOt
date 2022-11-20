if(process.argv[2] == "-sim") {
	console.log("***SIMULATED***");
}
const toot = require('./mastodon.js');
const botFilter = "_IDAHbOt";
const newsFilter = botFilter + "_news";
const twitterFilter = botFilter + "_twitter";

const [parse, NewsFeed] = require('./rss.js');
const feeds = [ new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/news/local/stories", [],[]),
               new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/opinion/stories", [],[]),
               new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/sports/stories", [],[]),
               new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/outdoors/stories", [],[]),
               new NewsFeed("Idaho Reports", "https://blog.idahoreports.idahoptv.org/feed/", [], []),
               new NewsFeed("Idaho Press", "https://www.idahopress.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("KTVB", "https://www.ktvb.com/feeds/syndication/rss/news/local", [], []),
	       new NewsFeed("Boise State Public Radio", "https://www.boisestatepublicradio.org/news.rss", [], []),
	       new NewsFeed("Post Register", "http://www.postregister.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("Lewiston Tribune", "http://lmtribune.com/search/?f=rss&t=article&c=northwest&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("Lewiston Tribune", "http://lmtribune.com/search/?f=rss&t=article&c=opinion&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("Lewiston Tribune", "http://lmtribune.com/search/?f=rss&t=article&c=outdoors&l=50&s=start_time&sd=desc", [], []),
	       //new NewsFeed("Times-News", "http://magicvalley.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("Capital Sun", "https://idahocapitalsun.com/feed/", [], [])
              ]; // TODO: Ed News, CDA Press, Bonner bee, east idaho news

const schedule = require('node-schedule');
const delay_time = 1000*60*15; // 15 minute refresh cycle
//const delay_time = 1000*60*120; // for muted testing
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 15); // 15 minute refresh cycle
//rule.minute = new schedule.Range(0, 59, 1); // for muted testing
const extractor = require('./twitter.js');
const twitterSearches = ['#idleg #idpol', '#idpol -#idleg', '#idleg -#idpol'];
const twitterJob = schedule.scheduleJob(rule, function() {
	const lookback = new Date() - (delay_time);
	for(k in feeds) {
		parse(feeds[k], lookback);
	}
	for(srch of twitterSearches) {
		extractor((t, s) => {
			const handle = /(@.*)@twitter.com/.exec(t)[1];
			toot(t + `\n ${twitterFilter}`, `${s.replace(/-#[^\s]*/g,'').replace(/\s\s/g,' ')}(${handle})`);
		}, srch, 100, lookback);
	}

});
