# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Install dependencies và tạo package-lock.json nếu chưa có
RUN npm install

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Don't set NODE_ENV=production yet, we need devDependencies
# ENV NODE_ENV production

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) because TypeScript is needed for next.config.ts
# Next.js requires TypeScript at runtime to load next.config.ts
# Explicitly install TypeScript as production dependency
RUN npm install && \
    npm install typescript@^5 --save --force

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Verify public folder was copied correctly
RUN ls -la ./public/ || echo "Public folder check"

# Now set NODE_ENV for runtime
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["npm", "start"]
