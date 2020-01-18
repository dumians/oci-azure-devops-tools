/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { IAM, Function } from 'OCI-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaDeployFunction/TaskOperations'
import { deployCodeAndConfig, deployCodeOnly, TaskParameters } from '../../../Tasks/LambdaDeployFunction/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

const baseTaskParameters: TaskParameters = {
    OCIConnectionParameters: emptyConnectionParameters,
    deploymentMode: '',
    functionName: 'undefined1',
    functionHandler: '',
    runtime: '',
    codeLocation: '',
    localZipFile: '',
    s3Bucket: '',
    s3ObjectKey: '',
    s3ObjectVersion: undefined,
    roleARN: '',
    description: '',
    layers: [],
    memorySize: 128,
    timeout: 3,
    publish: false,
    deadLetterARN: '',
    kmsKeyARN: '',
    environment: [],
    tags: [],
    securityGroups: [],
    subnets: [],
    tracingConfig: '',
    outputVariable: ''
}

const getFunctionSucceeds = {
    promise: function() {}
}

const getFunctionFails = {
    promise: function() {
        throw new Error('does not exist')
    }
}

const updateFunctionFails = {
    promise: function() {
        throw new Error('update failed')
    }
}

const updateFunctionSucceeds = {
    promise: function() {
        return {
            FunctionArn: 'arn:yes'
        }
    }
}

const getIamRoleSucceeds = {
    promise: function() {
        return {
            Role: {
                Arn: 'arn:yes'
            }
        }
    }
}

describe('Function Deploy Function', () => {
    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/LambdaDeployFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new IAM(), new Function(), baseTaskParameters)).not.toBeNull()
    })

    test('Unknown deployment mode fails', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = 'to the moon'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Unrecognized deployment mode to the moon'))
        expect(Function.getFunction).toBeCalledTimes(1)
    })

    test('Fails to update fails', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        Function.updateFunctionCode = jest.fn(() => updateFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Error while updating function code'))
        expect(Function.getFunction).toBeCalledTimes(1)
        expect(Function.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Deploy only Function does not exist fails', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Function undefined1 does not exist'))
        expect(Function.getFunction).toBeCalledTimes(1)
    })

    test('Deploy only Function exists calls update', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        Function.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
        expect(Function.getFunction).toBeCalledTimes(1)
        expect(Function.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Deploy and config does not exist calls create', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionFails)
        Function.createFunction = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
        expect(Function.getFunction).toBeCalledTimes(1)
        expect(Function.createFunction).toBeCalledTimes(1)
    })

    test('Deploy and config exists calls update', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        Function.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        Function.updateFunctionConfiguration = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
        expect(Function.getFunction).toBeCalledTimes(1)
        expect(Function.updateFunctionCode).toBeCalledTimes(1)
        expect(Function.updateFunctionConfiguration).toBeCalledTimes(1)
    })

    test('Create function adds fields if they exist', async () => {
        expect.assertions(5)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.tracingConfig = 'XRay'
        taskParameters.securityGroups = ['security']
        taskParameters.tags = ['tag1=2', 'tag2=22']
        taskParameters.environment = ['tag1=2', 'tag2=1']
        taskParameters.layers = ['arn:thing:whatever:version']
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionFails)
        Function.createFunction = jest.fn((args: any) => {
            expect(args.Environment.Variables).toStrictEqual({ tag1: '2', tag2: '1' })
            expect(args.Tags).toStrictEqual({ tag1: '2', tag2: '22' })
            expect(args.VpcConfig.SecurityGroupIds).toStrictEqual(['security'])
            expect(args.TracingConfig).toBeUndefined()
            expect(args.Layers.length).toBe(1)

            return updateFunctionSucceeds
        })
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
    })

    test('Update function adds fields if they exist', async () => {
        expect.assertions(4)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.securityGroups = ['security']
        taskParameters.environment = ['tag1=2', 'tag2=1']
        taskParameters.tags = ['tag1=5', 'tag=abc']
        taskParameters.tracingConfig = 'XRay'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        Function.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        Function.updateFunctionConfiguration = jest.fn(args => {
            expect(args.Environment.Variables).toStrictEqual({ tag1: '2', tag2: '1' })
            expect(args.VpcConfig.SecurityGroupIds).toStrictEqual(['security'])
            expect(args.TracingConfig).toBeUndefined()

            return updateFunctionSucceeds
        })
        Function.tagResource = jest.fn(args => {
            expect(args.Tags).toStrictEqual({ tag1: '5', tag: 'abc' })

            return updateFunctionSucceeds
        })
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
    })

    test('Update function does not call functions when it should not', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.tags = []
        taskParameters.tracingConfig = 'XRay'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionSucceeds)
        Function.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        Function.updateFunctionConfiguration = jest.fn(() => updateFunctionSucceeds)
        const tagResourceFunction = jest.fn()
        Function.tagResource = tagResourceFunction
        const taskOperations = new TaskOperations(new IAM(), Function, taskParameters)
        await taskOperations.execute()
        expect(tagResourceFunction).toHaveBeenCalledTimes(0)
    })

    test('IAM call when no role arn specified works', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'name'
        const Function = new Function() as any
        Function.getFunction = jest.fn(() => getFunctionFails)
        const iam = new IAM() as any
        iam.getRole = jest.fn(() => getIamRoleSucceeds)
        const taskOperations = new TaskOperations(iam, Function, taskParameters)
        await taskOperations.execute().catch(e => undefined)
        expect(iam.getRole).toBeCalledTimes(1)
    })
})
