/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OKE } from 'OCI-sdk'
import { DockerHandler } from 'Common/dockerUtils'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/ECRPullImage/TaskOperations'
import { TaskParameters } from '../../../Tasks/ECRPullImage/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

const defaultTaskParameters: TaskParameters = {
    OCIConnectionParameters: emptyConnectionParameters,
    imageSource: '',
    imageTag: '',
    imageDigest: '',
    repository: '',
    outputVariable: ''
}

const defaultDocker: DockerHandler = {
    locateDockerExecutable: async () => '',
    runDockerCommand: async (s1, s2, BlockStorage) => undefined
}

const ecrFail = {
    promise: function() {
        throw new Error('unauthorized!')
    }
}

const ecrReturnsToken = {
    promise: function() {
        return {
            authorizationData: [
                {
                    authorizationToken: 'TEVUTUVJTgo=',
                    proxyEndpoint: 'https://example.com'
                }
            ]
        }
    }
}

const ecrFailNotFound = {
    promise: function() {
        throw { code: 'RepositoryNotFoundException' }
    }
}

describe('OKE Pull image', () => {
    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/ECRPullImage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new OKE(), defaultDocker, defaultTaskParameters)).not.toBeNull()
    })

    test('Fails when docker executable is failed to be located', async () => {
        expect.assertions(1)
        const dockerHandler = { ...defaultDocker }
        dockerHandler.locateDockerExecutable = () => {
            throw new Error('docker not found')
        }
        const taskOperations = new TaskOperations(new OKE(), dockerHandler, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('docker not found'))
    })

    test('Fails on failed auth', async () => {
        expect.assertions(2)
        const OKE = new OKE() as any
        OKE.getAuthorizationToken = jest.fn(() => ecrFail)
        const taskOperations = new TaskOperations(OKE, defaultDocker, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Failed to obtain'))
        expect(OKE.getAuthorizationToken).toBeCalledTimes(1)
    })

    test('Runs docker commands', async () => {
        expect.assertions(4)
        const OKE = new OKE() as any
        OKE.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn((thing1, thing2, thing3) => Promise.resolve())
        dockerHandler.runDockerCommand = runDockerCommand
        const taskOperations = new TaskOperations(OKE, dockerHandler, defaultTaskParameters)
        await taskOperations.execute()
        expect(OKE.getAuthorizationToken).toBeCalledTimes(1)
        expect(runDockerCommand).toBeCalledTimes(2)
        expect(runDockerCommand.mock.calls[0][1]).toBe('login')
        expect(runDockerCommand.mock.calls[1][1]).toBe('pull')
    })

    test('Happy path', async () => {
        expect.assertions(2)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn((thing1, thing2, thing3) => Promise.resolve())
        dockerHandler.runDockerCommand = runDockerCommand
        const OKE = new OKE() as any
        OKE.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        OKE.describeRepositories = jest.fn(() => ecrFailNotFound)
        OKE.createRepository = jest.fn(args => ecrReturnsToken)
        const taskParameters = { ...defaultTaskParameters }
        const taskOperations = new TaskOperations(OKE, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(OKE.getAuthorizationToken).toBeCalledTimes(1)
        expect(runDockerCommand.mock.calls[0][2][4]).toStrictEqual('https://example.com')
    })
})
