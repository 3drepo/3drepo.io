#/bin/bash

chmod 755 ./scripts/gettestdb.js && \
host=$(node ./scripts/gettestdb.js) && \
echo "Using host: $host" && \
chmod 755 ./backend/test/cleanup/prompt.sh && \    
./backend/test/cleanup/prompt.sh && \ 
mongo "$host"/admin ./backend/test/cleanup/db.js && \
NODE_ENV=test node ./backend/test/cleanup/queue.js && \
mongorestore --host="$host" ./submodules/tests/backend/dump