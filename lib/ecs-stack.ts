import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import CustomTable from './dynamodb/custom_table';


interface DockerImageProps extends cdk.StackProps {
  dockerImageProp: DockerImageAsset,
}

export class EcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: DockerImageProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc,
      //enable container insights for better observability 
      containerInsights:true
    });


    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 6, // Default is 1
      taskImageOptions: {
        //use our own image
        image: ecs.ContainerImage.fromDockerImageAsset(props.dockerImageProp),
        containerPort: 3000,
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true, // Default is false,
    });

    //add custom table construct
    const prefix: string = "DEV"; //table prefix sholud be dynamic between environments
    const backupTag: string = "myBackupPlan"; // add table to a tag based backup plan

    const custom_table: CustomTable = new CustomTable(this, 'MY_CUSTOM_TABLE', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    }, prefix, backupTag);


  }
}
