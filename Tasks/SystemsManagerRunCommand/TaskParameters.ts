/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOptional, getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const fromInstanceIds: string = 'fromInstanceIds'
export const fromTags: string = 'fromTags'
export const fromBuildVariable: string = 'fromBuildVariable'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    documentName: string
    documentParameters: string
    serviceRoleARN: string
    comment: string
    instanceSelector: string
    instanceIds: string[]
    instanceTags: string[]
    instanceBuildVariable: string
    maxConcurrency: string
    maxErrors: string
    timeout: string
    notificationArn: string | undefined
    notificationEvents: string | undefined
    notificationType: string | undefined
    outputS3BucketName: string
    outputS3KeyPrefix: string
    commandIdOutputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        documentName: getInputRequired('documentName'),
        documentParameters: getInputOrEmpty('documentParameters'),
        serviceRoleARN: getInputOrEmpty('serviceRoleARN'),
        comment: getInputOrEmpty('comment'),
        instanceSelector: getInputRequired('instanceSelector'),
        maxConcurrency: getInputOrEmpty('maxConcurrency'),
        maxErrors: getInputOrEmpty('maxErrors'),
        timeout: getInputOrEmpty('timeout'),
        notificationArn: getInputOptional('notificationArn'),
        notificationEvents: getInputOptional('notificationEvents'),
        notificationType: getInputOptional('notificationType'),
        outputS3BucketName: getInputOrEmpty('outputS3BucketName'),
        outputS3KeyPrefix: getInputOrEmpty('outputS3KeyPrefix'),
        commandIdOutputVariable: getInputOrEmpty('commandIdOutputVariable'),
        instanceIds: [],
        instanceTags: [],
        instanceBuildVariable: ''
    }

    switch (parameters.instanceSelector) {
        case fromInstanceIds:
            parameters.instanceIds = tl.getDelimitedInput('instanceIds', '\n', true)
            break

        case fromTags:
            parameters.instanceTags = tl.getDelimitedInput('instanceTags', '\n', true)
            break

        case fromBuildVariable:
            parameters.instanceBuildVariable = getInputRequired('instanceBuildVariable')
            break

        default:
            throw new Error(`Unknown value for instances selection: ${parameters.instanceSelector}`)
    }

    return parameters
}
