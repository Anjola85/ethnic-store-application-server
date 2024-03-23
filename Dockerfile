FROM node:18

WORKDIR /quickmart/src/app

# Copy package.json and yarn.lock file
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of your application code
COPY . .

# Uncomment the following line if you want to include an environment configuration file
# COPY config/.env /quickmart/src/app

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 7080

# Command to run the application
CMD ["node", "dist/main.js"]
