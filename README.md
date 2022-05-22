# Welcome to CDK - ECS TypeScript example.

![cdk test](https://github.com/dcotelo/cdk-ecs-example/actions/workflows/test.yml/badge.svg)

This is a project for TypeScript development with CDK that incliudes a basic example usage for ECS with Fargate and a custom construct for dynamo db tables.


The `cdk.json` file tells the CDK Toolkit how to execute your app.

To setup AWS CLI credentials check the documentation [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)



## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Custom parameters
`desiredCount` is the amount of tasks that the ECS Fargate services should have.

`dockerImageProp` is the Dockerfile location refrenced in the github action [here](https://github.com/dcotelo/cdk-ecs-example/blob/master/.github/workflows/test.yml#L26)