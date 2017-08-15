'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const explorer = new DynamoExplorer(model, context);
    vscode.window.registerTreeDataProvider('mongoExplorer', explorer);

    context.subscriptions.push(vscode.commands.registerCommand('dynamo.connect', () => addServer()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.removeServer', (element: IdynamoResource) => model.remove(element)));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.refreshExplorer', () => explorer.refresh()));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.createTable', (server: Server) => createDatabase(server)));
    context.subscriptions.push(vscode.commands.registerCommand('dynamo.dropTable', (element: Database) => dropDatabase(element)));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function addServer(){
    vscode.window.showInputBox({
		placeHolder: 'https://dynamodb.{region}.amazonaws.com OR http://localhost:8000'
	}).then(value => {
		if (value) {
			model.add(value);
		}
	});
}

