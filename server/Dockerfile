FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

CMD ["npm", "start"]
