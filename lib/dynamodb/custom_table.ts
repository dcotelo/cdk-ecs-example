import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { StreamViewType } from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';

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
    //class variables
    options: DynamoOptions;
    name: string;
    readonly Table: dynamodb.Table;
    readonly Topic: sns.Topic;
    backupPlan: string;

    tags: cdk.TagManager;
    /**
   * @param scope CDK class, it's used to build 
   * @param id Id of the cloudformation stack
   * @param props Config variables for the stack creation, based on the environment
   * 
   * @method constructor Create the classes for constructors
   * 
  */
    constructor(scope: cdk.Construct, id: string, options: DynamoOptions = {
        //default value for billing is pay per request
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        //default value for removal policy is retain
        removalPolicy: cdk.RemovalPolicy.RETAIN
    }, prefix: string, backupPlan: string) {
        super(scope, id);
        this.options = options;
        this.name = prefix + `_MY_CUSTOM_TABLE`
        //add a backup plan tag
        this.backupPlan = backupPlan;

        //sns 
        this.Topic = new sns.Topic(this, 'Topic', {
            displayName: this.name + `_TOPIC`
        });

        this.Table = new dynamodb.Table(scope, this.name, {
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

        new cdk.CfnOutput(this, 'Table-ARN', { value: this.Table.tableArn });
        new cdk.CfnOutput(this, 'Topic-ARN', { value: this.Topic.topicArn });

    }
}
