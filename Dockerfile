# Dockerfile
# This file contains the commands to create
# a docker image of the app.

# Start from NodeJS 12 Image on Github
FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY ./build .

# Install dependencies
RUN npm install

# Expose the app's port outside the container
EXPOSE 3000

# Run the app
CMD [ "node", "index.js" ]