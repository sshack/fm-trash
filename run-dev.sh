#!/bin/bash

# Update corepack
npm install -g corepack@latest

# Enable corepack
corepack enable

# Install project version
corepack install

# Run next.js dev
pnpm dev
