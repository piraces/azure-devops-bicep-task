import * as path from 'path';
import { platform } from 'os';
import * as taskLib from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import glob from 'glob';

export function getArgumentList(sourceDirectory: string): string[] {
    const args: Array<string> = new Array<string>();
    args.push('build');
    const files = glob.sync(sourceDirectory);
    const finalArgs = args.concat(files);
    return finalArgs;
}

async function run() {
    taskLib.setResourcePath(path.join(__dirname, 'task.json'));
    try {
        const sourceDirectory: string | undefined = taskLib.getInput('sourceDirectory', true);
        if (!sourceDirectory) {
            throw new Error("The variable 'sourceDirectory' is mandatory.");
        }

        let bicepTool;
        const bicepToolName = taskLib.getVariable('BICEP_TOOL_NAME');
        const bicepToolVersion = taskLib.getVariable('BICEP_TOOL_VERSION');
        try {
            if (bicepToolName && bicepToolVersion) {
                bicepTool = toolLib.findLocalTool(bicepToolName, bicepToolVersion);
            }

            if (!bicepTool) {
                const defaultToolName = platform() === 'win32' ? 'bicep.exe' : 'bicep';
                bicepTool = taskLib.which(defaultToolName);
            }

            if (!bicepTool) {
                bicepTool = taskLib.getVariable('BICEP_PATH');
            }
        } catch (error) {
            throw new Error(
                'Bicep is not installed, please run "Install Bicep CLI"' +
                    ' before this task or ensure Bicep is installed and available in PATH in the agent',
            );
        }
        const args = getArgumentList(sourceDirectory);
        const cwd = taskLib.getPathInput('cwd', false, true);
        const execOptions = {
            failOnStdErr: false,
            ignoreReturnCode: false,
            windowsVerbatimArguments: true,
            cwd: cwd,
        };

        taskLib.debug('Running Bicep build...');

        if (bicepTool) {
            const bicepProcess = taskLib.execSync(bicepTool, args, execOptions);
            if (bicepProcess.code !== 0) {
                throw new Error('Failed to execute script');
            }
            taskLib.debug('Executed successfully');
        } else {
            throw new Error('Failed to locate Bicep binary');
        }
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
