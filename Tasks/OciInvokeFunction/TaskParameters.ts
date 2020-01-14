/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    functionName: string
    payload: string
    invocationType: string
    logType: string
    outputVariable: string
}

export function buildTaskParameters() {
    const paramters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        functionName: getInputRequired('functionName'),
        payload: getInputOrEmpty('payload'),
        invocationType: getInputOrEmpty('invocationType'),
        logType: getInputOrEmpty('logType'),
        outputVariable: getInputOrEmpty('outputVariable')
    }

    return paramters
}
