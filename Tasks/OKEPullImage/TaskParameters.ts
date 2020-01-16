/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const imageTagSource: string = 'imagetag'
export const imageIdSource: string = 'imagedigest'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    imageSource: string
    imageTag: string
    imageDigest: string
    repository: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        imageSource: getInputRequired('imageSource'),
        repository: getInputRequired('repository'),
        imageTag: getInputOrEmpty('imageTag'),
        imageDigest: getInputOrEmpty('imageDigest'),
        outputVariable: getInputOrEmpty('outputVariable')
    }

    return parameters
}
