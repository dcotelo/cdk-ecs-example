import {App, Stack, Tags} from 'aws-cdk-lib';
import * as Ecs from '../lib/ecs-stack';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import '@aws-cdk/assert/jest';

enum ServiceType {
  Fargate,
  EC2
  }

const app = new App();
const ECSEC2TestStack = new Stack(app, "MyECSEC2TestStack");

// WHEN
    //create and register image
    const myCustomImage = new DockerImageAsset(ECSEC2TestStack, "golang-example-app", {
      directory: 'golang-example-app/',
    });

const stack = new Ecs.EcsStack(ECSEC2TestStack, 'MyECSTestStack',{dockerImageProp:myCustomImage,desiredCount:6,EcsServiceTypeProps:ServiceType.EC2});

test('VPC', () => {
  expect(stack).toHaveResource('AWS::EC2::VPC', {
    EnableDnsHostnames: true,
    EnableDnsSupport: true,
  });
});

test('Internet Access', () => {
  expect(stack).toHaveResource('AWS::EC2::Route', {
    DestinationCidrBlock: "0.0.0.0/0"
  });
});


test('ECS-Service', () => {
  expect(stack).toHaveResource("AWS::ECS::Service", {
    LaunchType: 'EC2',
    DesiredCount: 6,
    HealthCheckGracePeriodSeconds: 60
  });
});


