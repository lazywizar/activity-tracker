# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code including .env
COPY . .

# Create directory for env file
RUN mkdir -p /app/config

# Load environment variables from .env file
RUN if [ -f .env ]; then \
    echo "#!/bin/sh" > /app/config/env.sh && \
    while IFS='=' read -r key value; do \
      # Skip empty lines and comments
      case "$key" in \
        ''|\#*) continue ;; \
      esac; \
      # Remove any trailing/leading whitespace
      key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'); \
      if [ -n "$key" ]; then \
        # Properly escape the value for shell
        escaped_value=$(echo "$value" | sed "s/'/'\\\\''/g"); \
        echo "export $key='$escaped_value'" >> /app/config/env.sh; \
      fi \
    done < .env && \
    chmod +x /app/config/env.sh && \
    echo "Environment variables loaded successfully"; \
  else \
    echo ".env file not found"; \
    exit 1; \
  fi

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Start the application with environment variables
CMD ["/bin/sh", "-c", ". /app/config/env.sh && npm start"]
