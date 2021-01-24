import * as path from 'path';
import * as taskLib from 'azure-pipelines-task-lib/task';
import glob from 'glob';


function getArgumentList(sourceDirectory: string): string[] {
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
            throw new Error('The variable \'sourceDirectory\' is mandatory.');
        }

        let bicepTool;
        try {
            bicepTool = taskLib.tool(taskLib.which('bicep', true))
        } catch (error) {
            throw new Error('Bicep is not installed, please run "Install Bicep CLI"' +
                ' before this task or ensure Bicep is installed and available in PATH in the agent');
        }
        const args = getArgumentList(sourceDirectory);
        const cwd = taskLib.getPathInput('cwd', false, true);
        const execOptions = {
            failOnStdErr: false,
            ignoreReturnCode: false,
            windowsVerbatimArguments: true,
            cwd: cwd
        };
        taskLib.debug('Running Bicep build...');
        bicepTool.arg(args);
        const bicepProcess = bicepTool.execSync(execOptions);
        if (bicepProcess.code !== 0) {
            throw new Error('Failed to execute script')
        }
        taskLib.debug('Executed successfully');
    }
    catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();