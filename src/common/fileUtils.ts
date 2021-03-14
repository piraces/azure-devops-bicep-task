import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';

export function getFilesList(directory: string): string[] {
    let directoryToGetFiles: string = directory;
    if (!glob.hasMagic(directoryToGetFiles)) {
        directoryToGetFiles = path.join(directoryToGetFiles, '**');
    }
    directoryToGetFiles = directoryToGetFiles.replace(/\\/g, '/');
    return glob.sync(directoryToGetFiles);
}

export function createDirectoryIfNotExists(directory: string): void {
    const dirnamePath = path.dirname(directory);
    if (!fs.existsSync(dirnamePath)) {
        fs.mkdirSync(dirnamePath, { recursive: true });
    }
}
