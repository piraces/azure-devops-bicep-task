import * as path from 'path';
import * as fs from 'fs';
import { platform, arch } from 'os';
import * as taskLib from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import { ClientRequest } from 'http';
import axios from 'axios';

export function getDownloadUrl(version: string): string {
    const agentPlatform = platform();
    const agentArchitecture = arch();

    if (agentArchitecture !== 'x64') {
        throw new Error(`Architecture ${agentArchitecture} is not supported yet by Bicep`);
    }

    let targetFile;
    switch (agentPlatform) {
        case 'linux':
            targetFile = 'bicep-linux-x64';
            break;
        case 'darwin':
            targetFile = 'bicep-osx-x64';
            break;
        case 'win32':
            targetFile = 'bicep-win-x64.exe';
            break;
        default:
            throw new Error(`Unexpected OS '${agentPlatform}'`);
    }

    const url = `https://github.com/Azure/bicep/releases/download/v${version}/${targetFile}`;
    return url;
}

export async function getLatestVersionTag(): Promise<string> {
    return await axios
        .get('https://github.com/azure/bicep/releases/latest')
        .then(function (response) {
            return response.request.path.split('/')[5].replace('v', '');
        })
        .catch(function (error: {
            message: string;
            response?: { data: string; status: string; headers: string };
            request: ClientRequest;
            config: string;
        }) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw new Error(
                    `[FATAL] Error while retrieving latest version tag: '${error.message}'.`,
                );
            } else if (error.request) {
                throw new Error(
                    `[FATAL] Error while retrieving latest version tag: '${error.message}'.`,
                );
            } else {
                throw new Error(
                    `[FATAL] Error while retrieving latest version tag: '${error.message}'.`,
                );
            }
        });
}

async function run() {
    taskLib.setResourcePath(path.join(__dirname, 'task.json'));
    try {
        let version: string | undefined = taskLib.getInput('version', false);
        if (!version) {
            version = await getLatestVersionTag();
        }
        taskLib.setVariable('BICEP_TOOL_VERSION', version);

        const toolName = platform() === 'win32' ? 'bicep.exe' : 'bicep';
        taskLib.setVariable('BICEP_TOOL_NAME', toolName);

        let toolPath = toolLib.findLocalTool(toolName, version);
        if (!toolPath) {
            taskLib.debug('Bicep not found cached in agent...');
            const downloadUrl = getDownloadUrl(version);
            taskLib.debug(`Downloading binary from ${downloadUrl}`);
            const downloadPath = await toolLib.downloadTool(downloadUrl, toolName);
            taskLib.debug(`Successfully downloaded binary to ${downloadPath}`);
            toolPath = await toolLib.cacheDir(path.dirname(downloadPath), toolName, version);
            taskLib.debug(`Bicep version ${version} cached`);
        }
        toolLib.prependPath(toolPath);
        const bicepFile = path.join(toolPath, toolName);
        taskLib.setVariable('BICEP_PATH', bicepFile);
        fs.chmodSync(bicepFile, '755');
        taskLib.debug('Added tool to PATH');
    } catch (err: any) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
