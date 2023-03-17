ARG REBUILD_DATE=unknown
FROM node:18 as base

WORKDIR /home/node/3drepo.io/backend
COPY ./backend/package.json ./package.json
COPY ./backend/yarn.lock ./yarn.lock
RUN yarn install --network-timeout 500000 --immutable --immutable-cache --check-cache
COPY ./backend/ ./backend/

WORKDIR /home/node/3drepo.io/frontend
COPY ./frontend/package.json ./package.json
COPY ./frontend/yarn.lock ./yarn.lock
RUN yarn install --network-timeout 500000 --immutable --immutable-cache --check-cache

FROM node:18 as frontend-base
WORKDIR /home/node/3drepo.io/
COPY ./resources ./resources

WORKDIR /home/node/3drepo.io/frontend
COPY --from=base /home/node/3drepo.io/frontend/node_modules ./node_modules
COPY ./frontend/ . 
RUN yarn build

FROM node:18 as deploy

RUN apt-get update && apt-get install -y \
        gosu \
        less \
        && rm -rf /var/lib/apt/lists/*

ARG NODE_USERNAME=node
ENV NODE_USERNAME ${NODE_USERNAME}
ARG NODE_GROUP=bouncer
ENV NODE_GROUP ${NODE_GROUP}
ARG NODE_UID=1101
ARG NODE_GID=1102       
RUN if [ ${NODE_USERNAME} != "root" ] \
    && [ ${NODE_GROUP} != "root" ] \
    && [ ${NODE_UID} -ne 0 ] \
    && [ ${NODE_GID} -ne 0 ]; then \
      groupadd ${NODE_GROUP} -g ${NODE_GID} && \
      usermod -u ${NODE_UID} ${NODE_USERNAME} && \
      usermod -G ${NODE_GID} ${NODE_USERNAME} ; \
    fi

WORKDIR /home/node/3drepo.io/
COPY --chown=root:node --from=base /home/node/3drepo.io/backend ./backend
COPY --chown=root:node --from=frontend-base /home/node/3drepo.io/public ./public
COPY --chown=root:node ./config ./config
COPY --chown=root:node ./resources ./resources
COPY --chown=root:node ./run ./run

ARG NODE_ENV=local
ENV NODE_ENV ${NODE_ENV:-"test"}
ENV NODE_CONFIG_DIR='./config'
EXPOSE 8080 3000

COPY .azure/Docker/src/init.sh /usr/local/bin/start
COPY .azure/Docker/src/getCustomLogins.py /usr/local/bin/getCustomLogins.py
RUN chmod +x /usr/local/bin/start

WORKDIR /home/node/3drepo.io/
ENTRYPOINT [ "start" ]
CMD ["web"]