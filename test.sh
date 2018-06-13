#/bin/bash

if [ $1 = "backend" ]; then
    cd ./backend
    yarn run test
else
    NODE_ENV=test NODE_CONFIG_DIR='./config' node "./backend/3drepo.js" & sleep 5 
    cd ./frontend
    yarn run wdm:update
    yarn run wdm:start > /dev/null 2>&1 &
    yarn run e2e
fi