import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CaylentEcs from '../lib/caylent-ecs-stack';
import '@aws-cdk/assert/jest';

const app = new cdk.App();
// WHEN
const stack = new CaylentEcs.CaylentEcsStack(app, 'MyECSTestStack');

/* test('Empty Stack', () => {

  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
}); */

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


