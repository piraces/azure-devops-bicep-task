# Azure DevOps Bicep Tasks

![Bicep Logo](./images/bicep_logo.png)

This is a simple yet useful Azure DevOps set of tasks that allow to install and run [Microsoft Bicep CLI](https://github.com/Azure/bicep) commands in Azure Pipelines.

# Install Bicep CLI task

This task downloads and installs in the agent any version of the Bicep CLI available (adding it to the PATH environment variable). After running the task, the `Run Bicep CLI build command task` can be used. Alternatively, `bicep` command could be used in a script directly.

The tool is cached in the agent after download, so subsequent runs will be faster.

This task takes only one `version` parameter input (semantic versioning) which is the version of Bicep to download.

## Sample YAML with the task

```yaml
steps:
- task: BicepInstall@1
  inputs:
    version: 0.2.328
```

# Run Bicep CLI build command task

This tasks runs the `bicep build` command with an input path containing `.bicep` file(s) ([glob](https://en.wikipedia.org/wiki/Glob_(programming)) is supported). After running the task, the resulting `.json` files are left in the same folder as the `.bicep` file resides.

This task takes only one `sourceDirectory` parameter input which is the path where the bicep file/files reside (can be a glob, or a single file).

## Sample YAML with the task

```yaml
steps:
- task: BicepBuild@1
  inputs:
    sourceDirectory: '.\bicep_files\*.bicep'
```

# Local Development

**Note:** [Bicep](https://github.com/Azure/bicep) must be installed in the local machine. [TypeScript](https://www.typescriptlang.org/download) must be also installed as a global package (`npm i typescript -g`).

1. Run `npm install` in the `src` directory.
2. Run `tsc` in the `src` directory.
3. Define the needed agent environment parameters:

```powershell
# For PowerShell:
$env:AGENT_TEMPDIRECTORY = "C:\TEMP" # Or any other existing directory
$env:AGENT_TOOLSDIRECTORY = "C:\tools" # Or any other existing directory
```
```bash
# For bash:
export AGENT_TEMPDIRECTORY="/temp" # Or any other existing directory
export AGENT_TOOLSDIRECTORY="/tools" # Or any other existing directory
```

4. (Optional) Set variables for the tasks:

```powershell
# For PowerShell:
$env:INPUT_VERSION = "0.2.328" # Or any other valid Bicep version
$env:INPUT_SOURCEDIRECTORY = "C:\bicep_files\*.bicep" # Or any other existing directory with bicep file(s)
```
```bash
# For bash:
export INPUT_VERSION="0.2.328" # Or any other valid Bicep version
export INPUT_SOURCEDIRECTORY="C:\bicep_files\*.bicep" # Or any other existing directory with bicep file(s)
```

5. Run `node install/index.js` and `node run/index.js` to execute the two tasks.

*Note:* the `bicep_files` directory containing `.bicep` files are only for development and testing purposes.

# Contributing

Feel free to open an issue or a PR if you want to without any problem :)

# License

This project is licensed under the [MIT License](https://github.com/piraces/azure-devops-bicep-task/blob/main/LICENSE).

See the LICENSE file in the root of this repository.

# Attributions

The base logo for the tasks and the extension is property of the Microsoft Bicep project, used without any commercial purpose.