ARG REBUILD_DATE=unknown
FROM node:10 as builder
COPY . /home/node/3drepo.io
RUN cd /home/node/3drepo.io/backend && \
        yarn install --network-timeout 100000 && \
        cd ../frontend  && \
        yarn install --network-timeout 100000 && \ 
        yarn build

FROM node:10 as deploy

RUN apt-get update && apt-get install -y \
        gosu \
        && rm -rf /var/lib/apt/lists/*

ARG NODE_USERNAME=node
ENV NODE_USERNAME ${NODE_USERNAME}
ARG NODE_GROUP=bouncer
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
COPY --chown=node:node --from=builder /home/node/3drepo.io/ /home/node/3drepo.io/
ARG NODE_ENV=local
ENV NODE_ENV ${NODE_ENV:-"production"}
ENV NODE_CONFIG_DIR='./config'
EXPOSE 8080 3000

COPY .azure/Docker/src/init.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh ; ln -s /usr/local/bin/start.sh /usr/local/bin/start

WORKDIR /home/node/3drepo.io/
ENTRYPOINT [ "start" ]
CMD ["web"]