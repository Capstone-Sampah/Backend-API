# Base image 
FROM node:16-alpine

# App directory
WORKDIR /app

# Copy app configuration files into app directory
COPY package*.json .

# Install app dependencies
RUN npm install

# Copy all app files into app directory
COPY . .

# Binding port
EXPOSE 4000

# Command to run app
CMD ["npm", "start"]