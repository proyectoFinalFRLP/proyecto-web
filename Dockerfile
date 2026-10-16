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

# La CSP deja conectarse sólo al propio origen y al de la API: el origen
# (esquema + host + puerto) de VITE_API_URL reemplaza __API_ORIGIN__. Sale del
# mismo ARG que el bundle, así la política y el bundle no pueden desencontrarse.
# Con una URL relativa (API en el mismo origen) queda sólo 'self'.
ARG VITE_API_URL
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
RUN api_origin=$(printf '%s' "$VITE_API_URL" | sed -nE 's#^(https?://[^/]+).*#\1#p') && \
    sed -i "s#__API_ORIGIN__#${api_origin}#" /etc/nginx/snippets/security-headers.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Una config inválida corta el build acá y no el arranque del contenedor.
RUN nginx -t

EXPOSE 80
