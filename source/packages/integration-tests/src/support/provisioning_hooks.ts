/*********************************************************************************************************************
 *  Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

import { Before, setDefaultTimeout } from '@cucumber/cucumber';

import AWS = require('aws-sdk');
setDefaultTimeout(30 * 1000);
/*
    Cucumber describes current scenario context as “World”. It can be used to store the state of the scenario
    context (you can also define helper methods in it). World can be access by using the this keyword inside
    step functions (that’s why it’s not recommended to use arrow functions).
 */
// tslint:disable:no-invalid-this
// tslint:disable:only-arrow-functions

const templateBucket = process.env.PROVISIONING_TEMPLATES_BUCKET;
const templatePrefix = process.env.PROVISIONING_TEMPLATES_PREFIX;
// const templateSuffix = config.get('provisioning.templates.suffix') as string;

const s3 = new AWS.S3({region: process.env.AWS_REGION});
const iot = new AWS.Iot({region: process.env.AWS_REGION});

async function teardown() {
    // S3 cleanup - remove template from bucket
    const deleteObjectRequest = {
        Bucket: templateBucket,
        Key: `${templatePrefix}IntegrationTestTemplate.json`
    };
    await s3.deleteObject(deleteObjectRequest).promise();

    // IoT cleanup - delete cert, policy, thing
    const thingName = 'IntegrationTestThing';
    const policyName = 'IntegrationTestPolicy';

    let certificateId;
    try {
        const thingPrincipals = await iot.listThingPrincipals({thingName}).promise();
        const certArn = thingPrincipals.principals[0];
        certificateId = certArn.split('/')[1];

        await iot.detachPrincipalPolicy({principal: certArn, policyName}).promise();
        await iot.detachThingPrincipal({thingName, principal: certArn}).promise();
    } catch (err) {
        if (err.code!=='ResourceNotFoundException') {
            throw err;
        }
    }

    try {
        if (certificateId!==undefined) {
            await iot.updateCertificate({certificateId, newStatus: 'INACTIVE'}).promise();
            await iot.deleteCertificate({certificateId}).promise();
        }
    } catch (err) {
        if (err.code!=='ResourceNotFoundException') {
            throw err;
        }
    }

    try {
        await iot.deletePolicy({policyName}).promise();
    } catch (err) {
        if (err.code!=='ResourceNotFoundException') {
            throw err;
        }
    }

    try {
        await iot.deleteThing({thingName}).promise();
    } catch (err) {
        if (err.code!=='ResourceNotFoundException') {
            throw err;
        }
    }
}

Before({tags: '@setup_thing_provisioning'}, async function () {
    await teardown();

    // create a provisioning template
    const integrationTestTemplate = {
        Parameters: {
            ThingName: {
                Type: 'String'
            },
            CSR: {
                Type: 'String'
            }
        },
        Resources: {
            thing: {
                Type: 'AWS::IoT::Thing',
                Properties: {
                    ThingName: {
                        Ref: 'ThingName'
                    }
                }
            },
            certificate : {
                Type : 'AWS::IoT::Certificate',
                Properties : {
                    CertificateSigningRequest: {Ref: 'CSR'}
                }
            },
            policy : {
                Type: 'AWS::IoT::Policy',
                Properties: {
                    PolicyName: 'IntegrationTestPolicy'
                }
            }
        }
    };
    // upload to S3
    const putObjectRequest = {
        Bucket: templateBucket,
        Key: `${templatePrefix}IntegrationTestTemplate.json`,
        Body: JSON.stringify(integrationTestTemplate)
    };
    await s3.putObject(putObjectRequest).promise();

    // create an IoT policy (if not exists)
    const policyName = 'IntegrationTestPolicy';
    try {
        await iot.getPolicy({policyName}).promise();
    } catch (e) {
        if (e.name==='ResourceNotFoundException') {
            const integrationTestPolicy = {
                policyName,
                policyDocument: '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Action": "iot:*","Resource": "*"}]}'};
            await iot.createPolicy(integrationTestPolicy).promise();
        }
    }
});

Before({tags: '@teardown_thing_provisioning'}, async function () {
    await teardown();
});
