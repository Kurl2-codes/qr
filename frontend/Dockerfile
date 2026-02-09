# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_UPLOAD_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_UPLOAD_BASE_URL=$VITE_UPLOAD_BASE_URL

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
# Copy Nginx template for env var substitution
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
