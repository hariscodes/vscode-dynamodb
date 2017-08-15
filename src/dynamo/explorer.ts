import { TreeDataProvider, Command, Event, EventEmitter, Disposable, TreeItem, ExtensionContext } from 'vscode';
import {dynamoServer, dynamoResource} from './dynamo';

export class DynamoExplorer implements TreeDataProvider<dynamoResource> {
    
        private _disposables: Map<dynamoResource, Disposable[]> = new Map<dynamoResource, Disposable[]>();
    
        private _onDidChangeTreeData: EventEmitter<dynamoResource> = new EventEmitter<dynamoResource>();
        readonly onDidChangeTreeData: Event<dynamoResource> = this._onDidChangeTreeData.event;
    
        constructor(private model: dynamoServer, private extensionContext: ExtensionContext) {
            this.model.onChange(() => this._onDidChangeTreeData.fire());
        }
    
        getTreeItem(node: dynamoResource): TreeItem {
            return node;
        }
    
        getChildren(node: dynamoResource): Thenable<dynamoResource[]> {
            //to implement
            return;
        }
    
        refresh(): void {
            this._onDidChangeTreeData.fire();
        }
    }
