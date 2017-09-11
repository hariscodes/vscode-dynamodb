'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import { DynamoExplorer } from './dynamo/explorer';
import { dynamoServer, Table } from './dynamo/dynamo';
import { Endpoint, DynamoDB } from 'aws-sdk';
import { quickTableInput, quickAttributeDefinition, quickKeySchemaElement, currentTableDesc, quickStreamSpecification, quickUpdateTable } from './dynamo/schema'

let server: dynamoServer;
let input: quickTableInput;
let attribute: quickAttributeDefinition;
let keyschema: quickKeySchemaElement;

export function activate(context: vscode.ExtensionContext) {

    server = new dynamoServer(new Endpoint('http://localhost:8001'));

    const explorer = new DynamoExplorer(server, context);
    vscode.window.registerTreeDataProvider('dynamoExplorer', explorer);

    context.subscriptions.push(vscode.commands.registerCommand('dynamo.changeServer', () => changeServer()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.refreshExplorer', () => explorer.refresh()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.createTableQP', () => createTableQP()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.deleteTableQP', () => deleteTableQP()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.updateTableQP',() => updateTableQP()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.createTableJSON',(fileName?: string) => createTableJSON(fileName)));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.updateTableJSON',(fileName?: string) => updateTableJSON(fileName)));

}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function changeServer() {
    await vscode.window.showInputBox({
		placeHolder: 'https://dynamodb.{region}.amazonaws.com OR http://localhost:8000'
	}).then(value => {
		if (value) {
			server.setEndpoint(value);
		}
    });
    
    vscode.window.setStatusBarMessage('Dynamo: ' + server.getEndpoint());
}

async function createTableQP() {
    let _name: string;
    let _atrname: string;
    let _atrtype: "S" | "N" | "B";
    let _reads: number;
    let _writes: number;
    await vscode.window.showInputBox({placeHolder: "Table name"})
        .then(value => {
            if(value) {
                _name = value;
            } else {
                vscode.window.showErrorMessage('INVALID Table name');
            }
        });
    await vscode.window.showInputBox({placeHolder: "Primary (Hash) Key Attribute name"})
        .then(value => {
            if(value) {
                _atrname = value;
            } else {
                vscode.window.showErrorMessage('INVALID Attribute name');
            }
        });
    await vscode.window.showQuickPick(["String","Number","Binary"],{placeHolder: "Primary (Hash) Key Attribute Type"})
        .then(value => {
            switch(value) {
                case "String":
                    _atrtype = "S"
                    break;
                case "Number":
                    _atrtype = "N"
                    break;
                case "Binary":
                    _atrtype = "B"
                    break;
                default:
                    break;
            }
        });
    await vscode.window.showInputBox({placeHolder: "Provisioned Read Capacity Units (Must be >= 1)"})
        .then(value => {
            if (!isNaN(+value)) {
                if (+value >= 1) {
                    _reads = +value;
                } else {
                    vscode.window.showErrorMessage('Provisioned Reads MUST be >=1');
                }
            } else {
                vscode.window.showErrorMessage('Provisioned Reads MUST be a numeric value');
            }
        });
    await vscode.window.showInputBox({placeHolder: "Provisioned Write Capacity Units (Must be >= 1)"})
    .then(value => {
        if (!isNaN(+value)) {
            if (+value >= 1) {
                _writes = +value;
            } else {
                vscode.window.showErrorMessage('Provisioned Writes MUST be >=1');
            }
        } else {
            vscode.window.showErrorMessage('Provisioned Writes MUST be a numeric value');
        }
    });

    let _qad = new quickAttributeDefinition(_atrname,_atrtype);
    let _qkse = new quickKeySchemaElement(_atrname,"HASH");

    server.createTable(new quickTableInput(_name,_qad,_qkse,{ReadCapacityUnits: _reads, WriteCapacityUnits: _writes}))

}

async function createTableJSON(fileName?: string) {
    let _table: DynamoDB.CreateTableInput;
    let _rawFile: string;

    if (fileName) {
        try {
            _rawFile = fs.readFileSync(vscode.workspace.rootPath+'/'+fileName,'utf8');
            _table = JSON.parse(_rawFile)
        } catch (error) {
            console.log(error);
            vscode.window.showErrorMessage(error);
        }
    } else {
        await vscode.window.showInputBox({placeHolder: "Enter Script Location"})
        .then((value) => {
            if(value) {
                try {
                    _rawFile = fs.readFileSync(vscode.workspace.rootPath+'/'+value,'utf8');
                    _table = JSON.parse(_rawFile)
                } catch (error) {
                    console.log(error);
                    vscode.window.showErrorMessage(error);
                }
            } else {
                vscode.window.showErrorMessage('Please enter a valid script location');
            }
        });
    }

    server.createTable(_table);
}

