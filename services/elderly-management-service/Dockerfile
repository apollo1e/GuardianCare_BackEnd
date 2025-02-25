# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create a .env file from example if it doesn't exist
RUN cp -n .env.example .env || true

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "src/app.js"]
