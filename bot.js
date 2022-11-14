console.log("Loading tokens...");
const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);
console.log ("(success)");

const Mastodon = require('mastodon-api');
const M = new Mastodon({
  client_key: tokens.client_key,
  client_secret: tokens.client_secret,
  access_token: tokens.access_token,
  timeout_ms: 60*1000,  
  api_url: 'https://botsin.space/api/v1/'
});

function toot(message, spoiler='bot jibberish') {
	const params = {
		status: message,
		spoiler_text: spoiler,
		visibility: 'private'
	};
	M.post('statuses', params, (error, data) => {
		if(error) {
			console.error(error);
		}
		else {
			fs.appendFileSync("toots.log",(`Toot: ${data.id} - ${data.created_at}\n`));
		}
	});
}

/*
// Listener
console.log("Starting listener...");
const listener = M.stream('streaming/user')
listener.on('message', msg => {
	fs.writeFileSync(`${new Date().getTime()}.json`,JSON.stringify(msg));
	console.log(msg);
});
listener.on('error', err => console.log(err));
console.log("(listening)");

// Console input
console.log("\n\n\n-----Starting manual input-----");
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('>', function (command) {
	toot(command);
});
rl.on('close', function () {
  console.log('\nBYE BYE !!!');
  process.exit(0);
});
*/

const RSSParser = require("rss-parser");
const parse = async (feed, lookback) => {
	const parsed = await new RSSParser().parseURL(feed.url);
	parsed.items.forEach(item => {
		if(new Date(item.isoDate) > new Date(lookback)) {
			let excluded = false;
			for(k in feed.urlExcludes) {
				if(feed.urlExcludes[k].test(item.link)){
					excluded = true;
				}
			}
			for(k in feed.titleExcludes) {
				if(feed.titleExcludes[k].test(item.title)){
					excluded = true;
				}
			}
			if(!excluded) {
				console.log(`TOOT: ${item.link}\n`);
				toot(`${item.title}\n${item.link}`, `Idaho News(${feed.name})`);
			}
			else {
				//console.log(`EXCLUDED: ${item.link}\n`);
			}
		}
		else {
			//console.log(`rejected: ${item.title} date: ${item.isoDate}`);
		}
	});
};

function NewsFeed(name, url, urlExcludes=[], titleExcludes=[]) {
	this.name = name;
	this.url = url;
	this.urlExcludes = urlExcludes;
	this.titleExcludes = titleExcludes;
}
const feeds = [new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/stories", [new RegExp('/nation-world/')],[]),
               //new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/sections/news/local/stories", [],[]),
               new NewsFeed("Idaho Reports", "https://blog.idahoreports.idahoptv.org/feed/", [], []),
               new NewsFeed("Idaho Press", "https://www.idahopress.com/search/?f=rss&t=article&c=news/local&l=50&s=start_time&sd=desc", [], []),
	       new NewsFeed("KTVB", "https://www.ktvb.com/feeds/syndication/rss/news/local", [], [])
              ];

const schedule = require('node-schedule');
const delay_time = 1000*60*15; // 15 minute refresh cycle
//const delay_time = 1000*60*15000; // for muted testing
console.log("Starting rss monitor");
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 15); // 15 minute refresh cycle
//rule.minute = new schedule.Range(0, 59, 1); // for muted testing
const job = schedule.scheduleJob(rule, function(){
	console.log(`Updating rss feeds (${new Date()})`);
	const lookback = new Date() - delay_time;
	for(k in feeds) {
		parse(feeds[k], lookback);
	}
});
