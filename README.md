<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Database connection

- Add IP address of computer to the list of whitelist IPs on mongoDB Atlas

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
or
$ yarn dev

# production mode
$ yarn run start:prod
```

## Adding dependencies

```bash
$ yarn add --dev package_name
```

or

```bash
$ yarn add package_name
```

## Environment variables

- Create a config folder in the root directory of the project
- Add .env file and specify your variables

## Generate private_key.pem

Enter this in terminal in the root folder:
`openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048 -pkeyopt rsa_keygen_pubexp:65537`

## Setting up gitignore

- Setup a global git ignore by creat the file in your root directory
- copy and paste this `git config --global core.excludesFile {path to .gitignore file}`

## Commiting your changes

- Create a feature branch off of develop
- git branch -b "name of branch"
- git add .
- git commit -m "your message"
- git push -u origin feature/"name of branch"

# Project variables

- DATABASE_URI : mongodb uri consisting of your username, password and cluster number

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# Deploy to ECR

## To connect to EC2 via console

`ssh -i "quickmart-secret.pem" ubuntu@ec2-44-211-194-83.compute-1.amazonaws.com`

NOTE: the public ip might change

## These are the steps to push the docker image to AWS ECR reposiotry

NOTE: make sure docker desktop is running

1. Retrieve an authentication token and authenticate your Docker client to your registry.
   Use the AWS CLI:
   `aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin 376620901748.dkr.ecr.ca-central-1.amazonaws.com`

2. Build your Docker image using the following command.
   For information on building a Docker file from scratch see the instructions here . You can skip this step if your image is already built:
   `docker build -t monolith-ecr .`

3. After the build completes, tag your image so you can push the image to this repository:
   `docker tag monolith-ecr:latest 376620901748.dkr.ecr.ca-central-1.amazonaws.com/monolith-ecr:latest`

Optional:
To run: `docker run -p 7080:7080 image_name`

4. Run the following command to push this image to your newly created AWS repository:
   `docker push 376620901748.dkr.ecr.ca-central-1.amazonaws.com/monolith-ecr:latest`

## Steps to make the docker image available on AWS EC2

NOTE: NEVER Login with AWS Credentials, create IAM Role to grant access to the ECS:
`sudo chmod 666 /var/run/docker.sock`

1. Run the following command to pull this image from the ECR Repository on EC2
   `docker pull 376620901748.dkr.ecr.ca-central-1.amazonaws.com/monolith-ecr:latest`

2. Run `docker images` to see if the image has been added

3. Run `docker stop {pid}` to stop previous image

4. Run the following command to expose the port in background mode
   `docker run -p 7080:7080 -d 932400219699.dkr.ecr.ca-central-1.amazonaws.com/quickmart-server:{tag_name}`

5. Run this to check if image is running
   `docker ps`

6. Run this to see the logs, add -f (to see the love feed)
   `docker logs {container id} -f`

## Clearing Docker storage

- docker system prune -a

- docker volume prune

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
