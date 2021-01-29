import * as process from 'process';
process.env.INPUT_SOURCEDIRECTORY = '';
import glob from 'glob';
import { getArgumentList } from '../../src/run/index';

jest.mock('glob');

const globMock = jest.spyOn(glob, 'sync');

describe('getArgumentList returns a valid arguments list', () => {
    test('if github API is available', () => {
        globMock.mockImplementation(() => ['sample1.bicep', 'sample2.bicep']);
        const argumentList = getArgumentList('');
        expect(argumentList).toEqual(['build', 'sample1.bicep', 'sample2.bicep']);
        globMock.mockRestore();
    });
});
