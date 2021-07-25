# PostCSS split CSS by Media Queries

Look through the test results to see how files are manipulated and split.

## Caveats

This plugin does not and can never know which other plugins have preceded it and which plugins need to be run after it.

Since it also leaves white space where CSS used to be it is best to use a two stage processing pipeline.

First transform your CSS to a good baseline (e.g. `postcss-preset-env`, `postcss-nesting`, ...) with this plugin last.

Then run a second stage to finalize your CSS (e.g. `cssnano`, sourcemaps, ...).

Use the manifest json file or the manifest callback to get the list of files from the first stage.

## Options

```js
{
	onManifest: (manifest) => {
		console.log(manifest);
	}
}
```

## In action

input : 

```css
.foo {
	color: red;
}

@media (min-width: 240px) {
	.foo {
		color: blue;
	}
}
```

output file a :

```css
.foo {
	color: red;
}
```

output file b :

```css
@media (min-width: 240px) {
	.foo {
		color: blue;
	}
}
```

manifest :

```json
[
    {
        "base": "breakpoint.result.css",
        "media": ""
    }
    {
        "base": "breakpoint.result.at-media-min-width-240px.css",
        "media": "(min-width: 240px)"
    },
]
```

## Supports

- `@media` rules inside `@supports`
- `@supports` rules inside `@media`
- same for all other and future combinations
- sourcemaps

## Does not support and will never support

Nested CSS (because you shouldn't be nesting CSS)
Transform to normal CSS before passing CSS to this plugin.
