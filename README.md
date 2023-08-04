# AWS MicroServices

The purposes of this repository is to provide a fully realized, generic and effective example of using AWS best practices and resources to create a modern Web App hosted with a MicroService Architecture. The components of this application have been designed to be isolated and interchangeable, each in their own way, while maintaing the same behavior of the overall system. This repository is meant to be a learning and reference resource and is not a production ready system.

## Getting Started

All tools used to develop and deploy this system are cross platform and will behave the same regardless of your host OS.

### Installing Pre-Reqs
- [Powershell Core](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.3_)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [VS Code](https://code.visualstudio.com/Download)
- [Python](https://www.python.org/downloads/)
- [Node](https://nodejs.org/en/download)
- [Vue CLI](https://cli.vuejs.org/guide/installation.html)
- [Docker](https://docs.docker.com/get-docker/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### Clone this Repo

Clone this repository into the folder of your choice. All other commands will come from the root of the cloned repository unless otherwise specified.
```pwsh
git clone https://github.com/OfficialTaran/aws-microservices.git
```

## Deploy Your App
```pwsh
cd back-end/common-layer
npm install

cd ..
sam deploy --guided --capabilities CAPABILITY_NAMED_IAM
# All defaults will be fine. Cool people use us-east-2 though :)
# When prompted for AuthDomainPrefix enter a meaningful value for a url that will be unique
# The deployment will output some values we will need in later steps
```

create a file in front-end directory called .env.local with this content.
```bash
VUE_APP_COGNITO_POOL_ID={{ your cognito pool id }}
VUE_APP_COGNITO_CLIENT_ID={{ your cognito client id }}
VUE_APP_COGNITO_DOMAIN_PREFIX={{ AuthDomainPrefix }}
VUE_APP_AWS_REGION={{ aws region }}

```

```pwsh
cd front-end
npm install
npm run build
aws s3 sync ./dist s3://{{ bucket name from earlier }}
```

You should now be able to hit you site from the SiteURL output earlier