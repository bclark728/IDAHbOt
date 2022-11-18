const {TwitterApi} = require('twitter-api-v2');

const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);

const client = new TwitterApi({
        appKey: tokens.appKey,
        appSecret: tokens.appSecret,
        accessToken: tokens.accessToken,
        accessSecret: tokens.accessSecret
});

function findScreenName(id, users) {
	for(let user of users) {
		if(user.id == id) {
			return user.name;
		}
	}
	return "<ERROR>";
}

function findHandle(id, users) {
	for(let user of users) {
		if(user.id == id) {
			return user.username;
		}
	}
	return "<ERROR>";
}

const spammers = ['miracleguppy', 'Idpol2', '@IdpolLopdi'];
function isSpammer(handle) {
	for(test of spammers) {
		if(handle==test) {
			//console.log("blocked @" + handle);
			return true;
		}
	}
	return false;
}

async function extractTweets(callback, searchString, maxResults=10, timeCutoff=0, excludeRTs=true) {
	const paginator = await client.v2.search(searchString, { expansions: ['author_id'], 'user.fields': ['username', 'url'], 'tweet.fields': ['created_at']});
	const pagsync = await paginator.fetchLast(maxResults);
	let results = 0;
	let ids=[];
	for(tweet of pagsync) {
		if(new Date(tweet.created_at) < timeCutoff) {
			break;
		}
		if(!(excludeRTs & RegExp("^RT.*").test(tweet.text)) & //exclude retweets if flag set
		   !(isSpammer(findHandle(tweet.author_id, paginator.includes.users)) & //exclude known list of spammers
		   !(ids.includes(tweet.id)))) { //exclude duplicates
			ids.push(tweet.id);
			callback(`${findScreenName(tweet.author_id, paginator.includes.users)} `+
				 `(@${findHandle(tweet.author_id, paginator.includes.users)}@twitter.com)\n`+
				 `${tweet.text}\n`+
				 `🐦🔗 https://twitter.com/${findHandle(tweet.author_id, paginator.includes.users)}/status/${tweet.id}`, searchString);
		}
		else {
			if(ids.includes(tweet.id)) {
				console.log("excluded duplicate" + tweet.id);
			}
		}
		results++;
		if(results >= maxResults){
			break;
		}
	}
}

module.exports = extractTweets;
