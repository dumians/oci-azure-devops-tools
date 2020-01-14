/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getBoolInput } from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const ignoreStackOutputs: string = 'ignore'
export const stackOutputsAsVariables: string = 'asVariables'
export const stackOutputsAsJson: string = 'asJSON'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    changeSetName: string
    stackName: string
    outputVariable: string
    captureStackOutputs: string
    captureAsSecuredVars: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        changeSetName: getInputRequired('changeSetName'),
        stackName: getInputRequired('stackName'),
        outputVariable: getInputOrEmpty('outputVariable'),
        captureStackOutputs: getInputOrEmpty('captureStackOutputs'),
        captureAsSecuredVars: getBoolInput('captureAsSecuredVars', false)
    }

    return parameters
}
