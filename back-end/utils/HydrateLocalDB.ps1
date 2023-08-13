# cloud endpoints: https://dynamodb.{{ aws region }}.amazonaws.com
Param(
    [Parameter(Mandatory = $false)]
    [string]$endpoint = 'http://localhost:8000',

    [Parameter(Mandatory = $false)]
    [switch]$create_tables
)

Get-ChildItem $PSScriptRoot/tables | % {
  $table = cat $_ | ConvertFrom-Json -AsHashtable

  $attributes = $table.attribute_definitions | ConvertTo-Json -AsArray -Compress
  $key_schema = $table.key_schema | ConvertTo-Json -AsArray -Compress

  # ############################################################
  # AWS CLI needs to JSON input escaped on Windows only, comment
  # these lines out on Linux/MacOS
  $attributes = $attributes.Replace('"','\"')
  $key_schema = $key_schema.Replace('"'.'\"')
  # ############################################################

  if ($create_tables) {
    aws dynamodb create-table --endpoint $endpoint `
      --table-name $table.name `
      --attribute-definitions $attributes `
      --key-schema $key_schema `
      --billing-mode PAY_PER_REQUEST | ConvertFrom-Json -AsHashtable
  }
  
  Get-ChildItem $PSScriptRoot/data/$($table.name) | % {
    aws dynamodb put-item --endpoint $endpoint `
    --table-name $table.name `
    --item $(cat $_ | python $PSScriptRoot/ConvertToDynamoJSON.py).Replace('"','\"')
  }
}