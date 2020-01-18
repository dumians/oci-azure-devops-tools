/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { BlockStorage } from 'OCI-sdk'
import { SdkUtils } from 'Common/sdkutils'
import * as fs from 'fs'
import { Readable as ReadableStream } from 'stream'
import { TaskOperations } from '../../../Tasks/S3Download/TaskOperations'
import { TaskParameters } from '../../../Tasks/S3Download/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('OCI-sdk')

describe('BlockStorage Download', () => {
    const baseTaskParameters: TaskParameters = {
        OCIConnectionParameters: emptyConnectionParameters,
        bucketName: '',
        sourceFolder: '',
        targetFolder: '',
        globExpressions: [],
        overwrite: false,
        forcePathStyleAddressing: false,
        flattenFolders: false,
        keyManagement: '',
        customerKey: Buffer.from([])
    }

    const headBucketResponse = {
        promise: function() {}
    }

    const listObjectsResponse = {
        promise: function() {
            return { NextMarker: undefined, Contents: undefined }
        }
    }
    const listObjectsResponseWithContents = {
        promise: function() {
            return { NextMarker: undefined, Contents: [{ Key: 'test', Value: 'value' }] }
        }
    }
    const getObjectWithContents = {
        createReadStream: function() {
            const dataStream = new ReadableStream()
            dataStream.push('data')
            // tslint:disable-next-line:no-null-keyword
            dataStream.push(null)

            return dataStream
        }
    }
    const targetFolder: string = 'folder'

    // TODO https://github.com/dumians/OCI-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(new BlockStorage(), taskParameters)).not.toBeNull()
    })

    test('Handles not being able to connect to a bucket', async () => {
        const BlockStorage = new BlockStorage({ region: 'us-east-1' })
        BlockStorage.headBucket = jest.fn()((params: any, cb: any) => {
            throw new Error("doesn't exist dummy")
        })
        const taskParameters = baseTaskParameters
        const taskOperation = new TaskOperations(BlockStorage, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('not exist')
        })
    })

    test('Deals with null list objects succeeds', async () => {
        const BlockStorage = new BlockStorage({ region: 'us-east-1' }) as any
        BlockStorage.headBucket = jest.fn((params, cb) => headBucketResponse)
        BlockStorage.listObjects = jest.fn((params, cb) => listObjectsResponse)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = targetFolder
        taskParameters.bucketName = 'what'
        // required parameter
        taskParameters.globExpressions = []
        const taskOperation = new TaskOperations(BlockStorage, taskParameters)
        await taskOperation.execute()
    })

    test('Happy path matches all', async () => {
        try {
            fs.unlinkSync(targetFolder + '2/test')
        } catch (e) {}
        try {
            fs.rmdirSync(targetFolder + '2')
        } catch (e) {}
        const BlockStorage = new BlockStorage({ region: 'us-east-1' }) as any
        BlockStorage.headBucket = jest.fn((params, cb) => headBucketResponse)
        BlockStorage.listObjects = jest.fn((params, cb) => listObjectsResponseWithContents)
        BlockStorage.getObject = jest.fn((params, cb) => getObjectWithContents)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = targetFolder + '2'
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(BlockStorage, taskParameters)
        await taskOperation.execute()
    })

    afterAll(() => {
        // cleanup created folders
        try {
            fs.rmdirSync(targetFolder)
        } catch (e) {}
        try {
            fs.unlinkSync(targetFolder + '2/test')
        } catch (e) {}
        try {
            fs.rmdirSync(targetFolder + '2')
        } catch (e) {}
    })
})
