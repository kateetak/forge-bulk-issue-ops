#!/bin/bash

# Run this script from the root of the project directory: ./scripts/build-and-deploy.sh

# Pre-requisites:
# Install yarn by running `npm install --global yarn`

# Default environment is "development" if no argument is provided
ENV=${1:-development}

echo "Building static/spa..."
cd static/spa
yarn
yarn build

cd ../..

echo "Deploying to $ENV (forge deploy -e $ENV)"
forge deploy -e $ENV
