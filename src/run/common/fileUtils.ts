import * as path from 'path';
import * as fs from 'fs';
import { hasMagic, sync } from 'glob';

export function getFilesList(directory: string): string[] {
    let directoryToGetFiles: string = directory;

    directoryToGetFiles = directoryToGetFiles.replace(/\\/g, '/');
    if (!hasMagic(directoryToGetFiles)) {
        directoryToGetFiles = path.join(directoryToGetFiles, '**');
        directoryToGetFiles = directoryToGetFiles.replace(/\\/g, '/');
    }

    return sync(directoryToGetFiles, { nodir: true });
}

export function createDirectoryIfNotExists(directory: string, checkDirname: boolean): void {
    const dirnamePath = checkDirname ? path.dirname(directory) : directory;
    if (!fs.existsSync(dirnamePath)) {
        fs.mkdirSync(dirnamePath, { recursive: true });
    }
}
