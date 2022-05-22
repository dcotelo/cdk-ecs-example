import {Tags,RemovalPolicy,TagManager,CfnOutput} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BillingMode,Table,StreamViewType,AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Topic } from 'aws-cdk-lib/aws-sns';


export interface DynamoOptions {
    /**
     * DynamoDB's Read/Write capacity modes.
     * {@link BillingMode}
     */
    readonly billingMode?: BillingMode;

    /**
     * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
     * the new table, and it will remain in your account until manually deleted. By setting
     * the policy to DESTROY, cdk destroy will delete the table (even if it has data in it)
     * {@link RemovalPolicy}
     */
    readonly removalPolicy?: RemovalPolicy;
}

/**
 * This class was developed to implements a constructor for Dynamo Object Session
 * requeted by Orchestrator team and used to keep user loged info
 * Use {@link DynamoOptions} for all table properties
 * @link cdk.Construct
 */
export default class CustomTable extends Construct {
    //class variables
    options: DynamoOptions;
    name: string;
    readonly Table: Table;
    readonly Topic: Topic;
    backupPlan: string;

    tags: TagManager;
    /**
   * @param scope CDK class, it's used to build 
   * @param id Id of the cloudformation stack
   * @param props Config variables for the stack creation, based on the environment
   * 
   * @method constructor Create the classes for constructors
   * 
  */
    constructor(scope: Construct, id: string, options: DynamoOptions = {
        //default value for billing is pay per request
        billingMode: BillingMode.PAY_PER_REQUEST,
        //default value for removal policy is retain
        removalPolicy: RemovalPolicy.RETAIN
    }, prefix: string, backupPlan: string) {
        super(scope, id);
        this.options = options;
        this.name = prefix + `_MY_CUSTOM_TABLE`
        //add a backup plan tag
        this.backupPlan = backupPlan;

        //sns 
        this.Topic = new Topic(this, 'Topic', {
            displayName: this.name + `_TOPIC`
        });

        this.Table = new Table(scope, this.name, {
            // It's default but it was used to show the config
            partitionKey: {
                name: 'MY_CUSTOM_TABLE_ID',
                type: AttributeType.STRING
            },
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            tableName: this.name,
            pointInTimeRecovery: true,
            removalPolicy: options.removalPolicy,
            billingMode: options.billingMode
        });

        Tags.of(this).add('backup-plan', this.backupPlan);

        new CfnOutput(this, 'Table-ARN', { value: this.Table.tableArn });
        new CfnOutput(this, 'Topic-ARN', { value: this.Topic.topicArn });

    }
}
