# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM ubuntu:focal AS python-dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes python3 python3-setuptools python3-pip
ADD requirements.txt /tmp/requirements.txt
RUN pip3 config set global.disable-pip-version-check true
RUN --mount=type=cache,target=/root/.cache/pip pip3 install --user --requirement /tmp/requirements.txt

# Build stage: Install yarn dependencies
# ===
FROM node:18 AS yarn-dependencies
WORKDIR /srv
ADD package.json yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install


# Build stage: React app
# ===
FROM yarn-dependencies AS frontend-build
ADD client client
ADD tsconfig.json tsconfig.json
ADD tsconfig.node.json tsconfig.node.json
ADD vite.config.ts vite.config.ts

RUN yarn run build


# Build the production image
# ===
FROM ubuntu:focal

# Install python and import python dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes python3 python3-setuptools ca-certificates libsodium-dev python3-lib2to3
COPY --from=python-dependencies /root/.local/lib/python3.8/site-packages /root/.local/lib/python3.8/site-packages
COPY --from=python-dependencies /root/.local/bin /root/.local/bin
WORKDIR /srv
COPY . .
ENV PATH="/root/.local/bin:${PATH}"
RUN rm -rf package.json yarn.lock .babelrc webpack.config.js requirements.txt
COPY --from=frontend-build /srv/static static

# Set git commit ID
ARG BUILD_ID
ENV TALISKER_REVISION_ID "${BUILD_ID}"

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