async function updateTableJSON(fileName?: string) {
    let _table: DynamoDB.UpdateTableInput;
    let _rawFile: string;

    if (fileName) {
        try {
            _rawFile = fs.readFileSync(vscode.workspace.rootPath+'/'+fileName,'utf8');
            _table = JSON.parse(_rawFile)
        } catch (error) {
            console.log(error);
            vscode.window.showErrorMessage(error);
        }
    } else {
        await vscode.window.showInputBox({placeHolder: "Enter Script Location"})
        .then((value) => {
            if(value) {
                try {
                    _rawFile = fs.readFileSync(vscode.workspace.rootPath+'/'+value,'utf8');
                    _table = JSON.parse(_rawFile)
                } catch (error) {
                    console.log(error);
                    vscode.window.showErrorMessage(error);
                }
            } else {
                vscode.window.showErrorMessage('Please enter a valid script location');
            }
        });
    }

    server.updateTable(_table);
}

async function deleteTableQP() {
    let _name: string;
    await vscode.window.showInputBox({placeHolder: "Table name TO BE DELETED"})
    .then(value => {
        if(value) {
            _name = value;
        } else {
            vscode.window.showErrorMessage('Please enter a table name.');
        }
    });
    if (_name) {
        server.deleteTable(_name);
    } 
}

async function updateTableQP() {
    // NOTE: Streams and IOPS settings cannot be adjusted at the same time!

    let _name: string;
    let toUpdate: 'S' | 'T'
    let _str: boolean;
    let _strtype: 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY';
    let _reads: number;
    let _writes: number;
    let _cur: currentTableDesc = new currentTableDesc();

    await vscode.window.showInputBox({placeHolder: "Table Name to be Updated"})
    .then(value => {
        if(value) {
            _name = value;
        } else {
            vscode.window.showErrorMessage('Please enter a table name.');
        }
    });

    await server.describeTable(_name)
    .then(value =>{
        _cur.Table.StreamSpecification = (value.Table.StreamSpecification) ? value.Table.StreamSpecification : {StreamEnabled: false};
        _cur.Table.ProvisionedThroughputDescription = value.Table.ProvisionedThroughput;
    });
    
    await vscode.window.showQuickPick(["Streams","Provisioned Throughput"],{placeHolder: "What do you want to update?"})
    .then(value => {
        switch(value) {
            case "Streams":
                toUpdate = "S"
                break;
            case "Provisioned Throughput":
                toUpdate = "T"
                break;
            default:
                break;
        }
    });
    if (toUpdate == "S") {
        if (_cur.Table.StreamSpecification.StreamEnabled == true) {
            await vscode.window.showQuickPick(["Yes","No"],{placeHolder: "Streams are currently set to ON for " + _name + ", turn them OFF?"})
            .then(value => {
                _str = (value == "Yes") ? false : true;
            })   
        } else {
            await vscode.window.showQuickPick(["Yes","No"],{placeHolder: "Streams are currently set to OFF for " + _name + ", turn them ON?"})
            .then(value => {
                _str = (value == "Yes") ? true : false;
            })
            
            await vscode.window.showQuickPick(["New Image","Old Image", "New and Old Images", "Keys Only"],{placeHolder: "Select the type of stream to enable"})
            .then(value => {
                switch(value) {
                    case "New Image":
                        _strtype = "NEW_IMAGE"
                        break;
                    case "Old Image":
                        _strtype = "OLD_IMAGE"
                        break;
                    case "New and Old Images":
                        _strtype = "NEW_AND_OLD_IMAGES"
                        break;
                    case "Keys Only":
                        _strtype = "KEYS_ONLY"
                        break;
                    default:
                        break;
                }
            })
        }

        let _qss = new quickStreamSpecification(_str,_strtype);
        
        server.updateTable(new quickUpdateTable(_name,_qss,null));
        
    }
    if (toUpdate == "T") {
        await vscode.window.showInputBox({placeHolder: "Provisioned Read Capacity Units (Must be >= 1)"})
        .then(value => {
            if (!isNaN(+value)) {
                if (+value >= 1) {
                    _reads = +value;
                } else {
                    vscode.window.showErrorMessage('Provisioned Reads MUST be >=1');
                }
            } else {
                vscode.window.showErrorMessage('Provisioned Reads MUST be a numeric value');
            }
        });
        await vscode.window.showInputBox({placeHolder: "Provisioned Write Capacity Units (Must be >= 1)"})
        .then(value => {
            if (!isNaN(+value)) {
                if (+value >= 1) {
                    _writes = +value;
                } else {
                    vscode.window.showErrorMessage('Provisioned Writes MUST be >=1');
                }
            } else {
                vscode.window.showErrorMessage('Provisioned Writes MUST be a numeric value');
            }
        });

        server.updateTable(new quickUpdateTable(_name,null,{ReadCapacityUnits: _reads, WriteCapacityUnits: _writes}));
    }
}
