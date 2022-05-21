import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CaylentEcs from '../lib/ecs-stack';
import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';

const app = new cdk.App();
// WHEN

const stack = new CaylentEcs.EcsStack(app, 'MyDynamoTestStack');

test('DynamoDB - Snapshot', () => {
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('DynamoDB', () => {
    expect(stack).toHaveResource("AWS::DynamoDB::Table", {
    });
});