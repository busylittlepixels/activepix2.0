import ThemeDark from "./themes/ThemeDark.svelte";
import ThemeDefault from "./themes/ThemeDefault.svelte";
import ThemeTest from "./themes/Richard/ThemeTest.svelte";
import Theme2 from "./themes/Theme2/Theme2.svelte";
import Theme2Locked from "./themes/Theme2Locked/Theme2Locked.svelte";

export enum ETheme {
    DEFAULT = 'default',
    DARK = 'dark',
    Test = 'test',
    Theme2 = 'Theme2',
    Theme2Locked = 'Theme2Locked',
}

export const ThemeComponentMapping: {
    [key in ETheme]: any;
} = {
    [ETheme.DEFAULT]: ThemeDefault,
    [ETheme.DARK]: ThemeDark,
    [ETheme.Test]: ThemeTest,
    [ETheme.Theme2]: Theme2,
    [ETheme.Theme2Locked]: Theme2Locked,
};