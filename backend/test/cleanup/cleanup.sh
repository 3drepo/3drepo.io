#/bin/bash

while true; do
    echo "This will destroy everything and load a copy of test data in your database and purge everything in your queue."
    read -p "Are you sure to proceed? [DELETE/n] " yn
    case $yn in
        DELETE ) 

		chmod 755 ../scripts/gettestdb.js && \
		host=$(node ../scripts/gettestdb.js) && \
		echo "Using host: $host" && \
		mongo "$host"/admin ./test/cleanup/db.js && \
		NODE_CONFIG_DIR=../config NODE_ENV=test node ./test/cleanup/queue.js && \
		mongorestore --host="$host" ../submodules/tests/backend/dump

		exit 0; 

		break;;
        [Nn]* ) exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done


