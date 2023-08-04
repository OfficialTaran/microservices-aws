Param(
    [Parameter(Mandatory = $false)]
    [string]$namespace = 'ingress'
)

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm upgrade --install ingress-nginx `
  ingress-nginx/ingress-nginx `
  --create-namespace --namespace $namespace `
  --set controller.service.externalTrafficPolicy=Local `
  --set controller.replicaCount=2

helm install cert-manager jetstack/cert-manager `
  --namespace $namespace `
  --set installCRDs=true `
  --wait

kubectl apply -f $PSScriptRoot\certIssuer.yml -n $namespace

$elbName = kubectl get service `
  ingress-nginx-controller -n $namespace `
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

Write-Host "Domain Name of Ingress Controller is $elbName" -ForegroundColor blue
