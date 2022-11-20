if(process.argv.includes("-sim")) {
	console.log("***SIMULATED***");
}

if(process.argv.includes("-r")) {
	r_rate = process.argv[process.argv.indexOf("-r")+1];
}
else {
	r_rate = 15;
}
console.log(`Refresh rate: every ${r_rate} minutes`);

if(process.argv.includes("-l")) {
	l_time = process.argv[process.argv.indexOf("-l")+1];
}
else {
	l_time = r_rate;
}
console.log(`Lookback period: ${l_time} minutes`);


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
const delay_time = 1000*60*l_time; 
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, +r_rate); 
console.log(rule.minute);
const extractor = require('./twitter.js');
const twitterSearches = ['#idleg #idpol', '#idpol -#idleg', '#idleg -#idpol'];
const botJob = schedule.scheduleJob(rule, function() {
	console.log("REFRESH");
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
