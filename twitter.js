const {TwitterApi} = require('twitter-api-v2');

const client = new TwitterApi({
        appKey: "0mWelvgBl1Mm9SHZgqsT9Mfpw",
        appSecret: "npEDg7AowdGZvFYK2XAbHAhgrDsUfpssFyPJaFbMh7LEtytCyV",
        accessToken: "1117234123-Gg15jU1q4ZBEsiXaW3BB3ukjZ93eMBVNUPyUX05",
        accessSecret: "gZCGDyLDbLYGkETC48clWNljBGELvvWBoiUrNMfXquTrP"
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

async function extractTweets(callback, searchString, maxResults=10, timeCutoff=0, excludeRTs=true) {
	//let tweets = await client.v2.search(searchString, { expansions: ['author_id'], 'user.fields': ['username', 'url'], 'tweet.fields': ['created_at']});
	const paginator = await client.v2.search(searchString, { expansions: ['author_id'], 'user.fields': ['username', 'url'], 'tweet.fields': ['created_at']});
	let results = 0;
	RESLOOP:
	//while(results < maxResults) {
	for await(const tweet of paginator) {
		if(new Date(tweet.created_at) < timeCutoff) {
			break RESLOOP;
		}
		if(!(excludeRTs & RegExp("^RT.*").test(tweet.text))) {
				callback(`${findScreenName(tweet.author_id, paginator.includes.users)} `+
				         `(@${findHandle(tweet.author_id, paginator.includes.users)}@twitter.com)\n`+
				         `${tweet.text}\n`+
				         `🐦🔗 https://twitter.com/${findHandle(tweet.author_id, paginator.includes.users)}/status/${tweet.id}`);
		}
		else {
		}
		results++;
		if(results >= maxResults){
			break RESLOOP;
		}
	}
}

//extractTweets(console.error, "#idpol", 50, new Date() - 1000*60*15);
module.exports = extractTweets;
