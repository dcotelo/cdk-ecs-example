import { Construct } from 'constructs';
import {Stack,StackProps,RemovalPolicy} from 'aws-cdk-lib';
import { Cluster,ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService, } from 'aws-cdk-lib/aws-ecs-patterns';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import CustomTable from './dynamodb/custom_table';
import internal = require('stream');


interface DockerImageProps extends StackProps {
  dockerImageProp: DockerImageAsset,
  desiredCount:number,
}

export class EcsStack extends Stack {
  constructor(scope: Construct, id: string, props: DockerImageProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new Cluster(this, "MyCluster", {
      vpc: vpc,
      //enable container insights for better observability 
      containerInsights:true
    });


    // Create a load-balanced Fargate service and make it public
    new ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: props.desiredCount, // Default is 1
      taskImageOptions: {
        //use our own image
        image: ContainerImage.fromDockerImageAsset(props.dockerImageProp),
        containerPort: 3000,
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true, // Default is false,
    });

    //add custom table construct
    const prefix: string = "DEV"; //table prefix sholud be dynamic between environments
    const backupTag: string = "myBackupPlan"; // add table to a tag based backup plan

    const custom_table: CustomTable = new CustomTable(this, 'MY_CUSTOM_TABLE', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    }, prefix, backupTag);


  }
}
