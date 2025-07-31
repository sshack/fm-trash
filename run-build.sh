#!/bin/bash

# Build the docker image for linux/amd64
docker build . -t gondola-admin-fe --platform linux/amd64

# Run the built image locally
# docker run gondola-admin-fe
