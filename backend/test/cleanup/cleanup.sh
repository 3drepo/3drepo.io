#/bin/bash

chmod 755 ../scripts/gettestdb.js && \
host=$(node ../scripts/gettestdb.js) && \
echo "Using host: $host" && \
chmod 755 ./test/cleanup/prompt.sh && \    
./test/cleanup/prompt.sh && \ 
mongo "$host"/admin ./test/cleanup/db.js && \
NODE_CONFIG_DIR=../config NODE_ENV=test node ./test/cleanup/queue.js && \
mongorestore --host="$host" ../submodules/tests/backend/dump