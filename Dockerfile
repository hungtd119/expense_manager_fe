FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV BACKEND_URL=http://host.docker.internal:3000 \
    NGINX_ENVSUBST_FILTER=BACKEND_URL

COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
