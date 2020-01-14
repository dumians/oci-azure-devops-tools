/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    secretIdOrName: string
    variableName: string
    versionId: string
    versionStage: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        secretIdOrName: getInputRequired('secretIdOrName'),
        variableName: getInputRequired('variableName'),
        versionId: getInputOrEmpty('versionId'),
        versionStage: getInputOrEmpty('versionStage')
    }

    return parameters
}
