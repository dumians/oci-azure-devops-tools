/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

// options for Server-side encryption Key Management
export const noneOrOCIManagedKeyValue = 'noneOrOCIManaged'
export const customerManagedKeyValue = 'customerManaged'
export const aes256AlgorithmValue = 'AES256'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    bucketName: string
    sourceFolder: string
    targetFolder: string
    globExpressions: string[]
    overwrite: boolean
    forcePathStyleAddressing: boolean
    flattenFolders: boolean
    keyManagement: string
    customerKey: Buffer
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        bucketName: getInputRequired('bucketName'),
        sourceFolder: tl.getPathInput('sourceFolder', false, false),
        targetFolder: tl.getPathInput('targetFolder', true, false),
        globExpressions: tl.getDelimitedInput('globExpressions', '\n', true),
        overwrite: tl.getBoolInput('overwrite', false),
        forcePathStyleAddressing: tl.getBoolInput('forcePathStyleAddressing', false),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        keyManagement: getInputOrEmpty('keyManagement'),
        customerKey: Buffer.from([])
    }

    if (parameters.keyManagement === customerManagedKeyValue) {
        const customerKey = getInputRequired('customerKey')
        parameters.customerKey = Buffer.from(customerKey, 'hex')
    }

    return parameters
}
