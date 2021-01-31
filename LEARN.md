# Learning Bicep and how the tasks works

Bicep is a Domain Specific Language (DSL) for deploying Azure resources declaratively. The official documentation and sources to learn Bicep can be found in [the oficial repository](https://github.com/Azure/bicep).

In order to compile `.bicep` files, the Bicep CLI is used.
The aim of this extension is to manage the installation and use of the Bicep CLI in Azure DevOps pipelines and ease the process of `.bicep` files compilation.

# How the tasks works

The extension has two tasks, one to install and make available the CLI for subsequent tasks and other to execute the `bicep build` command with a series of files (with globbing support).

The first task (`BicepInstall`) should be executed always before the second task (`BicepBuild`). For example:

```yaml
- task: BicepInstall@0
    displayName: 'Install Bicep CLI'

- task: BicepBuild@0
    displayName: 'Compile .bicep files'
    inputs:
      sourceDirectory: 'bicep_files/**.bicep'
```

The `BicepInstall` has a optional argument to specify the version of Bicep to be used (in the format `major.minor.patch`). For example:

```yaml
- task: BicepInstall@0
    displayName: 'Install Bicep CLI'
    inputs:
      version: '0.2.328'
```

Also, the `BicepBuild` task, accepts glob patterns and single files. The example above, shows how to use glob patterns, and if you want specify only a single file, just specify its relative or full path:

```yaml
- task: BicepBuild@0
    displayName: 'Compile .bicep files'
    inputs:
      sourceDirectory: 'bicep_files/sample1.bicep'
```

A full example of pipeline can be found in this repository, in the `azure-pipelines.yml` file in the repository root directory.

# See it in action

A complete pipeline using different environments is run in every commit push and its available to review if you would like to see it.

[See the pipeline](https://raulejea.visualstudio.com/Bicep%20Tasks/_build?definitionId=19&_a=summary)