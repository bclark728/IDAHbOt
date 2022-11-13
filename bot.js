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
const feeds = {
	"Idaho Statesman":"https://feeds.mcclatchy.com/idahostatesman/stories",
	"Idaho Reports":"https://blog.idahoreports.idahoptv.org/feed/"
}
const parse = async url => {
    const feed = await new RSSParser().parseURL(url);
    console.log(feed.title);
    //toot(`${feed.items[0].title}\n${feed.items[0].link}`, "Idaho Statesman");
    feed.items.forEach(item => {
        console.log(`${item.title} - ${item.link}\n`);
    });
};
for(let k in feeds) {
	console.log(k, feeds[k]);
	parse(feeds[k]);
}
//parse(feedUrl);
