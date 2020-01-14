/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import * as tr from 'azure-pipelines-task-lib/toolrunner'
import { getCredentials, getRegion } from 'Common/OCIConnectionParameters'
import { SdkUtils } from 'Common/sdkutils'
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        this.checkIfOCICliIsInstalled()
        await this.configureOCICli()
        await SdkUtils.configureHttpProxyFromAgentProxyConfiguration('OCICLI')

        const OCICliPath = tl.which('OCI')
        const OCICliTool: tr.ToolRunner = tl.tool(OCICliPath)
        OCICliTool.arg(this.taskParameters.OCICliCommand)
        OCICliTool.arg(this.taskParameters.OCICliSubCommand)
        if (this.taskParameters.OCICliParameters) {
            OCICliTool.line(this.taskParameters.OCICliParameters)
        }
        // tslint:disable-next-line: no-unsafe-any
        const code: number = await OCICliTool.exec({ failOnStdErr: this.taskParameters.failOnStandardError } as any)
        tl.debug(`return code: ${code}`)
        if (code !== 0) {
            throw new Error(tl.loc('OCIReturnCode', OCICliTool, code))
        }
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('OCIReturnCode', OCICliTool, code))
    }

    // If assume role credentials are in play, make sure the initial generation
    // of temporary credentials has been performed. If no credentials and/or
    // region were defined then we assume they are already set in the host
    // environment. Environment variables are preferred over stored profiles
    // as this isolates parallel builds and avoids content left lying around on
    // the agent when a build completes
    private async configureOCICli() {
        const env = process.env

        const credentials = await getCredentials(this.taskParameters.OCIConnectionParameters)
        if (credentials) {
            await credentials.getPromise()
            tl.debug('configure credentials into environment variables')
            env.OCI_ACCESS_KEY_ID = credentials.accessKeyId
            env.OCI_SECRET_ACCESS_KEY = credentials.secretAccessKey
            if (credentials.sessionToken) {
                env.OCI_SESSION_TOKEN = credentials.sessionToken
            }
        }

        const region = await getRegion()
        if (region) {
            tl.debug('configure region into environment variable')
            env.OCI_DEFAULT_REGION = region
        }
    }

    private checkIfOCICliIsInstalled(): boolean {
        try {
            return !!tl.which('OCI', true)
        } catch (error) {
            throw new Error(`${tl.loc('OCICLINotInstalled')}\n${error}`)
        }
    }
}
