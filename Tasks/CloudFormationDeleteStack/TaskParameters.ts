/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    stackName: string
}

export function buildTaskParameters() {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        stackName: getInputRequired('stackName')
    }

    return parameters
}
