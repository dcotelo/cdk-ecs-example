import { Construct } from 'constructs';
import {Stack,StackProps,RemovalPolicy} from 'aws-cdk-lib';
import { Cluster,ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedEc2Service, ApplicationLoadBalancedFargateService, } from 'aws-cdk-lib/aws-ecs-patterns';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import CustomTable from './dynamodb/custom_table';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

enum ServiceType {
Fargate,
EC2
}


interface EcsClusterProps extends StackProps {
  dockerImageProp: DockerImageAsset,
  desiredCount:number,
  EcsServiceTypeProps?:ServiceType
}

export class EcsStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsClusterProps) {
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


    if (props.EcsServiceTypeProps === ServiceType.Fargate) {
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
    }

    if (props.EcsServiceTypeProps === ServiceType.EC2) {
      new ApplicationLoadBalancedEc2Service(this, "MyEc2Service", {
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

      // Add capacity to it
      cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
        instanceType: new ec2.InstanceType("t2.micro"),
        desiredCapacity: 3,
});
    }


    //add custom table construct
    const prefix: string = "DEV"; //table prefix sholud be dynamic between environments
    const backupTag: string = "myBackupPlan"; // add table to a tag based backup plan

    const custom_table: CustomTable = new CustomTable(this, 'MY_CUSTOM_TABLE', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    }, prefix, backupTag);


  }
}
