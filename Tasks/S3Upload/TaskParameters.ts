/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { OCIConnectionParameters, buildConnectionParameters } from 'Common/OCIConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

// options for Server-side encryption Key Management; 'none' disables SSE
export const noKeyManagementValue: string = 'none'
export const OCIKeyManagementValue: string = 'OCIManaged'
export const customerKeyManagementValue: string = 'customerManaged'

// options for encryption algorithm when key management is set to 'OCI';
// customer managed keys always use AES256
export const OCIkmsAlgorithmValue: string = 'KMS' // translated to OCI:kms when used in api call
export const aes256AlgorithmValue: string = 'AES256'

export interface TaskParameters {
    OCIConnectionParameters: OCIConnectionParameters
    bucketName: string
    sourceFolder: string
    targetFolder: string
    flattenFolders: boolean
    globExpressions: string[]
    filesAcl: string
    createBucket: boolean
    contentType: string
    contentEncoding: string
    forcePathStyleAddressing: boolean
    storageClass: string
    keyManagement: string
    encryptionAlgorithm: string
    kmsMasterKeyId: string
    customerKey: Buffer
    cacheControl: string[]
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        OCIConnectionParameters: buildConnectionParameters(),
        bucketName: getInputRequired('bucketName'),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        sourceFolder: tl.getPathInput('sourceFolder', true, true),
        targetFolder: getInputOrEmpty('targetFolder'),
        globExpressions: tl.getDelimitedInput('globExpressions', '\n', true),
        filesAcl: getInputOrEmpty('filesAcl'),
        createBucket: tl.getBoolInput('createBucket'),
        contentType: getInputOrEmpty('contentType'),
        contentEncoding: getInputOrEmpty('contentEncoding'),
        forcePathStyleAddressing: tl.getBoolInput('forcePathStyleAddressing', false),
        storageClass: getInputOrEmpty('storageClass'),
        keyManagement: '',
        encryptionAlgorithm: '',
        kmsMasterKeyId: '',
        customerKey: Buffer.from([]),
        cacheControl: tl.getDelimitedInput('cacheControl', '\n', false)
    }
    if (!parameters.storageClass) {
        parameters.storageClass = 'STANDARD'
    }
    parameters.keyManagement = getInputOrEmpty('keyManagement')
    if (parameters.keyManagement && parameters.keyManagement !== noKeyManagementValue) {
        switch (parameters.keyManagement) {
            case OCIKeyManagementValue: {
                const algorithm = tl.getInput('encryptionAlgorithm', true)
                if (algorithm === OCIkmsAlgorithmValue) {
                    parameters.encryptionAlgorithm = 'OCI:kms'
                } else {
                    parameters.encryptionAlgorithm = aes256AlgorithmValue
                }
                parameters.kmsMasterKeyId = tl.getInput('kmsMasterKeyId', algorithm === OCIkmsAlgorithmValue) || ''
                break
            }

            case customerKeyManagementValue: {
                parameters.encryptionAlgorithm = aes256AlgorithmValue
                const customerKey = getInputRequired('customerKey')
                parameters.customerKey = Buffer.from(customerKey, 'hex')
                break
            }
        }
    }

    return parameters
}
