# Use an official Node.js runtime as a parent image
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code including .env
COPY . .

# Debug: Print environment variables from .env file
RUN echo "Verifying .env file and environment variables:" && \
    echo "Contents of directory:" && ls -la && \
    echo "\nContents of .env file:" && cat .env && \
    echo "\nEnvironment variables:" && printenv | grep REACT_APP

# Build the static files
RUN npm run build

# Use an official Nginx image to serve the static files
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]