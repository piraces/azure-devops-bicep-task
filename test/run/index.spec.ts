import { ProcessingType } from '../../src/run/common/enums/processingType';
import { checkInputsAreValid, getProcessingTypeForFiles } from '../../src/run/index';

describe('checkInputsAreValid throws correct errors', () => {
    test('if source directory is not defined and process type is multiple', () => {
        expect(() => checkInputsAreValid(undefined, undefined, 'multiple')).toThrowError(
            "The variable 'sourceDirectory' is mandatory when process is 'multiple'.",
        );
    });

    test('if source directory is not defined and process type is undefined', () => {
        expect(() => checkInputsAreValid(undefined, undefined, undefined)).toThrowError(
            "The variable 'sourceDirectory' is mandatory when process is 'multiple'.",
        );
    });

    test('if source file is not defined and process type is single', () => {
        expect(() => checkInputsAreValid(undefined, undefined, 'single')).toThrowError(
            "The variable 'sourceFile' is mandatory when process is 'single'.",
        );
    });
});

describe('getProcessingTypeForFiles returns correct ProcessingType', () => {
    test('if source directory is defined and process type is multiple then processing type is multiple', () => {
        expect(getProcessingTypeForFiles('.', undefined, 'multiple')).toEqual(ProcessingType.Multiple);
    });

    test('if source directory is not defined and process type is multiple then processing type is Invalid', () => {
        expect(getProcessingTypeForFiles(undefined, undefined, 'multiple')).toEqual(ProcessingType.Invalid);
    });

    test('if source directory is defined and process type is undefined then processing type is multiple', () => {
        expect(getProcessingTypeForFiles('.', undefined, undefined)).toEqual(ProcessingType.Multiple);
    });

    test('if source directory is not defined and process type is undefined then processing type is Invalid', () => {
        expect(getProcessingTypeForFiles(undefined, undefined, undefined)).toEqual(ProcessingType.Invalid);
    });

    test('if source file is defined and process type is single then processing type is single', () => {
        expect(getProcessingTypeForFiles(undefined, '.', 'single')).toEqual(ProcessingType.Single);
    });

    test('if source file is not defined and process type is single then processing type is Invalid', () => {
        expect(getProcessingTypeForFiles(undefined, undefined, 'single')).toEqual(ProcessingType.Invalid);
    });
});
