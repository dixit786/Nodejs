FROM node:12-alpine
Run apk add --no-cache python g++ make
WORKDir /app
copy . .
RUN npm install
CMD ["node","./bin/www"]