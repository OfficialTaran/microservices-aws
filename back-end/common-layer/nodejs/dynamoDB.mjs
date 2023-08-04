import { DynamoDBClient, ExecuteStatementCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

let client_props = (process.env.STAGE === 'dev')
  ? { endpoint: 'http://dynamo-local:8000' }
  : {}

const DynamoClient = new DynamoDBClient(client_props)

/**
 * Run a PartiQL statement against DynamoDB
 * The calling Lambda function must have read/write access to the
 * table. For local testing, updates will be run against dynamodb local.
 * 
 * @async
 * @param {string} Statement The PartiQL statement to run
 * @param {*[]} [Parameters] an array of parameters to add to the Command, unmarshalled.
 * @returns {Promise} DynamoDB response, unmarshalled
 * 
 */
const Statement = ( Statement, Parameters = null) => {
  if (Parameters) {
    Parameters = Parameters.map(marshall)
  }
  
  const command = new ExecuteStatementCommand({ Statement, Parameters })
  return DynamoClient.send(command).then(data => {
    return data.Items.map(i => unmarshall(i))
  })
}

/**
 * Insert a new item into a DynamoDB table. A UUID will be added to the object.
 * The calling Lambda function must have read/write access to the
 * table. For local testing, updates will be run against dynamodb local.
 * 
 * @param {{TableName: string, data: object}} param0 
 * @returns {Promise} Output from the Put command, new object id
 */
const InsertItem = ({ TableName, data }) => {
  const uuid = uuidv4()
  data.id = uuid
  const command = new PutItemCommand({
    TableName,
    Item: marshall(data)
  })
  return DynamoClient.send(command).then(res => {
    return {
      res: res,
      id: uuid
    }
  })
}

export { Statement, InsertItem }