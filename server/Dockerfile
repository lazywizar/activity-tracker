FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Debug: Print environment variables from .env file and load them properly
RUN if [ -f .env ]; then \
    echo "Contents of .env file (masked):" && cat .env | sed 's/=.*$/=****/' && \
    # Load each variable individually, preserving newlines and special characters
    while IFS='=' read -r key value; do \
      if [ -n "$key" ] && [ -n "$value" ]; then \
        # Remove any comments
        key=$(echo $key | sed 's/#.*//g' | xargs) && \
        # Skip empty lines or comment lines
        if [ -n "$key" ] && [[ ! "$key" =~ ^# ]]; then \
          # Preserve the exact value including newlines and special chars
          echo "export $key='$value'" >> /app/env.sh; \
        fi \
      fi \
    done < .env && \
    chmod +x /app/env.sh && \
    echo "Environment file created successfully"; \
    else \
    echo ".env file not found"; \
    fi

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

CMD ["/bin/bash", "-c", "source /app/env.sh && npm start"]
