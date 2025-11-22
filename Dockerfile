# Use Node.js 22 Alpine to match local development
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Set production environment variables
ENV NODE_ENV=production

ARG VITE_ALLOW_DESKTOP_DEV
ENV VITE_ALLOW_DESKTOP_DEV=$VITE_ALLOW_DESKTOP_DEV

ARG VITE_YELLOW_WALLET_ID
ENV VITE_YELLOW_WALLET_ID=$VITE_YELLOW_WALLET_ID

ARG VITE_ASSET
ENV VITE_ASSET=$VITE_ASSET

ARG VITE_PRIVY_APP_ID
ENV VITE_PRIVY_APP_ID=$VITE_PRIVY_APP_ID

ARG VITE_FEATURE_ANALYTICS
ENV VITE_FEATURE_ANALYTICS=$VITE_FEATURE_ANALYTICS

ARG VITE_GA_MEASUREMENT_ID
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

# Build the application
RUN npm run build

# Expose port (Vite preview default is 4173)
EXPOSE 4173
ENV PORT 4173

# Start the application with Vite preview
CMD ["npm", "run", "preview"]