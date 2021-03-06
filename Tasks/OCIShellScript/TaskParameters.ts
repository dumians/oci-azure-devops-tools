/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getBoolInput, getPathInput } from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const inlineScriptType: string = 'inline'
export const fileScriptType: string = 'filePath'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    arguments: string
    scriptType: string
    filePath: string
    inlineScript: string
    disableAutoCwd: boolean
    workingDirectory: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        arguments: getInputOrEmpty('arguments'),
        scriptType: getInputRequired('scriptType'),
        filePath: '',
        inlineScript: '',
        disableAutoCwd: getBoolInput('disableAutoCwd', false),
        workingDirectory: '',
        failOnStandardError: getBoolInput('failOnStandardError', false)
    }

    if (parameters.scriptType === fileScriptType) {
        parameters.filePath = getPathInput('filePath', true, true)
    } else {
        parameters.inlineScript = getInputRequired('inlineScript')
    }

    if (parameters.disableAutoCwd) {
        parameters.workingDirectory = getPathInput('workingDirectory', true, false)
    }

    return parameters
}
