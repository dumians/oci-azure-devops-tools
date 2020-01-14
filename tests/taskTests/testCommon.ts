/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { OCIConnectionParameters } from 'Common/OCIConnectionParameters'

export const emptyConnectionParameters: OCIConnectionParameters = {
    proxyConfiguration: '',
    AssumeRoleARN: '',
    logRequestData: false,
    logResponseData: false,
    OCIEndpointAuth: {
        parameters: {},
        scheme: ''
    }
}
