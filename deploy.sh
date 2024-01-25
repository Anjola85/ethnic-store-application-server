#!/bin/bash

# Define variables
REGION="ca-central-1"
ACCOUNT_ID="932400219699"
REPOSITORY_NAME="quickmart-server"
IMAGE_TAG="latest"

# Step 1: Authenticate Docker with AWS ECR
echo "Authenticating Docker client with AWS ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Check if authentication was successful
if [ $? -ne 0 ]; then
    echo "Authentication failed. Exiting script."
    exit 1
fi

# Step 2: Build the Docker image
echo "Building Docker image..."
docker build -t $REPOSITORY_NAME .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Docker build failed. Exiting script."
    exit 1
fi

# Step 3: Tag the Docker image
echo "Tagging Docker image..."
docker tag $REPOSITORY_NAME:$IMAGE_TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:$IMAGE_TAG

# Optional Step: Run the Docker container
read -p "Do you want to run the Docker container? (y/n): " answer
if [ "$answer" == "y" ]; then
    echo "Running Docker container..."
    docker run -p 7080:7080 $REPOSITORY_NAME:$IMAGE_TAG
fi

# Step 4: Push the Docker image to AWS ECR
echo "Pushing Docker image to AWS ECR..."
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:$IMAGE_TAG

echo "Script completed."
