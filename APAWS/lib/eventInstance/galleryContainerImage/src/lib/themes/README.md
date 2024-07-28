=== Adding a theme
- Create a new `Theme<X>.svelte` file in the `src/lib/themes` folder.
- The component takes an argument of 'galleryData' which has the following data: 
```typescript
// from $lib/EventTypes.ts
export type ThemedGalleryData = {
    theme: ETheme,
    participantCode: number,
    media: MediaData[],
}
```
- Register the theme component in the `$lib/Theme.ts` file:
- - Create a new theme id in the `ETheme` enum.
```typescript
export enum ETheme {
    DEFAULT = 'default',
    DARK = 'dark',
    // YOURTHEME = 'yourtheme',
}
```
- - Add the component mapping for your theme id:
```typescript
import ThemeDark from "./themes/ThemeDark.svelte";
import ThemeDefault from "./themes/ThemeDefault.svelte";
//import ThemeYourTheme from "./themes/ThemeYourTheme.svelte";

//...
// some code
//...

export const ThemeComponentMapping: {
    [key in ETheme]: any;
} = {
    [ETheme.DEFAULT]: ThemeDefault,
    [ETheme.DARK]: ThemeDark,
    //[ETheme.YOURTHEME]: ThemeYourTheme,
};
```