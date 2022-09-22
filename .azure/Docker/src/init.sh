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
        list=( "$(python3 -c 'exec("""\nimport sys, json\no=[]\nc=json.load(open("'"$APP_WEB_CUSTOMLOGINS"'","r"))\n\nfor k in c:\n  for i in c[k]:\n    if (c[k][i].count("/") ):\n      b=c[k][i].split("/")[0]\n      if b not in o:\n        o.append(b)\n\nprint(" ".join(map(str, o)))\n""")')" )
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