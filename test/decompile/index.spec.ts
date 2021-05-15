import { OutputType } from '../../src/run/common/enums/outputType';
import { ProcessingType } from '../../src/run/common/enums/processingType';
import { checkInputsAreValid, getOutputTypeForFiles, getProcessingTypeForFiles } from '../../src/decompile/index';

describe('checkInputsAreValid throws correct errors', () => {
    test('if source directory is not defined and process type is multiple', () => {
        expect(() =>
            checkInputsAreValid(undefined, undefined, 'multiple', undefined, undefined, undefined),
        ).toThrowError("The variable 'sourceDirectory' is mandatory when process is 'multiple'.");
    });

    test('if source directory is not defined and process type is undefined', () => {
        expect(() =>
            checkInputsAreValid(undefined, undefined, undefined, undefined, undefined, undefined),
        ).toThrowError("The variable 'sourceDirectory' is mandatory when process is 'multiple'.");
    });

    test('if source file is not defined and process type is single', () => {
        expect(() => checkInputsAreValid(undefined, undefined, 'single', undefined, undefined, undefined)).toThrowError(
            "The variable 'sourceFile' is mandatory when process is 'single'.",
        );
    });

    test('if output directory is not defined and output type is outDir', () => {
        expect(() =>
            checkInputsAreValid('any path', undefined, 'multiple', 'outDir', undefined, undefined),
        ).toThrowError("The variable 'outDir' is mandatory when outputProcess is 'outDir'.");
    });

    test('if output file is not defined and output type is outFile', () => {
        expect(() =>
            checkInputsAreValid('any path', undefined, 'multiple', 'outFile', undefined, undefined),
        ).toThrowError("The variable 'outFile' is mandatory when outputProcess is 'outFile'.");
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

describe('getOutputTypeForFiles returns correct OutputType', () => {
    test('if stdout enabled then returns OutputType.Stdout', () => {
        expect(getOutputTypeForFiles(undefined, undefined, true, undefined)).toEqual(OutputType.Stdout);
    });

    test('if output file is set then returns OutputType.OutFile', () => {
        expect(getOutputTypeForFiles(undefined, 'anyFile', undefined, undefined)).toEqual(OutputType.OutFile);
    });

    test('if output directory is set then returns OutputType.OutDir', () => {
        expect(getOutputTypeForFiles('.', undefined, undefined, undefined)).toEqual(OutputType.OutDir);
    });

    test('if no option is set then returns OutputType.Default', () => {
        expect(getOutputTypeForFiles(undefined, undefined, undefined, undefined)).toEqual(OutputType.Default);
    });

    test('if outputProcess is set to stdout then returns OutputType.Stdout', () => {
        expect(getOutputTypeForFiles(undefined, undefined, undefined, 'stdout')).toEqual(OutputType.Stdout);
    });

    test('if outputProcess is set to outFile then returns OutputType.OutFile', () => {
        expect(getOutputTypeForFiles(undefined, undefined, undefined, 'outFile')).toEqual(OutputType.OutFile);
    });

    test('if outputProcess is set to outDir then returns OutputType.OutDir', () => {
        expect(getOutputTypeForFiles(undefined, undefined, undefined, 'outDir')).toEqual(OutputType.OutDir);
    });
});
