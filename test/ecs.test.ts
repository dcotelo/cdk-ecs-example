import {App, Stack, Tags} from 'aws-cdk-lib';
import * as Ecs from '../lib/ecs-stack';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import '@aws-cdk/assert/jest';

const app = new App();
const ECSTestStack = new Stack(app, "MyECSTestStack");

// WHEN
    //create and register image
    const myCustomImage = new DockerImageAsset(ECSTestStack, "golang-example-app", {
      directory: 'golang-example-app/',
    });

const stack = new Ecs.EcsStack(ECSTestStack, 'MyECSTestStack',{dockerImageProp:myCustomImage});

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

test('ECS-task definition', () => {
  expect(stack).toHaveResource('AWS::ECS::TaskDefinition', {
    Cpu: "512",
    Memory: "2048",
  });
});

test('ECS-Service', () => {
  expect(stack).toHaveResource("AWS::ECS::Service", {
    LaunchType: 'FARGATE',
    DesiredCount: 6,
    HealthCheckGracePeriodSeconds: 60
  });
});


