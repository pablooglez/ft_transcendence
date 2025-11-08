FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes \
    -out /etc/nginx/ssl/transcendence.crt -keyout /etc/nginx/ssl/transcendence.key \
    -subj "/C=ES/ST=Andalucia/L=Malaga/O=42/OU=42/CN=transcendence.42.fr/UID=transcendence"

COPY --from=build /app/dist /usr/share/nginx/html

COPY src/utils/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]