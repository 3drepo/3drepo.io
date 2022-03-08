set NODE_ENV=%1
set NODE_CONFIG_DIR=config
cd backend
yarn run-migration %2
