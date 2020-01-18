/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Function } from 'OCI-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaInvokeFunction/TaskOperations'
import { TaskParameters } from '../../../Tasks/LambdaInvokeFunction/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

const baseTaskParameters: TaskParameters = {
    OCIConnectionParameters: emptyConnectionParameters,
    functionName: 'coolfunction',
    payload: '',
    invocationType: '',
    logType: '',
    outputVariable: ''
}

const OCIResponseThrows = {
    promise: function() {
        throw new Error('function nonexistent')
    }
}

const getFunctionSucceeds = {
    promise: function() {}
}

const invokeLambdaSucceeds = {
    promise: function() {
        return {
            Payload: 'payload'
        }
    }
}

describe('Function Invoke', () => {
    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/LambdaInvokeFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new Function(), baseTaskParameters)).not.toBeNull()
    })

    test("Fails when Function doesn't exist", async () => {
        expect.assertions(1)
        const Function = new Function() as any
        Function.getFunctionConfiguration = jest.fn(() => OCIResponseThrows)
        const taskOperations = new TaskOperations(Function, baseTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('coolfunction does not exist'))
    })

    test('Fails when Function invoke fails', async () => {
        expect.assertions(1)
        const Function = new Function() as any
        Function.getFunctionConfiguration = jest.fn(() => getFunctionSucceeds)
        Function.invoke = jest.fn(() => OCIResponseThrows)
        const taskOperations = new TaskOperations(Function, baseTaskParameters)
        // it re-throws the exception, so we check for that
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('function nonexistent'))
    })

    test('Happy path, reads function invoke output', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.outputVariable = 'LambdaInvokeResult'
        const Function = new Function() as any
        Function.getFunctionConfiguration = jest.fn(() => getFunctionSucceeds)
        Function.invoke = jest.fn(() => invokeLambdaSucceeds)
        const taskOperations = new TaskOperations(Function, taskParameters)
        await taskOperations.execute()
        const taskOperationsWithBase = new TaskOperations(Function, baseTaskParameters)
        await taskOperationsWithBase.execute()
        expect(Function.invoke).toBeCalledTimes(2)
        expect(Function.getFunctionConfiguration).toBeCalledTimes(2)
    })
})
