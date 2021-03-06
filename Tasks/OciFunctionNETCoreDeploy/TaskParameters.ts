/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

// option values for the 'deploymentType' property
export const deployFunction: string = 'deployFunction'
export const deployServerless: string = 'deployServerless'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    command: string
    packageOnly: boolean
    lambdaProjectPath: string
    // Used in package-only mode, contains either the filename and path of the
    // output package for a Function function, or the template output path when
    // packaging a serverless app
    packageOutputFile: string
    functionHandler: string
    functionName: string
    functionRole: string
    functionMemory: number | undefined
    functionTimeout: number | undefined
    stackName: string
    s3Bucket: string
    s3Prefix: string
    additionalArgs: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        command: getInputRequired('command'),
        packageOnly: tl.getBoolInput('packageOnly', true),
        lambdaProjectPath: tl.getPathInput('lambdaProjectPath', true, true),
        packageOutputFile: '',
        functionHandler: getInputOrEmpty('functionHandler'),
        functionName: getInputOrEmpty('functionName'),
        functionRole: getInputOrEmpty('functionRole'),
        functionMemory: undefined,
        functionTimeout: undefined,
        stackName: getInputOrEmpty('stackName'),
        s3Bucket: getInputOrEmpty('s3Bucket'),
        s3Prefix: getInputOrEmpty('s3Prefix'),
        additionalArgs: tl.getInput('additionalArgs', false) || ''
    }

    if (parameters.packageOnly) {
        parameters.packageOutputFile = tl.getPathInput('packageOutputFile', true, false)
    }
    if (tl.getInput('functionMemory', false)) {
        parameters.functionMemory = parseInt(getInputRequired('functionMemory'), 10)
    }
    if (tl.getInput('functionTimeout', false)) {
        parameters.functionTimeout = parseInt(getInputRequired('functionTimeout'), 10)
    }

    return parameters
}
