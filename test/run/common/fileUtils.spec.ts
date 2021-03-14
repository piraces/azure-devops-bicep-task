import * as fs from 'fs';
import { createDirectoryIfNotExists, getFilesList } from '../../../src/run/common/fileUtils';

jest.mock('fs');

const path = require('path');
const glob = require('glob');

const existsSyncMock = jest.spyOn(fs, 'existsSync');
const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync');
const pathJoinMock = jest.spyOn(path, 'join');
const globHasMagicMock = jest.spyOn(glob, 'hasMagic');
const globSyncMock = jest.spyOn(glob, 'sync');

function prepareMocks(exists = false) {
    existsSyncMock.mockImplementation(() => exists);
    mkdirSyncMock.mockImplementation(() => undefined);
    globSyncMock.mockImplementation(() => []);
}

function restoreMocks() {
    existsSyncMock.mockClear();
    mkdirSyncMock.mockClear();
    pathJoinMock.mockClear();
    globHasMagicMock.mockClear();
    globSyncMock.mockClear();
}

describe('getFilesList perform valid actions', () => {
    afterEach(() => restoreMocks());

    test('if path has not wildcards', () => {
        prepareMocks();

        getFilesList('./bicep_files');
        expect(globHasMagicMock).toHaveBeenCalled();
        expect(pathJoinMock).toHaveBeenCalled();
        expect(globSyncMock).toHaveBeenCalledWith('bicep_files/**', { nodir: true });
    });

    test('if path has wildcards', () => {
        prepareMocks();

        getFilesList('./bicep_files/*.bicep');
        expect(globHasMagicMock).toHaveBeenCalled();
        expect(pathJoinMock).not.toHaveBeenCalled();
        expect(globSyncMock).toHaveBeenCalledWith('./bicep_files/*.bicep', { nodir: true });
    });
});

describe('createDirectoryIfNotExists creates directory if not exists', () => {
    afterEach(() => restoreMocks());

    test('if path already exists', () => {
        prepareMocks(true);

        createDirectoryIfNotExists('any_directory', false);
        expect(existsSyncMock).toHaveBeenCalled();
        expect(mkdirSyncMock).not.toHaveBeenCalled();
    });

    test('if path not exists', () => {
        prepareMocks(false);

        createDirectoryIfNotExists('any_directory', false);
        expect(existsSyncMock).toHaveBeenCalled();
        expect(mkdirSyncMock).toHaveBeenCalled();
    });
});
