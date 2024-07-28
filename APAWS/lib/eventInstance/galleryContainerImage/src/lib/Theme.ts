import ThemeDark from "./themes/ThemeDark.svelte";
import ThemeDefault from "./themes/ThemeDefault.svelte";
import ThemeTest from "./themes/Richard/ThemeTest.svelte";

export enum ETheme {
    DEFAULT = 'default',
    DARK = 'dark',
    Test = 'test'
}

export const ThemeComponentMapping: {
    [key in ETheme]: any;
} = {
    [ETheme.DEFAULT]: ThemeDefault,
    [ETheme.DARK]: ThemeDark,
    [ETheme.Test]: ThemeTest,
};