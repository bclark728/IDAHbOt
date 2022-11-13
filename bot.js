console.log("Loading tokens...");
const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);

console.log("Starting IDAHbOt...");
const Mastodon = require('mastodon-api');
const M = new Mastodon({
  client_key: tokens.client_key,
  client_secret: tokens.client_secret,
  access_token: tokens.access_token,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
  api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
});

console.log("Sending test toot...");
const params = {
	status: 'Hello World!',
	spoiler_text: 'Bot jibberish',
	visibility: 'private'
};
M.post('statuses', params, (error, data) => {
	if(error) {
		console.error(error);
	}
	else {
		console.log(data);
	}
});
