# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the production application
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy the build output to Nginx's default public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx config if needed, otherwise use default
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
