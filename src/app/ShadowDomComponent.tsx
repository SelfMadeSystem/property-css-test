import { useRef, useEffect } from "react";
import postcss from "postcss";
import { v4 as uuid } from "uuid";

/**
 * Finds all registered CSS properties in a PostCSS root.
 *
 * Registered CSS properties are defined using the `@property` rule.
 */
function findCssProperties(root: postcss.Root): PropertyDefinition[] {
  const properties: PropertyDefinition[] = [];
  root.walkAtRules("property", (rule) => {
    const property = {
      name: rule.params,
      syntax: "",
      inherits: false,
      initialValue: "",
    };
    rule.walkDecls((decl) => {
      switch (decl.prop) {
        case "syntax":
          // syntax should always be in quotes. If it is, remove the quotes
          property.syntax = decl.value.replace(/['"]+/g, "");
          break;
        case "inherits":
          property.inherits = decl.value === "true";
          break;
        case "initial-value":
          property.initialValue = decl.value;
          break;
      }
    });
    properties.push(property);
  });
  return properties;
}

/**
 * Removes all registered CSS properties from a PostCSS root.
 *
 * @returns The resulting CSS string.
 */
function removeCssProperties(root: postcss.Root) {
  root.walkAtRules("property", (rule) => {
    rule.remove();
  });
}

/**
 * Replaces all instances of a CSS properties with other properties in a PostCSS
 * root.
 */
function replaceCssProperty(
  root: postcss.Root,
  replacements: [string, string][]
) {
  root.walkDecls((decl) => {
    replacements.forEach(([oldProperty, newProperty]) => {
      decl.prop = decl.prop.replace(new RegExp(oldProperty, "g"), newProperty);
      decl.value = decl.value.replace(
        new RegExp(oldProperty, "g"),
        newProperty
      );
    });
  });
}

/**
 * Replaces all instances of a CSS property in an HTML string with another
 * property name.
 */
function replaceHtmlProperty(
  html: string,
  oldProperty: string,
  newProperty: string
) {
  return html.replace(new RegExp(oldProperty, "g"), newProperty);
}

export function ShadowDomComponent({
  css,
  html,
}: {
  css: string;
  html: string;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const shadowRoot = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }
    const postcssRoot = postcss.parse(css);
    const cssProperties = findCssProperties(postcssRoot);
    const uuids = cssProperties.map(() => `--${uuid()}`);

    // Register all CSS properties
    cssProperties.forEach((property, i) => {
      CSS.registerProperty({
        ...property,
        name: uuids[i],
      });
    });

    // Replace all CSS properties in the HTML string with the generated
    // property names
    let replacedHtml = html;
    cssProperties.forEach((property, i) => {
      replacedHtml = replaceHtmlProperty(replacedHtml, property.name, uuids[i]);
    });

    // Replace all CSS properties in the CSS string with the generated
    // property names
    removeCssProperties(postcssRoot);
    replaceCssProperty(postcssRoot, cssProperties.map((p, i) => [p.name, uuids[i]]));
    const replacedCss = postcssRoot.toString();

    // Time to render the shadow DOM

    // Create the shadow root if it doesn't exist
    if (!shadowRoot.current) {
      shadowRoot.current = previewRef.current.attachShadow({ mode: "open" });
    }

    // Create a style element and append it to the shadow root
    const style = document.createElement("style");
    style.textContent = replacedCss;
    shadowRoot.current.innerHTML = "";
    shadowRoot.current.appendChild(style);
    shadowRoot.current.innerHTML += replacedHtml;
  }, [css, html]);

  return <div ref={previewRef}></div>;
}
