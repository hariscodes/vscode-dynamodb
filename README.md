# vscode-dynamodb

A DynamoDB Viewer in VS Code, inspired by [vscode-mongodb](https://github.com/Microsoft/vscode-mongodb). Currently in alpha.

* Connect to local or AWS-hosted instances of DynamoDB
* Create and view DynamoDB tables with the DynamoDB Explorer
* Create and view information on DynamoDB Streams
* Execute scripts and see results directly in VS Code

## Prerequisites

Must have [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and [DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) installed.

Additionally you need to have an AWS access key and secret key stored as environment variables to authenticate to DynamoDB (Even for local instances! I know, ugh).

## WARNING: please read

This extension can connect to and manipulate AWS-hosted DynamoDB tables, which means you should be ***VERY CAREFUL*** not to accidentally delete something or create a table/global secondary index with some extra zeros on the provisioned throughput...you could find those zeros mirrored on your bill. I therefore **highly reccommend** that you only use this for developing on local instances, and maybe deploying some test tables to AWS to get your throughput numbers right. Please don't use this extension to destroy an expensive production environment, because I won't be able to help you (beyond offering you my condolences, #HugOps).

## Current Features

* Connect to local or AWS-hosted instances of DynamoDB
* Create/Update/Delete tables with guided input through VS Code
* Create/Update tables through JSON files
* Use provided JSON Schemas to validate your AWS JSON requests!
* Use snippets to quickly build standard table schemas and create/update requests!

## Planned Features

### DynamoDB Viewer
* View tables, their primary key(s), indexes, and streams in an explorer tab

### DynamoDB Development Tools
* Quickly generate boilerplate DynamoDB Queries based on table structures
* See query results directly in VS Code.

### DynamoDB Stream Manager
* Generate boilerplate code for reading shards from streams

## Extension Settings

* `dynamo.showExplorer`: Show or hide the DynamoDB Explorer. **[False by default, explorer not yet implemented]**
* `dynamo.sslEnabled`: Enable or Disable SSL on requests.
* `dynamo.region`: If running on EC2, specify the region.