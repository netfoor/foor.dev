import { defineFunction } from "@aws-amplify/backend";



export const imageOptimizationFunction = defineFunction({
    name: 'imageOptimizationFunction',
    entry: './handler.ts',
    timeoutSeconds: 30,
    resourceGroupName: 'storage',
    layers: {
        "sharp": "arn:aws:lambda:us-east-1:253490760608:layer:netfoor-layer-website:1",
        "@aws-sdk/client-dynamodb": "arn:aws:lambda:us-east-1:253490760608:layer:netfoor-layer-website:1",
        "@aws-sdk/lib-dynamodb": "arn:aws:lambda:us-east-1:253490760608:layer:netfoor-layer-website:1"
    }
})


