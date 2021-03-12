# Azure DevOps Bicep Tasks
![Node.js CI](https://github.com/piraces/azure-devops-bicep-task/workflows/Node.js%20CI/badge.svg)
[![Build Status](https://raulejea.visualstudio.com/Bicep%20Tasks/_apis/build/status/Test%20Bicep%20Tasks%20with%20latest%20version?branchName=main)](https://raulejea.visualstudio.com/Bicep%20Tasks/_build/latest?definitionId=19&branchName=main)

![Bicep Logo](https://raw.githubusercontent.com/piraces/azure-devops-bicep-task/main/images/bicep_logo.png)

This is a simple yet useful Azure DevOps set of tasks that allow to install and run [Microsoft Bicep CLI](https://github.com/Azure/bicep) commands in Azure Pipelines (cross-platform).

[View in Marketplace](https://marketplace.visualstudio.com/items?itemName=piraces.bicep-tasks)

# Install Bicep CLI task

This task downloads and installs in the agent any version of the Bicep CLI available (adding it to the PATH environment variable). After running the task, the `Run Bicep CLI build command task` can be used. Alternatively, `bicep` command could be used in a script directly.

The tool is cached in the agent after download, so subsequent runs will be faster.

This task takes only one `version` parameter input (semantic versioning) which is the version of Bicep to download.

## Sample YAML with the task

```yaml
steps:
- task: BicepInstall@0
  inputs:
    version: 0.3.1
```

# Run Bicep CLI build command task

This tasks runs the `bicep build` command with an input path containing `.bicep` file(s) ([glob](https://en.wikipedia.org/wiki/Glob_(programming)) is supported). After running the task, the resulting `.json` files are left in the same folder as the `.bicep` file resides.

This task takes only one `sourceDirectory` parameter input which is the path where the bicep file/files reside (can be a glob, or a single file).

## Sample YAML with the task (for multiple files)

```yaml
steps:
- task: BicepBuild@0
  inputs:
    process: 'multiple'
    sourceDirectory: '.\bicep_files\*.bicep'
    stdout: false # Note if stdout is true 'outputDirectory' will not be interpreted
    outputDirectory: '.\bicep_files\out' # Only when 'stdout' is false or not defined
```

## Sample YAML with the task (for single file)

```yaml
steps:
- task: BicepBuild@0
  inputs:
    process: 'single'
    sourceFile: '.\bicep_files\sample1.bicep'
    stdout: false # Note if stdout is true 'outputDirectory' will not be interpreted
    outputFile: '.\bicep_files\sample1.out.json' # Only when 'stdout' is false or not defined and 'outputDirectory' is empty or not defined
```

# Local Development

**Note:** [Bicep](https://github.com/Azure/bicep) must be installed in the local machine. [TypeScript](https://www.typescriptlang.org/download) must be also installed as a global package (`npm i typescript -g`).

1. Run `npm install` in the root directory.
2. Run `npm run build` in the root directory.
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

4. (Optional) Set variables for the tasks (as you want to test):

```powershell
# For PowerShell:
$env:INPUT_VERSION = "0.3.1" # Or any other valid Bicep version
$env:INPUT_PROCESS = "multiple" # Selection between 'multiple' or 'single' file(s) processing
$env:INPUT_SOURCEDIRECTORY = "C:\bicep_files\*.bicep" # Or any other existing directory with bicep file(s)
$env:INPUT_SOURCEFILE = "C:\bicep_files\sample1.bicep" # Or any other existing bicep file
$env:INPUT_STDOUT = $false # To print the output to standard output (stdout) or not
$env:INPUT_OUTPUTDIRECTORY = "C:\bicep_files\out" # Or any other existing directory to store the json generated file(s)
$env:INPUT_OUTPUTFILE = "C:\bicep_files\sample1.out.json" # Or any other path/filename to store the generated file
```
```bash
# For bash:
export INPUT_VERSION="0.3.1" # Or any other valid Bicep version
export INPUT_PROCESS = "multiple" # Selection between 'multiple' or 'single' file(s) processing
export INPUT_SOURCEDIRECTORY="C:\bicep_files\*.bicep" # Or any other existing directory with bicep file(s)
export INPUT_SOURCEFILE = "C:\bicep_files\sample1.bicep" # Or any other existing bicep file
export INPUT_STDOUT = false # To print the output to standard output (stdout) or not
export INPUT_OUTPUTDIRECTORY = "C:\bicep_files\out" # Or any other existing directory to store the json generated file(s)
export INPUT_OUTPUTFILE = "C:\bicep_files\sample1.out.json" # Or any other path/filename to store the generated file
```

5. Run `node src/install/index.js` and `node src/run/index.js` to execute the two tasks.

*Note:* the `bicep_files` and the `arm_templates` directories containing `.bicep` and `.json` files are only for development and testing purposes.

# Contributing

Feel free to open an issue or a PR if you want to without any problem :)

# License

This project is licensed under the [MIT License](https://github.com/piraces/azure-devops-bicep-task/blob/main/LICENSE).

See the LICENSE file in the root of this repository.

# Attributions

The base logo for the tasks and the extension is property of the Microsoft Bicep project, used without any commercial purpose.
