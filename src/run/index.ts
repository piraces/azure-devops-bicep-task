import * as path from 'path';
import { platform } from 'os';
import * as taskLib from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import glob from 'glob';

export function getFilesList(sourceDirectory: string): string[] {
    return glob.sync(sourceDirectory);
}

async function run() {
    taskLib.setResourcePath(path.join(__dirname, 'task.json'));
    try {
        const sourceDirectory: string | undefined = taskLib.getInput('sourceDirectory', true);
        if (!sourceDirectory) {
            throw new Error("The variable 'sourceDirectory' is mandatory.");
        }

        let bicepTool: any;
        const bicepToolName = taskLib.getVariable('BICEP_TOOL_NAME');
        const bicepToolVersion = taskLib.getVariable('BICEP_TOOL_VERSION');
        try {
            if (bicepToolName && bicepToolVersion) {
                bicepTool = toolLib.findLocalTool(bicepToolName, bicepToolVersion);
                if (bicepTool) {
                    bicepTool = path.join(bicepTool, bicepToolName);
                }
            }

            if (!bicepTool) {
                bicepTool = taskLib.getVariable('BICEP_PATH');
            }

            if (!bicepTool) {
                const defaultToolName = platform() === 'win32' ? 'bicep.exe' : 'bicep';
                bicepTool = taskLib.which(defaultToolName);
            }
        } catch (error) {
            throw new Error(
                'Bicep is not installed, please run "Install Bicep CLI"' +
                    ' before this task or ensure Bicep is installed and available in PATH in the agent',
            );
        }
        const files = getFilesList(sourceDirectory);

        taskLib.debug('Running Bicep build...');

        if (bicepTool) {
            files.forEach((file: string) => {
                const args = ['build', file];
                const bicepProcess = taskLib.tool(bicepTool).arg(args).execSync();

                if (bicepProcess.code !== 0) {
                    throw new Error(`Failed to execute script. Related file: ${file}`);
                } else {
                    taskLib.debug(`- Built '${file}' successfully`);
                }
            });

            taskLib.debug('Executed successfully');
        } else {
            throw new Error('Failed to locate Bicep binary');
        }
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
