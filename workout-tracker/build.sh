#!/bin/bash

# Navigate to the workout-tracker directory
cd workout-tracker

# Install dependencies and run the build
npm install
npm run build

# Deploy using wrangler
npx wrangler deploy
