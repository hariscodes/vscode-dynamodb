import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface dynamoResource extends vscode.TreeItem {
	id: string;
	label: string;
	getChildren?(): Thenable<dynamoResource[]>;
	onChange?: vscode.Event<void>;
	contextValue?: string;
	command?: vscode.Command;
	iconPath?: { light: string, dark: string };
}

/*
FOR REFERENCE:

export interface tableRequest {
    AttributeDefinitions: [
        {
            AttributeName: string; //todo: 1 - 255 character limit!
            AttributeType: 's' | 'n' | 'b';
        }
    ];
    GlobalSecondaryIndexes?: [
        {
            IndexName: string,
            KeySchema: [
                {
                    AttributeName: string,
                    KeyType: string
                }
            ],
            Projection: {
                NonKeyAttributes: string[],
                ProjectionType: string
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: string,
                WriteCapacityUnits: string
            }
        }
    ],
    KeySchema: [
        {
            AttributeName: string,
            KeyType: 'HASH' | 'RANGE'
        }
    ],
    LocalSecondaryIndexes?: [
        {
            IndexName: string,
            KeySchema: [
                {
                    AttributeName: string,
                    KeyType: string
                }
            ],
            Projection: {
                NonKeyAttributes: string[],
                ProjectionType: string
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: number,
        WriteCapacityUnits: number
    },
    StreamSpecification?: {
        StreamEnabled: boolean,
        StreamViewType: string
    }
    TableName: string
}
*/


export class dynamoServer implements dynamoResource {
    
    readonly id: string = 'dynamoExplorer';
    readonly label: string = 'Dynamo';
    readonly type: string = 'dynamoRoot';
    readonly canHaveChildren: boolean = true;
    readonly collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    private _DynamoDB: AWS.DynamoDB;
    private _tables: dynamoResource[] = [];

    private _onChange: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onChange: vscode.Event<void> = this._onChange.event;

    constructor(endpoint: AWS.Endpoint) {
        try {
            this.loadCredentials();
        }
        catch(err) {
            return err;
        } 
        this._DynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
        this._DynamoDB.endpoint = endpoint;
    }

    async getChildren() {
        await this._DynamoDB.listTables((err,data) => {
            if (err) {
                vscode.window.showErrorMessage('Error fetching tables: ' + err.message);
                return err.message;
            } else {
                this._tables.length = 0;
                data.TableNames.forEach(element => {
                    this._tables.push(new Table(element));
                });
            }
        });
        return this._tables;
    }
        
    get iconPath(): any {
        return {
            dark: path.join(__filename, '..', '..', '..', '..', 'media', 'dark', 'DynamoDB_dark.png'),
            light: path.join(__filename, '..', '..', '..', '..', 'media', 'light', 'DynamoDB_light.png')
        };
    }

    public setEndpoint(url: string) {
        this._DynamoDB.endpoint = new AWS.Endpoint(url);
    }

    public getEndpoint(): string {
        return this._DynamoDB.endpoint.host;
    }

    createTable(schema: AWS.DynamoDB.CreateTableInput) {
        /* 
        * Script (tableName.json) vs QuickPick direct input? Table creation might be too cumbersome to do through the QuickPick box.
        * Maybe basic table generation without script only (i.e. name, KeySchema, AttributeDefinitions, ProvisionedThroughput)
        */

        this._DynamoDB.createTable(schema, (err,opt) => {
            if (err) {
                vscode.window.showErrorMessage('Error creating table: '+ err.message);
                return err.message;
            }
            else {
                vscode.window.showInformationMessage('Table ' + opt.TableDescription.TableName + ' was successfully created.')
            }
        });
    }

    deleteTable(name: string) {
        this._DynamoDB.deleteTable({TableName: name}, (err, data) => {
            if(err) {
                vscode.window.showErrorMessage('Error dropping table: ' + err);
                return; 
            } else {
                vscode.window.showInformationMessage('Table ' + data.TableDescription.TableName + ' was successfully deleted.')
            }
        });
    }

    private loadCredentials() {
        let awsPath = os.homedir() + `/.aws/credentials`;
        let ec2Path = os.homedir() + `/.ec2/credentials`;
        if(fs.exists(awsPath, (exists) => {
            if (exists) {
                console.log('Attempting to load credentials from ' + awsPath)
                AWS.config.loadFromPath(awsPath);
            }
            else {
                if (fs.exists(ec2Path, (exists) => {
                    if (exists) {
                        console.log('Attempting to load credentials from ' + awsPath)
                        AWS.config.loadFromPath(ec2Path);
                    }
                    else {
                        vscode.window.showErrorMessage('AWS Credential file not found. Please run AWS Configure on your host instance.');
                        return new Error('AWS Credential file not found. Please run AWS Configure on your host instance.');
                    }
                }))
                return;
            }
        }))
        if (!AWS.config.region) {
            AWS.config.update({region: vscode.workspace.getConfiguration('dynamo').get('region')});
        }
        return;
    }

}

export class Table implements dynamoResource {
    
    readonly contextValue: string = 'dynamoTable';

    private _onChange: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onChange: vscode.Event<void> = this._onChange.event;

    constructor(readonly id: string) {
    }

    get label(): string {
        return this.id;
    }

    get iconPath(): any {
        return {
            light: path.join(__filename, '..', '..', '..', '..', 'media', 'dark', 'Table_dark.png'),
            dark: path.join(__filename, '..', '..', '..', '..', 'media', 'light', 'Table_light.png')
        };
    }

    generateQuery() {
        
    }

    update() {
        //Update Table
    }

    drop() {
        //drop table
    }
    
    private describeTable() {

    }
}