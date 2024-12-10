import postcss from "postcss";
import safe from "postcss-safe-parser";

function removeImport(root: postcss.Root) {
  root.walkAtRules("import", (rule) => {
    rule.remove();
  });
}

function removeProperties(root: postcss.Root) {
  root.walkAtRules("property", (rule) => {
    rule.remove();
  });
}
function removeLinks(root: postcss.Root) {
  // Match external resource patterns
  const externalUrlPattern = /(http|https|\/\/)/i;

  root.walkDecls((decl) => {
    // Check if declaration contains url()
    if (decl.value.includes('url(')) {
      // If URL is external, remove the entire declaration
      if (externalUrlPattern.test(decl.value)) {
        decl.remove();
      }
    }

    // Remove other common external resource properties
    if (decl.prop === 'src' || 
        decl.prop === 'background-image' ||
        decl.prop === '@import' ||
        decl.prop === '@font-face') {
      if (externalUrlPattern.test(decl.value)) {
        decl.remove();
      }
    }
  });
}

export function sanitizeCss(css: string) {
  try {
    const root = postcss().process(css, { parser: safe }).root;
    removeImport(root);
    removeProperties(root);
    removeLinks(root);
    return root.toString();
  } catch (e) {
    console.error(e);
    return "";
  }
}

