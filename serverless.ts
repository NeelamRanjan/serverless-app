import type { Serverless } from 'serverless/aws';
import { hello } from './src/functions';

// DynamoDB
//import dynamoDbTables from './resources/dynamodb-tables';

const serverlessConfiguration: Serverless = {
  service: 'serverless-app',
  frameworkVersion: '>=1.72.0',
  custom: {
    region: '${opt:region, self:provider.region}',
    stage: '${opt:stage, self:provider.stage}',
    list_table: '${self:service}-list-table-${opt:stage, self:provider.stage}',
    //tasks_table: '${self:service}-tasks-table-${opt:stage, self:provider.stage}',
    table_throughputs: {
     prod: 5,
       default: 1,
    },
    //table_throughput: '${self:custom.TABLE_THROUGHPUTS.${self:custom.stage}, self:custom.table_throughputs.default}',
    table_throughput: 1,
    dynamodb: {
      stages: ['dev'],
      start: {
        port: 8008,
        inMemory: true,
        heapInitial: '200m',
        heapMax: '1g',
        migrate: true,
        seed: true,
        convertEmptyValues: true,
         //Uncomment only if you already have a DynamoDB running locally
        noStart: true
      }
    },
    ['serverless-offline']: {
      httpPort: 3000,
      babelOptions: {
        presets: ["env"]
      }
    }

  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-bundle',
    'serverless-dynamodb-local',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],

  package: {
    individually: true,
  },
  
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'ap-southeast-2',
    profile: 'default',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
     // REGION: '${self:custom.region}',
      //STAGE: '${self:custom.stage}',
      LIST_TABLE: '${self:custom.list_table}',
      //TASKS_TABLE: '${self:custom.tasks_table}',
    },
   
    /*iamRoleStatements: [
      {
          Effect: 'Allow',
          Action: [
              'dynamodb:DescribeTable',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
          ],
          Resource: [
              {"Fn::GetAtt": [ 'ListTable', 'Arn' ]},
              {"Fn::GetAtt": [ 'TasksTable', 'Arn' ]}
          ]
      }
  ]*/

  },
  functions: {
    hello
  },
  
   resources: {
    Resources: {
      ListTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
            TableName: '${self:provider.environment.LIST_TABLE}',
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            }
        }
    },

    }
       
}
  
}

module.exports = serverlessConfiguration;