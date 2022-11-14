console.log("Loading tokens...");
const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);
console.log ("(success)");

console.log("Starting IDAHbOt...");
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

console.log("Starting RSS reader...");
const RSSParser = require("rss-parser");
function NewsFeed(name, url, last_update=0) {
	this.name = name;
	this.url = url;
}
const parse = async (feed, lookback) => {
	const parsed = await new RSSParser().parseURL(feed.url);
	//toot(`${feed.items[0].title}\n${feed.items[0].link}`, "Idaho Statesman");
	parsed.items.forEach(item => {
		//console.log(`${item.link} }Date: ${new Date(item.isoDate)} Lookback: ${new Date(lookback)} Newer: ${new Date(item.isoDate) > new Date(lookback)}}`);
		if(new Date(item.isoDate) > new Date(lookback)) {
			console.log(`TOOT: ${item.title} ${item.link} SPOILER: ${feed.name}`);
		}
		else {
			//console.log(`rejected: ${item.title} date: ${item.isoDate}`);
			//console.log(`rejected: ${item.isoDate}`);
		}
	});
};

const feeds = [new NewsFeed("Idaho Statesman", "https://feeds.mcclatchy.com/idahostatesman/stories"),
               new NewsFeed("Idaho Reports", "https://blog.idahoreports.idahoptv.org/feed/")];

const schedule = require('node-schedule');
const delay_time = 1000*60*15; // 15 minute refresh cycle
console.log("Starting scheduler");
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 15);
const job = schedule.scheduleJob(rule, function(){
	console.log(`Updating rss feeds (${new Date()})`);
	const lookback = new Date() - delay_time;
	for(k in feeds) {
		parse(feeds[k], lookback);
	}
});
