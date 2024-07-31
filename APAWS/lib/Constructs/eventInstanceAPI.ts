
import { Construct } from "constructs";
import * as awsLambda from 'aws-cdk-lib/aws-lambda';
/**
 * Needed lambdas:
 * LGetMediaForParticipant - Takes a participantCode and returns all media for that participant
 * - Src path: eventInstance/Lambdas/LGetMediaForParticipant.ts
 * LRemoveMedias - Takes an array of ingress ids and removes all related data from the eventInstance
 * - Src path: eventInstance/Lambdas/LRemoveMedias.ts
 */
export class EventInstanceAPI extends Construct {
    public readonly LGetMediaForParticipant: awsLambda.Function;
    public readonly LRemoveMedias: awsLambda.Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.LGetMediaForParticipant = new awsLambda.Function(this, 'LGetMediaForParticipant', {
            runtime: awsLambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: awsLambda.Code.fromAsset('eventInstance/Lambdas/LGetMediaForParticipant'),
        });

        this.LRemoveMedias = new awsLambda.Function(this, 'LRemoveMedias', {
            runtime: awsLambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: awsLambda.Code.fromAsset('eventInstance/Lambdas/LRemoveMedias'),
        });
    }
}