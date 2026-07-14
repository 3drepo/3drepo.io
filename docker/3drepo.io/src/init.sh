#!/bin/bash
set -e

if [ "$1" = 'web' ]; then

    if [ "$APP_EFS_ROOT" = '' ]; then
        export APP_EFS_ROOT=/efs
    fi

    if [ ! -d "$APP_EFS_ROOT/models" ]; then
        chmod -R 2774 "$APP_EFS_ROOT" 
        chown -R "$NODE_UID":"$NODE_GID" "$APP_EFS_ROOT" 
    fi

    umask 2
    cd /home/node/3drepo.io
    exec gosu "$NODE_USERNAME" ./run/run_app "$NODE_ENV"
fi

exec "$@"