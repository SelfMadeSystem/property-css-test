import { useRef, useEffect } from "react";
import postcss from "postcss";
import { v4 as uuid } from "uuid";

/**
 * Finds all registered CSS properties in a CSS string.
 *
 * Registered CSS properties are defined using the `@property` rule.
 */
function findCssProperties(css: string): PropertyDefinition[] {
  const root = postcss.parse(css);
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
 * Removes all registered CSS properties from a CSS string.
 */
function removeCssProperties(css: string) {
  const root = postcss.parse(css);
  root.walkAtRules("property", (rule) => {
    rule.remove();
  });
  return root.toString();
}

/**
 * Replaces all instances of a CSS property in a CSS string with another
 * property name.
 */
function replaceCssProperty(
  css: string,
  oldProperty: string,
  newProperty: string
) {
  const root = postcss.parse(css);
  root.walkDecls((decl) => {
    if (decl.prop === oldProperty) {
      decl.prop = newProperty;
    }
    if (decl.value.includes(oldProperty)) {
      decl.value = decl.value.replace(
        new RegExp(oldProperty, "g"),
        newProperty
      );
    }
  });
  return root.toString();
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
  const noDomStyleRef = useRef<HTMLStyleElement>(null);
  const noDomRef = useRef<HTMLDivElement>(null);
  const shadowRoot = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }
    const cssProperties = findCssProperties(css);
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
    let replacedCss = css;
    cssProperties.forEach((property, i) => {
      replacedCss = replaceCssProperty(replacedCss, property.name, uuids[i]);
    });
    replacedCss = removeCssProperties(replacedCss);

    // Time to render the shadow DOM

    // Create the shadow root if it doesn't exist
    if (!shadowRoot.current) {
      shadowRoot.current = previewRef.current.attachShadow({ mode: "open" });
    }

    // Create a style element and append it to the shadow root
    const style = document.createElement("style");
    style.textContent = replacedCss;
    shadowRoot.current.appendChild(style);
    shadowRoot.current.innerHTML += replacedHtml;

    // Create the no shadow DOM version
    if (!noDomRef.current || !noDomStyleRef.current) {
      return;
    }

    noDomRef.current.innerHTML = replacedHtml;
    noDomStyleRef.current.textContent = replacedCss;
  }, [css, html]);

  return <div ref={previewRef}></div>;
}
