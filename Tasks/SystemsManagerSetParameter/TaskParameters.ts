/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const simpleStringType: string = 'String'
export const stringListType: string = 'StringList'
export const secureStringType: string = 'SecureString'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    parameterName: string
    parameterType: string
    parameterValue: string
    encryptionKeyId: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        parameterName: getInputRequired('parameterName'),
        parameterType: getInputRequired('parameterType'),
        parameterValue: getInputRequired('parameterValue'),
        encryptionKeyId: ''
    }

    if (parameters.parameterType === secureStringType) {
        parameters.encryptionKeyId = getInputOrEmpty('encryptionKeyId')
    }

    return parameters
}
