# Dockerfile for image-processing-worker
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (if needed)
EXPOSE 8001

# Start the worker
CMD ["npm", "run", "start"]
