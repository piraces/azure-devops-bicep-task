import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';

export function getFilesList(directory: string): string[] {
    let directoryToGetFiles: string = directory;
    if (!glob.hasMagic(directoryToGetFiles)) {
        directoryToGetFiles = path.join(directoryToGetFiles, '**');
    }
    directoryToGetFiles = directoryToGetFiles.replace(/\\/g, '/');
    const allFiles = glob.sync(directoryToGetFiles, { nodir: true });
    return allFiles.filter((file) => file.endsWith('.json'));
}

export function createDirectoryIfNotExists(directory: string, checkDirname: boolean): void {
    const dirnamePath = checkDirname ? path.dirname(directory) : directory;
    if (!fs.existsSync(dirnamePath)) {
        fs.mkdirSync(dirnamePath, { recursive: true });
    }
}
