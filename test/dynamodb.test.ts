import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Ecs from '../lib/ecs-stack';
import '@aws-cdk/assert/jest';
import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";
import { SynthUtils } from '@aws-cdk/assert';

const app = new cdk.App();

const DynamoTestStack = new cdk.Stack(app, "MyDynamoTestStack");

// WHEN
const myCustomImage = new DockerImageAsset(DynamoTestStack, "golang-example-app", {
    directory: 'golang-example-app/',
  });
const stack = new Ecs.EcsStack(DynamoTestStack, 'MyDynamoTestStack',{dockerImageProp:myCustomImage});

test('DynamoDB - Snapshot', () => {
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('DynamoDB', () => {
    expect(stack).toHaveResource("AWS::DynamoDB::Table", {
    });
});