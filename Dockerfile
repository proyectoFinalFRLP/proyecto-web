# syntax=docker/dockerfile:1

# Build stage: compila el bundle con Vite. VITE_API_URL se fija en build time:
# el bundle estático no puede leer variables de entorno en runtime. El mismo
# bundle se sirve en todos los hosts (norte/sur.*), el tenant se infiere del
# subdominio en el browser.
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Runtime: nginx sirviendo el bundle estático.
FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
