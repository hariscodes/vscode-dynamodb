# vscode-dynamodb

A DynamoDB Viewer in VS Code, inspired by [vscode-mongodb](https://github.com/Microsoft/vscode-mongodb).

* Connect to local or AWS hosted instances of DynamoDB
* Create and view DynamoDB tables with the DynamoDB Explorer
* Create and view information on DynamoDB Streams
* Execute scripts and see results directly in VS Code

## Prerequisites

Must have [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and [DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) installed.

Additionally you need to have an AWS access key and secret key stored as environment variables to authenticate to DynamoDB (Even for local instances! I know, ugh). 

## Planned Features

### DynamoDB Viewer
* View tables, their primary key(s), indexes, and streams
* Create new tables and indexes

### DynamoDB Development Tools
* Quickly generate boilerplate DynamoDB Queries based on table structures
* Create, Update, and Delete tables
* Create tables with streams enabled
* Create and run scripts directly from VS Code

### DynamoDB Stream Manager
* Enable and disable streams for existing tables
* Generate boilerplate code for reading shards from streams

## Extension Settings

* `dynamo.showExplorer`: Show or hide the DynamoDB Explorer.
* `dynamo.sslEnabled`: Enable or Disable SSL on requests.