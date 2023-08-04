Param(
    [Parameter(Mandatory = $true)]
    [string]$folder,

    [Parameter(Mandatory = $true)]
    [string]$repository,

    [Parameter(Mandatory = $true)]
    [string]$tag,

    [Parameter(Mandatory = $false)]
    [string]$region = 'us-east-2'
)

$account_id = aws sts get-caller-identity --query Account --output text
$ecr = "$account_id.dkr.ecr.$region.amazonaws.com"
$image = "$ecr/$($repository):$tag"

aws ecr get-login-password --region $region `
  | docker login --username AWS `
  --password-stdin $ecr

docker build -t $image `
  -f .\$folder\Dockerfile .

docker push $image