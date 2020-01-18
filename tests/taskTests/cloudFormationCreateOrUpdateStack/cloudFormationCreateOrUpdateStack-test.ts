/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, BlockStorage } from 'OCI-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskOperations'
import { TaskParameters } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

const defaultTaskParameters: TaskParameters = {
    OCIConnectionParameters: emptyConnectionParameters,
    stackName: '',
    templateSource: '',
    templateFile: '',
    s3BucketName: '',
    s3ObjectKey: '',
    templateUrl: '',
    templateParametersSource: '',
    templateParametersFile: '',
    templateParameters: '',
    useChangeSet: false,
    changeSetName: '',
    description: '',
    autoExecuteChangeSet: false,
    capabilityIAM: false,
    capabilityNamedIAM: false,
    capabilityAutoExpand: false,
    roleARN: '',
    notificationARNs: [],
    resourceTypes: [],
    tags: [],
    monitorRollbackTriggers: false,
    monitoringTimeInMinutes: 0,
    rollbackTriggerARNs: [],
    onFailure: '',
    warnWhenNoWorkNeeded: false,
    outputVariable: '',
    captureStackOutputs: '',
    captureAsSecuredVars: false,
    timeoutInMins: 30
}

// NOTE: these tests are too hard to write, fucntional tests will not work the module as is. We need to break
// up the moudule so that we can actually test, see issue https://github.com/dumians/OCI-vsts-tools/issues/213
describe('Cloud Formation create or update', () => {
    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), new BlockStorage(), defaultTaskParameters)).not.toBeNull()
    })
})
