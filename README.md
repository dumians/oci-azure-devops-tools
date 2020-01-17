# Overview

OCI Tools for Microsoft Visual Studio Team Services (VSTS) adds tasks to easily enable build and release pipelines in VSTS and Team Foundation Server to work with OCI services including Oracle S3, OCI Elastic Beanstalk, OCI CodeDeploy, OCI Lambda, OCI CloudFormation, Oracle Simple Queue Service and Oracle Simple Notification Service, and run commands using the OCI Tools for Windows PowerShell module and the OCI CLI.

This is an open source project because we want you to be involved. We love issues, feature requests, code reviews, pull
requests or any positive contribution. Please see the the [CONTRIBUTING](CONTRIBUTING.md) guide for how to help, including how to build your own extension.

## Highlighted Features

-   OCICLI - Interact with the OCICLI (Windows hosts only)
-   OCI Powershell Module - Interact with OCI through powershell (Windows hosts only)
-   Beanstalk - Deploy ElasticBeanstalk applications
-   CodeDeploy - Deploy with CodeDeploy
-   CloudFormation - Create/Delete/Update CloudFormation stacks
-   Lambda - Deploy from S3, .net core applications, or any other language that builds on VSTS
-   S3 - Upload/Download to/from S3 buckets
-   Secrets Manager - Create and retrieve secrets
-   Systems manager - Get/set parameters and run commands

## User Guide


## Credentials Handling for OCI Services

To enable tasks to call OCI services when run as part of your build or release pipelines OCI credentials need to have been configured for the tasks or be available in the host process for the build agent. Note that the credentials are used specifically by the tasks when run in a build agent process, they are not related to end-user logins to your VSTS or TFS instance.

The OCI tasks support the following mechanisms for obtaining OCI credentials:

-   One or more service endpoints, of type _OCI_, can be created and populated with OCI access and secret keys, and optionally data for _Assumed Role_ credentials.
    -   Tasks reference the configured service endpoint instances by name as part of their configuration and pull the required credentials from the endpoint when run.
-   Variables defined on the task or build.
    -   If tasks are not configured with the name of a service endpoint they will attempt to obtain credentials, and optionally region, from variables defined in the build environment. The
        variables are named _OCI.AccessKeyID_, _OCI.SecretAccessKey_ and optionally _OCI.SessionToken_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the variable _OCI.Region_.
-   Environment variables in the build agent's environment.
    -   If tasks are not configured with the name of a service endpoint, and credentials or region are not available from task variables, the tasks will attempt to obtain credentials, and optionally region, from standard environment variables in the build process environment. These variables are _OCI_ACCESS_KEY_ID_, _OCI_SECRET_ACCESS_KEY_ and optionally _OCI_SESSION_TOKEN_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the environment variable _OCI_REGION_.
-   EC2 instance metadata, for build hosts running on EC2 instances.
    -   Both credential and region information can be automatically obtained from the instance metadata in this scenario.


## Supported environments

-   Azure Devops
-   Team Foundation Server 2015 Update 3 (or higher)

**Note for Team Foundation Server 2015 Users:** Team Foundation Server 2015 users should download the extension from [here](https://sdk-for-net.Oraclewebservices.com/latest/Oraclewebservices.OCI-vsts-tools-tfs2015.vsix). This temporary version contains the same tasks as the version in the marketplace but removes the support for extra fields in the _OCI_ endpoint type to support _Assume Role_ credentials. These fields, although marked optional, are unfortunately treated as required in TFS 2015 editions.

## License

The project is licensed under the MIT license

## Contributors

We thank the following contributor(s) for this extension: Visual Studio ALM Rangers.
