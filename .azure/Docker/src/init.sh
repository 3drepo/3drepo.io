#!/bin/bash
set -e

if [ "$1" = 'web' ]; then
    mkdir -p /home/node/3drepo.io/config/maintenance/
    mkdir -p /home/node/3drepo.io/config/local/
    mkdir -p /home/node/3drepo.io/config/production/

    if [ "$APP_EFS_ROOT" = '' ]; then
        export APP_EFS_ROOT=/efs
    fi

    if [ ! -d "$APP_EFS_ROOT/models" ]; then
        chmod -R 2774 "$APP_EFS_ROOT" 
        chown -R "$NODE_UID":"$NODE_GID" "$APP_EFS_ROOT" 
    fi

    if [ ! "$APP_WEB_CUSTOMLOGINS" = '' ]; then
        list=( $( python3 /usr/local/bin/getCustomLogins.py $APP_WEB_CUSTOMLOGINS ) )
        for l in "${list[@]}"
        do
            mkdir -p /home/node/3drepo.io/public/"$l"
            chown node:node /home/node/3drepo.io/public/"$l"
        done
    fi

    umask 2
    cd /home/node/3drepo.io
    exec gosu "$NODE_USERNAME" ./run/run_app "$NODE_ENV"
fi

exec "$@"