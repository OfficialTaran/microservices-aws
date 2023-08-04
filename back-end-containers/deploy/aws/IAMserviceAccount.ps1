# Adds a service account to the cluster that we can attach
# to the back end pods (api and inventoryapi). Uses the IAM
# policy created in the sam-app stack for the serverless
# infrastructure. Steps based on:
# https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
Param(
    [Parameter(Mandatory = $false)]
    [string]$cluster_name = 'lumberyard-backend',

    [Parameter(Mandatory = $false)]
    [string]$namespace = 'back-end',

    [Parameter(Mandatory = $false)]
    [string]$role_name = 'api-role',

    [Parameter(Mandatory = $false)]
    [string]$policy_name = 'DynamoDBAccess',

    [Parameter(Mandatory = $false)]
    [string]$svcaccount_name = 'api-service-account'
)

$oidc_id = $(aws eks describe-cluster --name $cluster_name `
  --query "cluster.identity.oidc.issuer" --output text).Split("/")[-1]

# Determine if the IAM OIDC provider for the cluster exists, if not create
$oidc_providers = aws iam list-open-id-connect-providers `
  --query OpenIDConnectProviderList[].Arn `
  | ConvertFrom-Json -NoEnumerate

if ( $oidc_providers -notcontains $oidc_id ) {
  eksctl utils associate-iam-oidc-provider `
    --cluster $cluster_name --approve
}

# create iam service account and role for cluster
$account_id = aws sts get-caller-identity --query Account --output text

eksctl create iamserviceaccount `
  --name $svcaccount_name `
  --namespace $namespace `
  --cluster $cluster_name `
  --role-name $role_name `
  --attach-policy-arn arn:aws:iam::$($account_id):policy/$policy_name `
  --approve

Write-Host "IAM Role:" -ForegroundColor blue
aws iam get-role --role-name $role_name --query Role.AssumeRolePolicyDocument

Write-Host "Kubernetes Service Account:" -ForegroundColor blue
kubectl describe serviceaccount $svcaccount_name -n $namespace