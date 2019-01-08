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

    public getRegion(): string {
        return AWS.config.region;
    }

    createTable(schema: AWS.DynamoDB.CreateTableInput) {
        /* 
        * GUI Driven Create table is super basic (table name, 1 attribute/type which is the HASH key, and read/write throughput options).
        */

        if (schema.hasOwnProperty("$schema")) {
            delete schema["$schema"];
        }

        this._DynamoDB.createTable(schema, (err,opt) => {
            if (err) {
                vscode.window.showErrorMessage('Error creating table: '+ err.message);
                console.log(schema);
                console.log(err.message);
                return;
            } else {
                vscode.window.showInformationMessage('Table ' + opt.TableDescription.TableName + ' was successfully created.');
            }
        });
    }

    deleteTable(name: string) {
        this._DynamoDB.deleteTable({TableName: name}, (err, data) => {
            if(err) {
                vscode.window.showErrorMessage('Error dropping table: ' + err);
                console.log(err.message);
                return;
            } else {
                vscode.window.showInformationMessage('Table ' + data.TableDescription.TableName + ' was successfully deleted.');
            }
        });
    }

    updateTable(schema: AWS.DynamoDB.UpdateTableInput) {
        if (schema.hasOwnProperty("$schema")) {
            delete schema["$schema"];
        }

        this._DynamoDB.updateTable(schema, (err,opt) => {
            if (err) {
                vscode.window.showErrorMessage('Error updating table: ' + err.message);
                console.log(err.message);
                return;
            } else {
                vscode.window.showInformationMessage('Table ' + opt.TableDescription.TableName + ' was successfully updated');
            }
        });
    }

    describeTable(name: string) {
        return new Promise<AWS.DynamoDB.DescribeTableOutput>((resolve,reject) => {
            this._DynamoDB.describeTable({TableName: name}, (err, data) => {
                if(err) {
                    vscode.window.showErrorMessage('Error describing table: ' + err);
                    console.log(err.message);
                    return;
                } else {
                   resolve(data);
                }
            });
        })
    }

    loadCredentials() {
        if (!vscode.workspace.getConfiguration('dynamo').get('awsProfile') || vscode.workspace.getConfiguration('dynamo').get('awsProfile') == 'default') {
            AWS.config.credentials = new AWS.SharedIniFileCredentials();
        }
        else {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: vscode.workspace.getConfiguration('dynamo').get('awsProfile')});
        } 
        AWS.config.update({region: vscode.workspace.getConfiguration('dynamo').get('region')});

        console.log("configured region: " + AWS.config.region);
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