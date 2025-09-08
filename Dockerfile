FROM node:22-alpine

WORKDIR /app

# Suppress npm version warning
ENV npm_config_update_notifier=false

# Copy package.json and install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Copy source files and build the project
COPY src src
COPY tsconfig.json .
RUN npm run build
RUN rm -rf src

LABEL com.googleapis.cloudmarketplace.product.service.name="services/human-mcp-server.endpoints.px-gcp-marketplace-prod.cloud.goog"

# Set entrypoint
ENTRYPOINT ["npm", "run", "start"]