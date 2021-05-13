import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { StreamViewType } from '@aws-cdk/aws-dynamodb';

export interface DynamoOptions {
    /**
     * DynamoDB's Read/Write capacity modes.
     * {@link BillingMode}
     */
    readonly billingMode?: dynamodb.BillingMode;

    /**
     * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
     * the new table, and it will remain in your account until manually deleted. By setting
     * the policy to DESTROY, cdk destroy will delete the table (even if it has data in it)
     * {@link RemovalPolicy}
     */
    readonly removalPolicy?: cdk.RemovalPolicy;
}

/**
 * This class was developed to implements a constructor for Dynamo Object Session
 * requeted by Orchestrator team and used to keep user loged info
 * Use {@link DynamoOptions} for all table properties
 * @link cdk.Construct
 */
export default class CustomTable extends cdk.Construct {
    options: DynamoOptions;
    name: string;
    CustomTable: dynamodb.Table;
    backupPlan: string;

    tags: cdk.TagManager;
    /**
   * @param scope CDK class, it's used to build 
   * @param id Id of the cloudformation stack
   * @param props Config variables for the stack creation, based on the environment
   * 
   * @method constructor Class builder for MiBanco Infrastructure stack. Setups the environment and create the classes for constructors
   * 
  */
    constructor(scope: cdk.Construct, id: string, options: DynamoOptions = {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.RETAIN
    }, prefix: string, backupPlan: string) {
        super(scope, id);
        this.options = options;
        this.name = prefix + `_MY_CUSTOM_TABLE`
        //add a backup plan tag
        this.backupPlan = backupPlan;

        this.CustomTable = new dynamodb.Table(scope, this.name, {
            // It's default but it was used to show the config
            partitionKey: {
                name: 'MY_CUSTOM_TABLE_ID',
                type: dynamodb.AttributeType.STRING
            },
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            tableName: this.name,
            pointInTimeRecovery: true,
            removalPolicy: options.removalPolicy,
            billingMode: options.billingMode
        });

        cdk.Tags.of(this).add('backup-plan', this.backupPlan);


    }
}
