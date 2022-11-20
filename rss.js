///
// rss.js - module to find rss feed updates
// 	copyright bryan clark (bryan.allan.clark@gmail.com) 2022
///


const RSSParser = require("rss-parser");
const toot = require('./mastodon.js');
const newsFilter = '_IDAHbOt_news';

// main function for parsing an rss feed. takes a News Feed object to define the feed
// and a prior date cutoff for new feeds. exits when it exceeds lookback windwo 
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
                                toot(`${item.title}\n${item.link}\n${newsFilter}`, `Idaho News(${feed.name})`);
                        }
                }
        });
};

// define NewsFeed object type
function NewsFeed(name, url, urlExcludes=[], titleExcludes=[]) {
        this.name = name;
        this.url = url;
        this.urlExcludes = urlExcludes;
        this.titleExcludes = titleExcludes;
}

module.exports = [parse, NewsFeed];
