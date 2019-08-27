const AWS = require("aws-sdk");
const codeDeploy = new AWS.CodeDeploy({ apiVersion: "2014-10-06" });
const lambda = new AWS.Lambda();

exports.handler = (event, context, callback) => {
    console.log("Entering PostTraffic Hook!");

    const deploymentId = event.DeploymentId;
    const lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    const functionToTest = process.env.NewVersion;

    console.log(`Testing new function version: ${functionToTest}`);

    const lambdaParams = {
        FunctionName: functionToTest,
        InvocationType: "RequestResponse"
    };
    let status = "Failed";

    lambda.invoke(lambdaParams, (error, data) => {
        console.log(`Lambda Data ${JSON.stringify(data)}`);
        const response = JSON.parse(data.Payload);

        if (response.body === "Hello World") {
            status = "Succeeded";
        };

        const params = {
            deploymentId,
            lifecycleEventHookExecutionId,
            status // status can be "Succeeded" or "Failed"
        };

        return codeDeploy.putLifecycleEventHookExecutionStatus(params).promise()
            .then(data => callback(null, "Validation test succeeded"))
            .catch(err => callback("Validation test failed"));
    });
};
