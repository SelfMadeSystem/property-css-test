"use server";

import { JSDOM } from "jsdom";
import dompurify from "dompurify";
import { sanitizeCss } from "./cssSanitize";
import { ExportData } from "@/components/ShadowDomCreator";

const window = new JSDOM("").window;
const purify = dompurify(window);

// Remove links from style attributes
purify.addHook("afterSanitizeAttributes", (node) => {
  if (node.hasAttribute("style")) {
    node.setAttribute(
      "style",
      node.getAttribute("style")!.replace(/url\([^)]+\)/g, "")
    );
  }
});

function sanitizeHtml(html: string) {
  return purify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    FORBID_ATTR: ["href", "src", "xlink:href"],
  });
}

function sanitizePropertyName(name: string) {
  return name.replace(/[^a-zA-Z0-9-]/g, "_");
}

function sanitizeProperties(properties: unknown[]): PropertyDefinition[] {
  return properties.map((property) => {
    if (typeof property !== "object") {
      throw new Error("Invalid property");
    }
    if (!property) {
      throw new Error("Invalid property");
    }
    if (
      !("name" in property) ||
      !("syntax" in property) ||
      !("initialValue" in property) ||
      !("inherits" in property)
    ) {
      throw new Error("Invalid property format");
    }
    if (
      typeof property.name !== "string" ||
      typeof property.syntax !== "string" ||
      typeof property.initialValue !== "string" ||
      typeof property.inherits !== "boolean"
    ) {
      throw new Error("Invalid property format");
    }
    return {
      name: sanitizePropertyName(property.name),
      syntax: property.syntax,
      initialValue: property.initialValue,
      inherits: property.inherits,
    };
  });
}

export async function sanitize(data: unknown): Promise<ExportData> {
  if (typeof data !== "object") {
    throw new Error("Invalid data type");
  }
  if (!data) {
    throw new Error("Invalid data");
  }
  if (!("html" in data) || !("css" in data) || !("properties" in data)) {
    throw new Error("Invalid data format");
  }
  if (typeof data.html !== "string" || typeof data.css !== "string") {
    throw new Error("Invalid data format");
  }
  if (!Array.isArray(data.properties)) {
    throw new Error("Invalid data format");
  }

  const sanitizedHtml = sanitizeHtml(data.html);
  const sanitizedCss = sanitizeCss(data.css);
  const sanitizedProperties = sanitizeProperties(data.properties);
  return {
    html: sanitizedHtml,
    css: sanitizedCss,
    properties: sanitizedProperties,
  };
}
