#! /bin/bash
cp ../.env .

echo "Pulling the update"
git pull
echo "Stopping existing container"
docker stop discord-bot
echo "Removing existing container so only 1 always restarts"
docker rm discord-bot
echo "Building the new image"
docker build -t root/discord-image .
echo "Running the new container with the new image"
docker run --name discord-bot --restart always -p 49162:8000 -d root/discord-image
echo ""
echo "JOB DONE"
echo ""