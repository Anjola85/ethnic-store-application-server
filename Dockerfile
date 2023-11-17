# FOR CONNECTING ECR WITH BEANSTALK
# FROM 932400219699.dkr.ecr.ca-central-1.amazonaws.com/quickmart-server:latest

# EXPOSE 7080

# COPY . .

# RUN npm && npm build

# CMD ["npm", "start"]


# FOR DEPLOYING NODE DIRECTLY TO ECR
# Define stable node image
# FROM node:18

# # Set the working directory inside the container/image
# WORKDIR /quickmart/src/app

# # Copy the package.json and package-lock.json files
# COPY package*.json ./

# # Install all dependencies
# RUN npm install

# # Bundle app source
# COPY . .

# # Compile the application
# RUN npm run build

# # Expose the necessary port(s)
# EXPOSE 7080

# # Start the application
# CMD ["node", "dist/main.js"]


# NODE DOCKER CONFIG FOR ECR:
# Define stable node image
FROM node:18

# Set the working directory inside the container/image
WORKDIR /quickmart/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Bundle app source
COPY . .

# Compile the application
RUN npm run build

# Expose the necessary port(s)
EXPOSE 7080

# Start the application
CMD ["node", "dist/main.js"]