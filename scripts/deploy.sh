#!/bin/bash

# Step 1: Retrieve an authentication token and authenticate your Docker client to your registry.
echo "Authenticating Docker client to AWS ECR..."
aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin 376620901748.dkr.ecr.ca-central-1.amazonaws.com

# Check if authentication was successful
if [ $? -ne 0 ]; then
    echo "Authentication failed. Exiting..."
    exit 1
fi

echo "Authentication successful."

# Step 2: Build your Docker image (skip this step if your image is already built).
echo "Building Docker image..."
docker build -t quickmart-server .

# Step 3: Tag your Docker image.
echo "Tagging Docker image..."
docker tag monolith-ecr:latest 376620901748.dkr.ecr.ca-central-1.amazonaws.com/monolith-ecr:latest

# Optional Step: Run your Docker image locally.
# Uncomment the following line to use it.
# docker run -p 7080:7080 image_name

# Step 4: Push the image to the AWS ECR repository.
echo "Pushing image to AWS ECR..."
docker push 376620901748.dkr.ecr.ca-central-1.amazonaws.com/monolith-ecr:latest

echo "Script execution completed."

