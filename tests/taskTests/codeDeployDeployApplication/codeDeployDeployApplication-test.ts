/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CodeDeploy, BlockStorage } from 'OCI-sdk'
import { SdkUtils } from 'Common/sdkutils'
import fs = require('fs')
import path = require('path')
import { TaskOperations } from '../../../Tasks/CodeDeployDeployApplication/TaskOperations'
import {
    revisionSourceFromS3,
    revisionSourceFromWorkspace,
    TaskParameters
} from '../../../Tasks/CodeDeployDeployApplication/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

const defaultTaskParameters: TaskParameters = {
    OCIConnectionParameters: emptyConnectionParameters,
    applicationName: 'undefined',
    deploymentGroupName: 'undefined',
    deploymentRevisionSource: '',
    revisionBundle: '',
    bucketName: '',
    bundlePrefix: '',
    bundleKey: 'undefined',
    description: '',
    fileExistsBehavior: '',
    updateOutdatedInstancesOnly: false,
    ignoreApplicationStopFailures: false,
    outputVariable: '',
    timeoutInMins: 0
}

const emptyPromise = {
    promise: () => ({})
}

const codeDeployDeploymentId = {
    promise: () => ({ deploymentId: 'id' })
}

describe('CodeDeploy Deploy Application', () => {
    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/CodeDeployDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CodeDeploy(), new BlockStorage(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resources exists fails, fails task', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(new CodeDeploy(), new BlockStorage(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Application undefined does not exist')
        })
    })

    test('Verify deployment group exists fails, fails task', async () => {
        expect.assertions(1)
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new BlockStorage(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Deployment group undefined does not exist')
        })
    })

    test('Verify BlockStorage bucket exists fails, fails task', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new BlockStorage(), taskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Archive with key undefined does not exist')
        })
    })

    test('Wait for deployment, fails, fails task', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        taskParameters.bundleKey = '/whatever/wahtever'
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
        // the first argument of the callback is error so pass in an "error"
        codeDeploy.waitFor = jest.fn((arr1, arr2, cb) => cb(new Error('22'), undefined))
        const BlockStorage = new BlockStorage() as any
        BlockStorage.headObject = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, BlockStorage, taskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Error: Deployment failed undefined 22')
        })
    })

    test('Upload needed, packages properly, succeeds', async () => {
        expect.assertions(3)
        process.env.TEMP = __dirname
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromWorkspace
        taskParameters.revisionBundle = path.join(__dirname, '../../resources/codeDeployCode')
        taskParameters.applicationName = 'test'
        const BlockStorage = new BlockStorage() as any
        BlockStorage.upload = jest.fn(args => {
            expect(args.Bucket).toBe('')
            expect(args.Key).toContain('test.v')
            const dir = fs.readdirSync(__dirname)
            for (const file of dir) {
                if (path.extname(file) === '.zip') {
                    const stats = fs.statSync(path.join(__dirname, file))
                    const size = stats.size
                    expect(size).toBe(141)
                    break
                }
            }

            return emptyPromise
        })
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
        codeDeploy.waitFor = jest.fn((thing, thing2, cb) => {
            cb()

            return { promise: () => undefined }
        })
        const taskOperations = new TaskOperations(codeDeploy, BlockStorage, taskParameters)
        await taskOperations.execute()
    })

    test('Upload not needed, succeeds', async () => {
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        taskParameters.applicationName = 'test'
        taskParameters.bundleKey = path.join(__dirname, '../../resources/codeDeployCode.zip')
        const BlockStorage = new BlockStorage() as any
        BlockStorage.headObject = jest.fn(() => emptyPromise)
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
        codeDeploy.waitFor = jest.fn((thing, thing2, cb) => {
            cb()

            return { promise: () => undefined }
        })
        const taskOperations = new TaskOperations(codeDeploy, BlockStorage, taskParameters)
        await taskOperations.execute()
    })
})
