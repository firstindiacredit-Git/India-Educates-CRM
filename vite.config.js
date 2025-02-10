import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  optimizeDeps: {
    include: ["fabric"],
  },
  server: {
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "../BACKEND/certificates/key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../BACKEND/certificates/cert.pem")
      ),
    },
    host: true, // Needed for mobile testing
    port: 5173,
  },
});

/*

server {
    listen 80;
    server_name crm.indiaeducates.org;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name crm.indiaeducates.org;

    ssl_certificate /etc/letsencrypt/live/crm.indiaeducates.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.indiaeducates.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    root /home/ubuntu/India-Educates-Backend/dist;
    index index.html;

    client_max_body_size 50M;

    # ✅ Serve React App
    location / {
        try_files $uri /index.html;
    }

    # ✅ API Requests Proxy to Backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
      location /profile/ {
        proxy_pass http://127.0.0.1:5000/profile/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}
*/

// server {
//     listen 80;
//     server_name crm.indiaeducates.org;

//     # Redirect HTTP to HTTPS
//     return 301 https://$host$request_uri;
// }

// server {
//     listen 443 ssl;
//     server_name crm.indiaeducates.org;

//     ssl_certificate /etc/letsencrypt/live/crm.indiaeducates.org/fullchain.pem;
//     ssl_certificate_key /etc/letsencrypt/live/crm.indiaeducates.org/privkey.pem;

//     ssl_protocols TLSv1.2 TLSv1.3;
//     ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
//     ssl_prefer_server_ciphers on;

//     root /home/ubuntu/India-Educates-Backend/dist;
//     index index.html;

//     client_max_body_size 50M;

//     # WebSocket Configuration
//     location /socket.io/ {
//         proxy_pass http://127.0.0.1:5000;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection "upgrade";
//         proxy_set_header Host $host;

//         # Additional WebSocket settings
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//         proxy_set_header X-Forwarded-Proto $scheme;

//         # Timeout settings
//         proxy_read_timeout 86400;
//         proxy_send_timeout 86400;
//         proxy_connect_timeout 86400;
//     }

//     # Serve React App
//     location / {
//         try_files $uri /index.html;
//     }

//     # API Requests Proxy to Backend
//     location /api/ {
//         proxy_pass http://127.0.0.1:5000;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//     }

//     location /profile/ {
//         proxy_pass http://127.0.0.1:5000/profile/;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//     }

//     # Handle uploads directory
//     location /uploads/ {
//         proxy_pass http://127.0.0.1:5000/uploads/;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//     }
// }
