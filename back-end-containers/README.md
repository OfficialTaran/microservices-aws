# AWS MicroServices Kubernetes Backend

When following the steps of the main readme of this repo, we create a full serverless web app in AWS. The backend of this system is a SAM app built on API Gateway and Lambda functions. Another popular method of deploying microservice systems is with containers and kubernetes. In this folder, we have all the code to serve the same backend API in kubernetes that we have in SAM. 

Start by keeping all the resources we have deployed as-is, some will be used in this architecture as well. Start a terminal in this folder

## Getting Started

All tools used to develop and deploy this system are cross platform and will behave the same regardless of your host OS.

### Installing Pre-Reqs
- [eksctl](https://eksctl.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [helm](https://helm.sh/docs/intro/install/)
- [Lens (Optional)](https://k8slens.dev/)

## Setting up AWS Resources

```pwsh
./deploy/aws/launch.ps1
```

This script will take some time to run, we can start another terminal in this folder and run some other commands awhile
```pwsh
cd api
npm install --production
cd ../inventoryApi
npm install --production
cd ../common
npm install
```

Open the deploy/k8s folder. 

Open the api-deployment.yml and inventory-api-deployment.yml files.

Replace the {{ bracketed }} sections of the file with their respective values. 

Many of these values, such as {{ cognito pool id }} we can get from the infrastructure we've already created. 

For {{ tag }} we can put test1 for now.

Once the launch script we started completes and all other steps are done. We can run some more scripts.

```pwsh
./deploy/aws/IAMserviceAccount.ps1
./deploy/k8s/ingress-controller/launch.ps1
```

The last script will output a URL for a load balancer that was created. Because of the length of this value, we will need to create another domain name that points to it as a CNAME. If you do not have access to an already registered DNS server, create any record that you would like. If not, you can use AWS Route53 to register a domain and manage DNS for a relatively inexpensive cost.

[Registering A Domain in Route53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html)

[Creating a CNAME in Route53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html)

open up deploy/k8s/api-ingress.yml and replace {{ domain name }} with the name you just registered.

## Configuring our EKS cluster
The yaml files in deploy/k8s are kubernetes manifest files. We use these files to define and manage the resources we create insides our Elastic Kubernetes Service cluster. We deploy these files using _kubectl apply_. This will either create resources that don't exist, or update those that do with any changes since the last application. 

By this point, all of the {{ bracketed }} portions of those files should be filled in. The IAMserviceAccount.ps1 script has already created a namespace called back-end. We'll want to deploy our resources into that namespace.

Start a terminal in the deploy/k8s folder
```pwsh
kubectl apply -f api-deployment.yml
kubectl apply -f inventory-api-deployment.yml
kubectl apply -f api-ingress.yml
```

This will create all the pods and network resources needed for the new backend of our system. Use kubectl or Lens to view these created resources. When creating a new ingress resources, cert-manager (a helm chart installed during an earlier script) will automatically create and apply a TLS certificate to the services. This may take a few minutes to order and provision. 

After everything is set up, we can use curl to directly address our new backend.
```pwsh
curl https://{{ the url you created }}/api/products
```

## Swapping our site to the new backend
We use CloudFront to handle CDN networking and caching, as well as to consolidate all the HTTP traffic of our application behind one domain. All backend routes (starting with /api/ ) first go through CloudFront and are then proxied to our SAM app served by API Gateway. We are now ready to replace this SAM app with our kubernetes backendd, served by an ingress controller. So, we have to update CloudFront to now proxy that traffic to the ingress controller.

Select our CloudFront distribution

Go to origins

Add a new origin, with all configuration being similar to our api-gateway origin.

Remove the OriginPath property (Currently '/Prod') on our new origin. We added this to match with the pathing of the multi-staged api-gateway, however it is not needed in our kubernetes backend.

Replace the DomainName property with the URL you created as a CNAME earlier.

Go to Behaviors

Edit the behavior for /api/*

Swap out the origin of this behavior from api-gateway to our new origin pointing to kubernetes

Go to Invalidations

Create a new Invalidation for /*

This will purge the full CDN of all content

reload the web app and the backend traffic is now being served by kubernetes