#/bin/bash

while true; do
    echo "This will destroy everything and load a copy of test data in your database and purge everything in your queue."
    read -p "Are you sure to proceed? [DELETE] " yn
    case $yn in
        DELETE ) 

		chmod 755 ../scripts/gettestdb.js && \
		host=$(node ../scripts/gettestdb.js) && \
		echo "Using host: $host" && \
		mongo "$host"/admin ./test/cleanup/db.js && \
		NODE_CONFIG_DIR=../config NODE_ENV=test node ./test/cleanup/queue.js

		echo "Current Directory $PWD"
		if [ ! -d "../../submodules/tests/backend/dump"  ]; then
			mongorestore --host="$host" "../submodules/tests/backend/dump"
			exit 0; 
		fi
		
		echo "ERROR: Database test dump does not exist!"
		exit 0; 

		break;;
        [Nn]* ) exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done


