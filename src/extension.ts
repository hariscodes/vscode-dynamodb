'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {DynamoExplorer} from './dynamo/explorer'
import {dynamoServer, Table} from './dynamo/dynamo'
import {Endpoint} from 'aws-sdk'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let server = new dynamoServer(new Endpoint('http://localhost:8000'));

    const explorer = new DynamoExplorer(server, context);
    vscode.window.registerTreeDataProvider('dynamoExplorer', explorer);

    context.subscriptions.push(vscode.commands.registerCommand('dynamo.connect', (server) => connect(server)));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.refreshExplorer', () => explorer.refresh()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.createTable', (table: Table) => createTable(table)));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.deleteTable', (table: Table) => deleteTable(table)));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function connect(server: dynamoServer) {
    vscode.window.showInputBox({
		placeHolder: 'https://dynamodb.{region}.amazonaws.com OR http://localhost:8000'
	}).then(value => {
		if (value) {
			server.setEndpoint(value);
		}
    });
    
    vscode.window.setStatusBarMessage('Mongo: ' + server.getEndpoint());
}

function createTable(table: Table) {
    vscode.window.showInformationMessage('Create Table Placeholder')
}

function deleteTable(table: Table) {
    vscode.window.showInformationMessage('Delete Table Placeholder')
}
