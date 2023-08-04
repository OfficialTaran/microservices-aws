eksctl create cluster -f cluster.yml

aws cloudformation create-stack `
  --stack-name lumberyard-k8s-resources `
  --template-body file://template.yml

