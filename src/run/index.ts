import * as path from 'path';
import { platform } from 'os';
import * as taskLib from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import { createDirectoryIfNotExists, getFilesList } from './common/fileUtils';
import { ProcessingType } from './common/enums/processingType';

let processType: string | undefined;
let sourceDirectory: string | undefined;
let sourceFile: string | undefined;
let outputDirectory: string | undefined;
let outputFile: string | undefined;
let stdoutEnabled: boolean | undefined;

export function getRunTaskInputs(): void {
    processType = taskLib.getInput('process', false);
    sourceDirectory = taskLib.getInput('sourceDirectory', false);
    sourceFile = taskLib.getInput('sourceFile', false);
    outputDirectory = taskLib.getInput('outputDirectory', false);
    outputFile = taskLib.getInput('outputFile', false);
    stdoutEnabled = taskLib.getBoolInput('stdout', false);
}

export function checkInputsAreValid(
    sourceDirectory: string | undefined,
    sourceFile: string | undefined,
    processType: string | undefined,
): void {
    if (!sourceDirectory && (processType === 'multiple' || !processType)) {
        throw new Error("The variable 'sourceDirectory' is mandatory when process is 'multiple'.");
    }

    if (!sourceFile && processType === 'single') {
        throw new Error("The variable 'sourceFile' is mandatory when process is 'single'.");
    }
}

export function getProcessingTypeForFiles(
    sourceDirectory: string | undefined,
    sourceFile: string | undefined,
    processType: string | undefined,
): ProcessingType {
    if (sourceDirectory && (processType === 'multiple' || !processType)) {
        return ProcessingType.Multiple;
    }
    if (sourceFile && processType === 'single') {
        return ProcessingType.Single;
    }
    return ProcessingType.Invalid;
}

export function getBicepTool(): string | undefined {
    let bicepTool: string | undefined;
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

        return bicepTool;
    } catch (error) {
        throw new Error(
            'Bicep is not installed, please run "Install Bicep CLI"' +
                ' before this task or ensure Bicep is installed and available in PATH in the agent',
        );
    }
}

export function executeBicepBuild(files: string[], bicepTool: string, additionalArgsByInputs: string[]): void {
    files.forEach((file: string) => {
        const args = ['build', file, ...additionalArgsByInputs];
        const bicepProcess = taskLib.tool(bicepTool).arg(args).execSync();

        if (bicepProcess.code !== 0) {
            throw new Error(`Failed to execute script. Related file: ${file}`);
        } else {
            taskLib.debug(`- Built '${file}' successfully`);
        }
    });
}

async function run() {
    taskLib.setResourcePath(path.join(__dirname, 'task.json'));
    try {
        getRunTaskInputs();
        checkInputsAreValid(sourceDirectory, sourceFile, processType);
        const processingType: ProcessingType = getProcessingTypeForFiles(sourceDirectory, sourceFile, processType);

        let files: string[] = [];

        if (processingType === ProcessingType.Multiple && sourceDirectory) {
            taskLib.debug('Getting all matching files from source directory...');
            files = getFilesList(sourceDirectory);
        } else if (processingType === ProcessingType.Single && sourceFile) {
            files.push(sourceFile);
        } else {
            throw new Error(
                "The variable 'sourceDirectory' is mandatory when process is 'multiple' and 'sourceFile' when process is 'single'.",
            );
        }

        const additionalArgsByInputs: string[] = [];
        if (stdoutEnabled) {
            taskLib.debug('Results will be printed to standard output');
            additionalArgsByInputs.push('--stdout');
        } else if (outputFile && processingType === ProcessingType.Single) {
            additionalArgsByInputs.push('--outfile');
            additionalArgsByInputs.push(outputFile);
            createDirectoryIfNotExists(outputFile, true);
        } else if (outputDirectory) {
            taskLib.debug(`Output files will be stored in '${outputDirectory}'`);
            additionalArgsByInputs.push('--outdir');
            additionalArgsByInputs.push(outputDirectory);
            createDirectoryIfNotExists(outputDirectory, false);
        } else {
            taskLib.debug(
                `No output directory specified... Output files will be stored in source directory: '${sourceDirectory}'`,
            );
        }

        const bicepTool: string | undefined = getBicepTool();
        if (!bicepTool) {
            throw new Error('Failed to locate Bicep binary');
        }

        taskLib.debug('Running Bicep build...');

        executeBicepBuild(files, bicepTool, additionalArgsByInputs);

        taskLib.debug('Executed successfully');
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
