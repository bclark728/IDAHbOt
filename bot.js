///
// bot.js - main bot
// 	copyright bryan clark (bryan.allan.clark@gmail.com) 2022
///

// process commandline arguments if any
if(process.argv.includes("-sim")) {
	console.log("***SIMULATED***");
}
else {
	console.log("***LIVE***");
}
if(process.argv.includes("-r")) {
	r_rate = process.argv[process.argv.indexOf("-r")+1];
}
else {
	r_rate = 15; //default refresh rate = 15 minutes
}
console.log(`Refresh rate: every ${r_rate} minutes`);
if(process.argv.includes("-l")) {
	l_time = process.argv[process.argv.indexOf("-l")+1];
}
else {
	l_time = r_rate; //lookback window defaults to refresh rate
}
console.log(`Lookback period: ${l_time} minutes`);

//create scheduler
const schedule = require('node-schedule');
const delay_time = 1000*60*l_time; 
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, +r_rate); 

//load mastodon, twitter and rss modules
const toot = require('./mastodon.js');
const extractor = require('./twitter.js');
const [parse, NewsFeed] = require('./rss.js');

//define filter strings
const botFilter = "_IDAHbOt";
const newsFilter = botFilter + "_news";
const twitterFilter = botFilter + "_twitter";

//define searches
const feeds = [ new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/news/local/stories", [],[]),
                new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/opinion/stories", [],[]),
                new NewsFeed("Idaho Reports", "https://blog.idahoreports.idahoptv.org/feed/", [], []),
                new NewsFeed("Idaho Press", "https://www.idahopress.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	        new NewsFeed("KTVB", "https://www.ktvb.com/feeds/syndication/rss/news/local", [], []),
	        new NewsFeed("Boise State Public Radio", "https://www.boisestatepublicradio.org/news.rss", [], []),
	        new NewsFeed("Post Register", "http://www.postregister.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	        new NewsFeed("Lewiston Tribune", "http://lmtribune.com/search/?f=rss&t=article&c=northwest&l=50&s=start_time&sd=desc", [], []),
	        new NewsFeed("Lewiston Tribune", "http://lmtribune.com/search/?f=rss&t=article&c=opinion&l=50&s=start_time&sd=desc", [], []),
	        new NewsFeed("Capital Sun", "https://idahocapitalsun.com/feed/", [], [])
              ]; 
const twitterSearches = ['#idleg #idpol', '#idpol -#idleg', '#idleg -#idpol'];

//start daemon
console.log(`Starting daemon (${new Date().toLocaleString("en-US", {timeZone: "America/Denver"})})`);
const botJob = schedule.scheduleJob(rule, function() {
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
