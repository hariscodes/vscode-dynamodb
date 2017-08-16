'use strict';

import * as vscode from 'vscode';
import { DynamoExplorer } from './dynamo/explorer';
import { dynamoServer, Table } from './dynamo/dynamo';
import { Endpoint, DynamoDB } from 'aws-sdk';
import { quickTableInput, quickAttributeDefinition, quickKeySchemaElement } from './dynamo/schema'

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
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.createTable', () => createTable()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.deleteTable', () => deleteTable()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function changeServer() {
    vscode.window.showInputBox({
		placeHolder: 'https://dynamodb.{region}.amazonaws.com OR http://localhost:8000'
	}).then(value => {
		if (value) {
			server.setEndpoint(value);
		}
    });
    
    vscode.window.setStatusBarMessage('Dynamo: ' + server.getEndpoint());
}

async function createTable() {
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
    await vscode.window.showQuickPick(["String","Number","Binary"])
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

async function deleteTable() {
    let _name: string;
    await vscode.window.showInputBox({placeHolder: "Table name TO BE DELETED"})
    .then(value => {
        if(value) {
            _name = value;
        } else {
            vscode.window.showErrorMessage('Please enter a table name.');
        }
    });

    server.deleteTable(_name);
}
