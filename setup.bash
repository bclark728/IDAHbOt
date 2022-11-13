#!/bin/bash

echo "installing utilities"

apt update
apt install nodejs
apt install nmp

npm install --save mastodon-api
