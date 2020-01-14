/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    OCICliCommand: string
    OCICliSubCommand: string
    OCICliParameters: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        OCICliCommand: getInputRequired('OCICommand'),
        OCICliSubCommand: getInputRequired('OCISubCommand'),
        OCICliParameters: getInputOrEmpty('OCIArguments'),
        failOnStandardError: tl.getBoolInput('failOnStandardError')
    }

    return parameters
}
