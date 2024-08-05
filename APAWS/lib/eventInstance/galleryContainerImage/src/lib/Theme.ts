import ThemeDark from "./themes/ThemeDark.svelte";
import ThemeDefault from "./themes/ThemeDefault.svelte";
import ThemeTest from "./themes/Richard/ThemeTest.svelte";
import Theme2 from "./themes/Richard2/Theme2.svelte";
import Theme3 from "./themes/Richard3/Theme3.svelte";

export enum ETheme {
    DEFAULT = 'default',
    DARK = 'dark',
    Test = 'test',
    Theme2 = 'Theme2',
    Theme3 = 'Theme3',
}

export const ThemeComponentMapping: {
    [key in ETheme]: any;
} = {
    [ETheme.DEFAULT]: ThemeDefault,
    [ETheme.DARK]: ThemeDark,
    [ETheme.Test]: ThemeTest,
    [ETheme.Theme2]: Theme2,
    [ETheme.Theme3]: Theme3,
};