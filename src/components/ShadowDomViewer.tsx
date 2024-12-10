import { useRef, useEffect } from "react";
import { ExportData } from "./ShadowDomCreator";

export function ShadowDomViewer({ css, html, properties }: ExportData) {
  const previewRef = useRef<HTMLDivElement>(null);
  const shadowRoot = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }

    // Register all CSS properties
    properties.forEach((p) => {
      try {
        CSS.registerProperty(p);
      } catch (e) {
        // Ignore `InvalidModificationError: Failed to execute 'registerProperty' on 'CSS': The name provided has already been registered`
        if (
          typeof e !== "object" ||
          !e ||
          !("name" in e) ||
          e.name !== "InvalidModificationError"
        ) {
          console.error(e);
        }
      }
    });

    // Time to render the shadow DOM

    // Create the shadow root if it doesn't exist
    if (!shadowRoot.current) {
      shadowRoot.current = previewRef.current.attachShadow({ mode: "open" });
    }

    // Create a style element and append it to the shadow root
    const style = document.createElement("style");
    style.textContent = css;
    shadowRoot.current.innerHTML = "";
    shadowRoot.current.appendChild(style);
    shadowRoot.current.innerHTML += html;
  }, [css, html, properties]);

  return <div ref={previewRef}></div>;
}
