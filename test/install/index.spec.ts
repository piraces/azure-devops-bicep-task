import * as os from 'os';
import { getDownloadUrl, getLatestVersionTag } from '../../src/install/index';
import axios from 'axios';

jest.mock('os');
jest.mock('axios');

const InvalidArchitecture = 'arm64';
const ValidArchitecture = 'x64';

const DarwinPlatform = 'darwin';
const LinuxPlatform = 'linux';
const WindowsPlatform = 'win32';

const InvalidPlatform = 'android';

const archMock = jest.spyOn(os, 'arch');
const platformMock = jest.spyOn(os, 'platform');
const axiosMock = jest.spyOn(axios, 'get');

function prepareMocks(architecture: string, platform: any, version = '0.2.328', axiosFail = false) {
    archMock.mockImplementation(() => architecture);
    platformMock.mockImplementation(() => platform);

    if (axiosFail) {
        axiosMock.mockRejectedValue({ message: 'Just Testing', config: 'Test config' });
    } else {
        axiosMock.mockResolvedValue({ request: { path: `/Azure/bicep/releases/tag/v${version}` } });
    }
}

function restoreMocks() {
    jest.restoreAllMocks();
}

describe('getDownloadUrl returns a valid URL', () => {
    afterEach(() => restoreMocks());

    test.each([
        [ValidArchitecture, DarwinPlatform, 'https://github.com/Azure/bicep/releases/download/v0.2.328/bicep-osx-x64'],
        [ValidArchitecture, LinuxPlatform, 'https://github.com/Azure/bicep/releases/download/v0.2.328/bicep-linux-x64'],
        [
            ValidArchitecture,
            WindowsPlatform,
            'https://github.com/Azure/bicep/releases/download/v0.2.328/bicep-win-x64.exe',
        ],
    ])('if architecture is %s and platform is %s', (architecture, platform, expected) => {
        prepareMocks(architecture, platform);
        const releaseUrl = getDownloadUrl('0.2.328');
        expect(releaseUrl).toBe(expected);
    });

    test('if architecture is invalid and platform is any', async () => {
        prepareMocks(InvalidArchitecture, LinuxPlatform);
        expect(() => getDownloadUrl('0.2.328')).toThrowError(
            `Architecture ${InvalidArchitecture} is not supported yet by Bicep`,
        );
    });

    test('if architecture is valid and platform is not supported', async () => {
        prepareMocks(ValidArchitecture, InvalidPlatform);
        expect(() => getDownloadUrl('0.2.328')).toThrowError(`Unexpected OS '${InvalidPlatform}'`);
    });
});

describe('getLatestVersionTag returns a valid tag', () => {
    afterEach(() => restoreMocks());

    test('if github API is available', async () => {
        prepareMocks(ValidArchitecture, WindowsPlatform, '0.2.328', false);
        const latestVersion = await getLatestVersionTag();
        expect(latestVersion).toBe('0.2.328');
    });

    test('if github API is not available / changed', async () => {
        prepareMocks(InvalidArchitecture, LinuxPlatform, '0.2.328', true);
        try {
            await getLatestVersionTag();
        } catch (err) {
            expect(err).toEqual(new Error(`[FATAL] Error while retrieving latest version tag: 'Just Testing'.`));
        }
    });
});
