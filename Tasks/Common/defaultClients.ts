/*!
 * Copyright 2019 Oracle.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import {
    CloudFormation,
    CodeDeploy,
    ECR,
    ElasticBeanstalk,
    IAM,
    Lambda,
    S3,
    SecretsManager,
    SNS,
    SQS,
    SSM
} from 'OCI-sdk/clients/all'
import { SdkUtils } from 'Common/sdkutils'
import { OCIConnectionParameters } from './OCIConnectionParameters'

interface GenericClientConfiguration {
    OCIConnectionParameters: OCIConnectionParameters
}

interface S3ClientConfiguration extends GenericClientConfiguration {
    forcePathStyleAddressing?: boolean
}

export async function createDefaultBeanstalk(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<ElasticBeanstalk> {
    const beanstalkOpts: ElasticBeanstalk.ClientConfiguration = {
        apiVersion: '2010-12-01'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        ElasticBeanstalk,
        beanstalkOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as ElasticBeanstalk
}

export async function createDefaultCodeDeploy(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<CodeDeploy> {
    const codeDeployOpts: CodeDeploy.ClientConfiguration = {
        apiVersion: '2014-10-06'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        CodeDeploy,
        codeDeployOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as CodeDeploy
}

export async function createDefaultCloudFormation(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<CloudFormation> {
    const cfnOpts: CloudFormation.ClientConfiguration = {
        apiVersion: '2010-05-15'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        CloudFormation,
        cfnOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as CloudFormation
}

export async function createDefaultECR(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<ECR> {
    const ecrOpts: ECR.ClientConfiguration = {
        apiVersion: '2015-09-21'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        ECR,
        ecrOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as ECR
}

export async function createDefaultIAM(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<IAM> {
    const iamOpts: IAM.ClientConfiguration = {
        apiVersion: '2010-05-08'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        IAM,
        iamOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as IAM
}

export async function createDefaultLambda(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<Lambda> {
    const lambdaOpts: Lambda.ClientConfiguration = {
        apiVersion: '2015-03-31'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        Lambda,
        lambdaOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as Lambda
}

export async function createDefaultS3(
    configuration: S3ClientConfiguration,
    logger: (msg: string) => void
): Promise<S3> {
    const s3Opts: S3.ClientConfiguration = {
        apiVersion: '2006-03-01'
    }

    if (configuration.forcePathStyleAddressing) {
        s3Opts.s3ForcePathStyle = configuration.forcePathStyleAddressing
    }

    return (await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, configuration.OCIConnectionParameters, logger)) as S3
}

export async function createDefaultSecretsManager(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SecretsManager> {
    const opts: SecretsManager.ClientConfiguration = {
        apiVersion: '2017-10-17'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        SecretsManager,
        opts,
        configuration.OCIConnectionParameters,
        logger
    )) as SecretsManager
}

export async function createDefaultSNS(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SNS> {
    const snsOpts: SNS.ClientConfiguration = {
        apiVersion: '2010-03-31'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        SNS,
        snsOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as SNS
}

export async function createDefaultSQS(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SQS> {
    const sqsOpts: SQS.ClientConfiguration = {
        apiVersion: '2012-11-05'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        SQS,
        sqsOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as SQS
}

export async function createDefaultSSM(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SSM> {
    const ssmOpts: SSM.ClientConfiguration = {
        apiVersion: '2014-11-06'
    }

    return (await SdkUtils.createAndConfigureSdkClient(
        SSM,
        ssmOpts,
        configuration.OCIConnectionParameters,
        logger
    )) as SSM
}
