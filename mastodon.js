const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);

const Mastodon = require('mastodon-api');
const M = new Mastodon({
  client_key: tokens.client_key,
  client_secret: tokens.client_secret,
  access_token: tokens.access_token,
  timeout_ms: 60*1000,
  api_url: 'https://botsin.space/api/v1/'
});

function toot(message, spoiler='bot jibberish') {
        if(process.argv[2] == "-sim") {
                console.log(`[${spoiler}]\n`+
                            `${message}\n`);
                return;
        }
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
                        console.log(`Toot: ${spoiler} (${new Date().toLocaleString("en-US", {timeZone: "America/Denver"})})`);
                        fs.appendFileSync("toots.log",(
                                `Toot: ${data.id} - ${data.created_at}\n`));
                }
        });
}

module.exports = toot;

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
*/
