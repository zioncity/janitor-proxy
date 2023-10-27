#!/bin/bash
git reset --hard origin/main
git pull origin main

rm -rf node_modules
rm -rf dist

npm install

pm2 startOrRestart pm2.json