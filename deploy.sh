#!/bin/bash
git reset --hard origin/master
git pull origin master

rm -rf node_modules
rm -rf dist

npm install

pm2 startOrRestart pm2.json