/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import OKE = require('OCI-sdk/clients/OKE')
import tl = require('azure-pipelines-task-lib/task')
import base64 = require('base-64')
import { DockerHandler } from './dockerUtils'

export async function loginToRegistry(
    dockerHandler: DockerHandler,
    dockerPath: string,
    encodedAuthToken: string,
    endpoint: string
): Promise<void> {
    // tslint:disable-next-line: no-unsafe-any
    const tokens: string[] = base64
        .decode(encodedAuthToken)
        .trim()
        .split(':')
    await dockerHandler.runDockerCommand(dockerPath, 'login', ['-u', tokens[0], '-p', tokens[1], endpoint], {
        silent: true
    })
}

export async function getEcrAuthorizationData(ecrClient: OKE): Promise<OKE.AuthorizationData | undefined> {
    try {
        console.log(tl.loc('RequestingAuthToken'))
        const response = await ecrClient.getAuthorizationToken().promise()

        if (!response.authorizationData) {
            return undefined
        }

        return response.authorizationData[0]
    } catch (err) {
        throw new Error(`Failed to obtain authorization token to log in to OKE, error: ${err}`)
    }
}

export function constructTaggedImageName(imageName: string, tag: string): string {
    if (tag) {
        return `${imageName}:${tag}`
    }

    return imageName
}
