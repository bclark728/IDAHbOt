#!/bin/bash

echo "installing utilities"

apt update
apt install nodejs
apt install nmp

npm install --save mastodon-api
npm install --save rss-parser
npm install --save node-schedule
npm install --save twitter-api-v2

echo "***IMPORTANT*** you must now create tokens.json with credentials in format"
echo "{"
echo '  "client_key": ...,'
echo '  "client_secret": ...,'
echo '  "access_token": ...'
echo "}"  
