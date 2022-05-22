import {App,Stack} from 'aws-cdk-lib';
import * as Ecs from '../lib/ecs-stack';
import '@aws-cdk/assert/jest';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { SynthUtils } from '@aws-cdk/assert';


const app = new App();

const DynamoTestStack = new Stack(app, "MyDynamoTestStack");

// WHEN
const myCustomImage = new DockerImageAsset(DynamoTestStack, "golang-example-app", {
    directory: 'golang-example-app/',
  });
const stack = new Ecs.EcsStack(DynamoTestStack, 'MyDynamoTestStack',{dockerImageProp:myCustomImage,desiredCount:6});

test('DynamoDB - Snapshot', () => {
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('DynamoDB', () => {
    expect(stack).toHaveResource("AWS::DynamoDB::Table", {
    });
});