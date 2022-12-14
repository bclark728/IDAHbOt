///
// mastodon.js - module for interfacing with mastodon
// 	copyright bryan clark (bryan.allan.clark@gmail.com) 2022
///

//read secret tokens from tokens.json file
const fs = require('fs');
const file_name = "tokens.json";
let rawdata = fs.readFileSync(file_name);
let tokens = JSON.parse(rawdata);

//create client
const Mastodon = require('mastodon-api');
const M = new Mastodon({
  client_key: tokens.client_key,
  client_secret: tokens.client_secret,
  access_token: tokens.access_token,
  timeout_ms: 60*1000,
  api_url: 'https://botsin.space/api/v1/'
});

//main function to send toots
function toot(message, spoiler) {
        if(process.argv.includes("-sim")) { //if -sim, don't toot. send message to console.log
                console.log(`[${spoiler}]\n`+
                            `${message}\n`);
                return;
        }
        const params = {
                status: message,
                spoiler_text: spoiler,
                visibility: 'private' //all bot messages currently private
        };
        M.post('statuses', params, (error, data) => { 
                if(error) {
                        console.error(error);
                }
                else {
                        console.log(`Toot: ${spoiler} (${new Date().toLocaleString("en-US", {timeZone: "America/Denver"})})`); //create log of toots
                        fs.appendFileSync("toots.log",(
                                `Toot: ${data.id} - ${data.created_at}\n`));
                }
        });
}

module.exports = toot;

/* save for possible future use
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
