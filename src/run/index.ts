import * as path from 'path';
import * as fs from 'fs';
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
        const processType: string | undefined = taskLib.getInput('process', false);
        const sourceDirectory: string | undefined = taskLib.getInput('sourceDirectory', false);
        const sourceFile: string | undefined = taskLib.getInput('sourceFile', false);
        const outputDirectory: string | undefined = taskLib.getInput('outputDirectory', false);
        const outputFile: string | undefined = taskLib.getInput('outputFile', false);
        const stdoutEnabled: boolean | undefined = taskLib.getBoolInput('stdout', false);

        const additionalArgsByInputs: string[] = [];

        if (!sourceDirectory && processType === 'multiple') {
            throw new Error("The variable 'sourceDirectory' is mandatory when process is 'multiple'.");
        }

        if (!sourceFile && processType === 'single') {
            throw new Error("The variable 'sourceFile' is mandatory when process is 'single'.");
        }

        let files: string[] = [];
        if (sourceDirectory && processType === 'multiple') {
            files = getFilesList(sourceDirectory);
        } else if (sourceFile && processType === 'single') {
            files.push(sourceFile);
        } else {
            throw new Error(
                "The variable 'sourceDirectory' is mandatory when process is 'multiple' and 'sourceFile' when process is 'single'.",
            );
        }

        if (stdoutEnabled) {
            taskLib.debug('Results will be printed to standard output');
            additionalArgsByInputs.push('--stdout');
        } else if (outputFile && processType === 'single') {
            additionalArgsByInputs.push('--outfile');
            additionalArgsByInputs.push(outputFile);
            const outputFilePath = path.dirname(outputFile);
            if (!fs.existsSync(outputFilePath)) {
                taskLib.debug(`Output filepath not exists. Creating folder: '${outputFilePath}'`);
                fs.mkdirSync(outputFilePath, { recursive: true });
            }
        } else if (outputDirectory) {
            taskLib.debug(`Output files will be stored in '${outputDirectory}'`);
            additionalArgsByInputs.push('--outdir');
            additionalArgsByInputs.push(outputDirectory);
            if (!fs.existsSync(outputDirectory)) {
                taskLib.debug(`Output directory not exists. Creating folder: '${outputDirectory}'`);
                fs.mkdirSync(outputDirectory, { recursive: true });
            }
        } else {
            taskLib.debug(
                `No output directory specified... Output files will be stored in source directory: '${sourceDirectory}'`,
            );
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

        taskLib.debug('Running Bicep build...');

        if (bicepTool) {
            files.forEach((file: string) => {
                const args = ['build', file, ...additionalArgsByInputs];
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
