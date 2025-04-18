import ThemeDark from "./themes/ThemeDark.svelte";
import ThemeDefault from "./themes/ThemeDefault.svelte";
import ThemeTest from "./themes/Richard/ThemeTest.svelte";
import Theme2 from "./themes/Theme2/Theme2.svelte";
import Theme2Locked from "./themes/Theme2Locked/Theme2Locked.svelte";
import Theme3 from "./themes/Theme3/Theme3.svelte";

export enum ETheme {
    DEFAULT = 'default',
    DARK = 'dark',
    Test = 'test',
    Theme2 = 'Theme2',
    Theme2Locked = 'Theme2Locked',
    Theme3 = 'Theme3',
}

export const ThemeComponentMapping: {
    [key in ETheme]: any;
} = {
    [ETheme.DEFAULT]: ThemeDefault,
    [ETheme.DARK]: ThemeDark,
    [ETheme.Test]: ThemeTest,
    [ETheme.Theme2]: Theme2,
    [ETheme.Theme2Locked]: Theme2Locked,
    [ETheme.Theme3]: Theme3,
};



// export namespace Manifest {
//     export enum ThemeFieldTypes {
//         STRING = 'string',
//         NUMBER = 'number',
//         BOOLEAN = 'boolean',
//         COLOR = 'color',
//     }

//     export const ThemeFieldDatatypes: {
//         [key in ThemeFieldTypes] : {
//             type: key;
//             default?: any;
//             [key: string]: any;
//         }
//     } = {
//         [ThemeFieldTypes.STRING]: {
//             type: ThemeFieldTypes.STRING,
//             default: '',
//         },
//         [ThemeFieldTypes.NUMBER]: {
//             type: ThemeFieldTypes.NUMBER,
//             default: 0,
//         },
//         [ThemeFieldTypes.BOOLEAN]: {
//             type: ThemeFieldTypes.BOOLEAN,
//             default: false,
//         },
//         [ThemeFieldTypes.COLOR]: {
//             type: ThemeFieldTypes.COLOR,
//             default: '#000000',
//         },
//     }

//     export type ThemeFieldValidationFailure = {
//         isValid: false;
//         errors: string[];
//     }
//     export type ThemeFieldValidationSuccess = {
//         isValid: true;
//     }
//     export type ThemeFieldValidationResult = ThemeFieldValidationFailure | ThemeFieldValidationSuccess;
//     export type ThemeFieldValidator<T extends ThemeFieldTypes> = (fieldData: ThemeManifest['fields'][string], fieldValue:any) => ThemeFieldValidationResult;
//     export const ThemeFieldValidators: {
//         [key in ThemeFieldTypes]: ThemeFieldValidator<key>;
//     } = {
//         [ThemeFieldTypes.STRING]: (fieldData, fieldValue) => {
//             if (typeof fieldValue !== 'string') {
//                 return {
//                     isValid: false,
//                     errors: ['Field must be a string. Type received: ' + typeof fieldValue + '. Value received: ' + fieldValue],
//                 }
//             }
//             return {
//                 isValid: true,
//             }
//         },
//         [ThemeFieldTypes.NUMBER]: (fieldData, fieldValue) => {
//             if (typeof fieldValue !== 'number') {
//                 return {
//                     isValid: false,
//                     errors: ['Field must be a number. Type received: ' + typeof fieldValue + '. Value received: ' + fieldValue],
//                 }
//             }
//             return {
//                 isValid: true,
//             }
//         },
//         [ThemeFieldTypes.BOOLEAN]: (fieldData, fieldValue) => {
//             if (typeof fieldValue !== 'boolean') {
//                 return {
//                     isValid: false,
//                     errors: ['Field must be a boolean. Type received: ' + typeof fieldValue + '. Value received: ' + fieldValue],
//                 }
//             }
//             return {
//                 isValid: true,
//             }
//         },
//         [ThemeFieldTypes.COLOR]: (fieldData, fieldValue) => {
//             if (typeof fieldValue !== 'string') {
//                 return {
//                     isValid: false,
//                     errors: ['Field must be a string. Type received: ' + typeof fieldValue + '. Value received: ' + fieldValue],
//                 }
//             }
//             if (!/^#[0-9A-F]{6}$/i.test(fieldValue)) {
//                 return {
//                     isValid: false,
//                     errors: ['Field must be a valid color hex code. Value received: ' + fieldValue],
//                 }
//             }
//             return {
//                 isValid: true,
//             }
//         },
//     }
            
//     export type ThemeValidationResult = {
//         isValid: true,
//     } | {
//         isValid: false;
//         errors: {
//             [key: string]: string[];
//         }
//     }

//     export type ThemeManifest = {
//         slug: string;
//         name: string;
//         fields: {
//             [key: string]: {
//                 type: ThemeFieldTypes;
//                 default: any;
//             }
//         }
//     }

//     export type ThemeConfigFromManifest<T extends ThemeManifest> = {
//         [key in keyof T['fields']]: T['fields'][key]['default'];
//     }

//     export function validateConfig(manifest:ThemeManifest, config:ThemeConfigFromManifest<typeof manifest>) : ThemeValidationResult {
//         const errors: {
//             [key: string]: string[];
//         } = {};
//         for (const fieldKey in manifest.fields) {
//             const fieldData = manifest.fields[fieldKey];
//             const fieldValue = config[fieldKey];
//             const validator = ThemeFieldValidators[fieldData.type];
//             const validation = validator(fieldData, fieldValue);
//             if (!validation.isValid) {
//                 errors[fieldKey] = validation.errors;
//             }
//         }
//         if (Object.keys(errors).length > 0) {
//             return {
//                 isValid: false,
//                 errors,
//             }
//         }
//         return {
//             isValid: true,
//         }
//     }



    
// }