#!/bin/bash
node --harmony ./server/server.js &
echo $! > server/server.pid
sleep 1