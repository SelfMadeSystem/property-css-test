# Using CSS @property in Shadow DOM

As per <https://stackoverflow.com/a/79037671/13649974>:

> ...property registrations are not scoped to a tree scope. All registrations, whether they appear in the outermost document or within a **shadow tree**, interact in a single global registration map for the Document...

Therefore, you can't use `@property` in `<style>` tags inside a Shadow DOM.

However, using PostCSS, manually registering the properties using `CSS.registerProperty`, and some shenanigans, you can achieve the same effect.

## How it works

PostCSS is used to find all `@property` declarations in the CSS and generate a list of `PropertyDefinition` objects. The names of these properties are then replaced with a unique identifier, and the `PropertyDefinition` objects are registered using `CSS.registerProperty`. The original names are replaced in the CSS and HTML with the unique identifiers. This way, we can use `@property` in Shadow DOM without multiple definitions clashing.

## Showcase

https://github.com/user-attachments/assets/2b879af6-8e63-4fe8-9931-6ae46464bf6b

## Limitations

As this is a proof of concept, there are some limitations:

- Including all of PostCSS in the final bundle might be a little heavy for some use cases. (PostCSS isn't actually as big as I thought; it's significantly smaller than React)
- Might not perfectly replace all variable names in the CSS and HTML.
- Can't unregister properties. It's not possible to unregister properties in the CSSOM, so this is a limitation of the method.
- Doesn't check if the browser supports `CSS.registerProperty`. It obviously won't work in browsers that don't support it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
