# Build:
# docker build -t meanjs/mean .
#
# Run:
# docker run -it meanjs/mean
#
# Compose:
# docker-compose up -d

FROM ubuntu:18.04
LABEL maintainer=MEAN.JS

# 80 = HTTP, 443 = HTTPS, 3000 = MEAN.JS server, 35729 = livereload
EXPOSE 80 443 3000 35729

# Set development environment as default
ENV NODE_ENV development

# Install Utilities
RUN apt-get update -q  \
 && apt-get install -yqq curl \
 wget \
 aptitude \
 htop \
 vim \
 git \
 traceroute \
 dnsutils \
 curl \
 ssh \
 tree \
 tcpdump \
 nano \
 psmisc \
 gcc \
 make \
 build-essential \
 libfreetype6 \
 libfontconfig \
 libkrb5-dev \
 ruby \
 sudo \
 apt-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install dumb-init
RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb
RUN dpkg -i dumb-init_*.deb

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#COPY phantom /opt/mean.js/node_modules

# Install MEAN.JS Prerequisites
RUN npm install --quiet -g gulp yo mocha karma-cli pm2 gulp-if yarn && npm cache verify


RUN mkdir -p /opt/mean.js/public
# Create relative symlink in public/lib that points to @bower_components.
RUN ln -s ../node_modules/@bower_components /opt/mean.js/public/lib
WORKDIR /opt/mean.js

# Copies the local package.json file to the container
# and utilities docker container cache to not needing to rebuild
# and install node_modules/ everytime we build the docker, but only
# when the local package.json file changes.
# Install npm packages
COPY package.json /opt/mean.js/package.json
# RUN yarn install --silent --non-interactive && yarn cache clean
RUN yarn install --silent --non-interactive && yarn check --integrity

COPY . /opt/mean.js

# Run MEAN.JS server
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
