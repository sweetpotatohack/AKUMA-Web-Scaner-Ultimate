FROM nginx:alpine

# Copy the frontend files
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY public/ /usr/share/nginx/html/public/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
