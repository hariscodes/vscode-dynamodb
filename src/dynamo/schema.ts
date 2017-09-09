import { DynamoDB } from "aws-sdk";
import { window } from 'vscode';

/*
FOR REFERENCE:

export interface tableRequest {
     AttributeDefinitions: [
        {
            AttributeName: string; //todo: 1 - 255 character limit!
            AttributeType: 's' | 'n' | 'b';
        }
    ];
    TableName: string;
    KeySchema: [
        {
            AttributeName: string,
            KeyType: 'HASH' | 'RANGE'
        }
    ];
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
                ProjectionType: 'KEYS_ONLY' | 'INCLUDE' | 'ALL'
            }
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
                ReadCapacityUnits: number,
                WriteCapacityUnits: number
            }
        }
    ];
    ProvisionedThroughput: {
        ReadCapacityUnits: number,
        WriteCapacityUnits: number
    };
    StreamSpecification?: {
        StreamEnabled: boolean,
        StreamViewType: string
    };
}
*/

export class quickTableInput implements DynamoDB.CreateTableInput {
    AttributeDefinitions: quickAttributeDefinition[] = [];
    TableName: string;
    KeySchema: quickKeySchemaElement[] = [];
    ProvisionedThroughput: DynamoDB.ProvisionedThroughput;

    constructor(name: string, attribute: quickAttributeDefinition, key: quickKeySchemaElement, throughput: DynamoDB.ProvisionedThroughput) {
        this.TableName = name;
        this.AttributeDefinitions.push(attribute);
        this.KeySchema.push(key);
        this.ProvisionedThroughput = throughput;
    }
}

export class quickAttributeDefinition implements DynamoDB.AttributeDefinition {
    AttributeName: string;
    AttributeType: "S" | "N" | "B";

    constructor(name: string, type: "S" | "N" | "B") {
        this.AttributeType = type;
        this.AttributeName = name;
    }
}

export class quickKeySchemaElement implements DynamoDB.KeySchemaElement {
    AttributeName: string;
    KeyType: "HASH" | "RANGE";

    constructor(name: string, type: "HASH" | "RANGE") {
        this.AttributeName = name;
        this.KeyType = type;
    }
}

export class quickStreamSpecification implements DynamoDB.StreamSpecification {
    StreamEnabled: boolean;
    StreamViewType?: 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY';

    constructor(enabled: boolean, viewType?: 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY') {
        this.StreamEnabled = enabled;
        this.StreamViewType = viewType;
    }
}

export class currentTableDesc implements DynamoDB.DescribeTableOutput {
    Table: {
        StreamSpecification: DynamoDB.StreamSpecification;
        ProvisionedThroughputDescription: DynamoDB.ProvisionedThroughputDescription;
    }

    constructor(str?: quickStreamSpecification, through?: DynamoDB.ProvisionedThroughputDescription) {
        this.Table = {StreamSpecification: str, ProvisionedThroughputDescription: through};
    }
}

export class quickUpdateTable implements DynamoDB.UpdateTableInput {
    TableName: string;
    StreamSpecification?: quickStreamSpecification;
    ProvisionedThroughput?: DynamoDB.ProvisionedThroughput;

    constructor(name: string, spec?: quickStreamSpecification, throughput?: DynamoDB.ProvisionedThroughput) {
        this.TableName = name;
        if (spec) {
            this.StreamSpecification = spec;
        }
        if (throughput) {
            this.ProvisionedThroughput = throughput;
        }
    }
    
}