# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install Yarn using the Alpine package manager
RUN apk add --no-cache yarn

# Copy package.json and yarn.lock from the channel-service directory
COPY package.json yarn.lock* ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code from channel-service
COPY . .

# Expose the port the app runs on
EXPOSE 3005

# Set environment to development
ENV NODE_ENV=development

# Command to run the service
CMD ["yarn", "start"]
