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

async function extractTweets(searchString, maxResults=10, excludeRTs=true) {
	let tweets = await client.v2.search(searchString, { expansions: ['author_id'], 'user.fields': ['username', 'url']});
	let results = 0;
	RESLOOP:
	while(results < maxResults) {
		//console.log(tweets.includes.result);
		for(k in tweets.includes.result.data) {
			//console.log(tweets.includes.result.data[k]);
			if(!(excludeRTs & RegExp("^RT.*").test(tweets.includes.result.data[k].text))) {
				console.log(`${findScreenName(tweets.includes.result.data[k].author_id, tweets.includes.users)} `+
				            `(@${findHandle(tweets.includes.result.data[k].author_id, tweets.includes.users)}@twitter.com)\n`+
				            `${tweets.includes.result.data[k].text}\n`+
					    `🐦🔗 https://twitter.com/${findHandle(tweets.includes.result.data[k].author_id, tweets.includes.users)}/status/${tweets.includes.result.data[k].id}`);
				console.log("\n\n");
				results++;
				if(results >= maxResults){
					break RESLOOP;
				}
			}
		}
		tweets = await tweets.fetchNext();
	}
}

extractTweets("#idpol", 10);
