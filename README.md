# vscode-dynamodb

A DynamoDB Viewer in VS Code, inspired by [vscode-mongodb](https://github.com/Microsoft/vscode-mongodb).

* Connect to local or AWS hosted instances of DynamoDB
* Create and view DynamoDB databases and collections with the DynamoDB Explorer
* Create and view information on DynamoDB Streams
* Execute scripts and see results directly in VS Code
* Update documents in place

## Prerequisites

Must have [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and [DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) installed.

Additionally you need to have an AWS access key and secret key to construct the AWS Credentials Object the extension uses to authenticate to DynamoDB (Even for local instances! I know, ugh). The simplest way to do this is by setting up an IAM user account on AWS, attaching an `AdministratorAccess` policy to it and then generating an access key for it under it's security credentials. **Store the Secret Access Key securely somewhere, you'll have to recreate it if you lose it.**

> Side note: feel free to get as granular with the permissions as you need to; the IAM account just needs Full Access to DynamoDB. 

## Planned Features

### DynamoDB Viewer
* View tables, their attributes, and all their records
### DynamoDB Stream Manager

## Extension Settings

None, yet!

## Known Issues

None yet, fortunately. 