"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";
import { ExportData, ShadowDomCreator } from "@/components/ShadowDomCreator";
import Link from "next/link";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<ExportData | undefined>(undefined);
  const [html, setHtml] = useState<string | undefined>(`<div class="box"></div>
<div
  style="background:conic-gradient(from var(--a), red var(--a),blue)"
  class="box"
></div>
<div
  style="background:linear-gradient(calc(180deg - var(--a)),red  ,blue,red )"
  class="box"
></div>
`);
  const [css, setCss] = useState<string | undefined>(`@property --a {
  syntax: "<angle>";
  inherits: false;
  initial-value: 10deg;
}

.box {
  --a: 10deg; /*  needed for firefox to have a valid output */
  cursor: pointer;
  width: 250px;
  height: 200px;
  margin: 15px;
  display: inline-block;
  transition: --a 0.5s;
  background: linear-gradient(var(--a), red, blue);
}
.box:hover {
  --a: 180deg;
}
`);

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-3xl">
      <Link href="/" className="block mt-5 text-blue-500 w-fit mx-auto">
        Back to home
      </Link>
      <h1 className="text-4xl font-bold text-center mt-10">
        CSS Shadow Dom Demo
      </h1>
      <button
        className="block mx-auto bg-blue-500 text-white py-2 rounded w-20"
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(data));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <p className="text-center mt-5">
        This is a demo of CSS Shadow DOM using the <code>conic-gradient</code>{" "}
        and <code>linear-gradient</code> functions.
      </p>
      <div className="mt-10 border">
        <ShadowDomCreator
          css={css ?? ""}
          html={html ?? ""}
          setExportData={setData}
        />
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-bold">CSS</h2>
        <Editor
          language="css"
          value={css}
          onChange={(value) => setCss(value)}
          height="300px"
          theme="vs-dark"
        />
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-bold">HTML</h2>
        <Editor
          language="html"
          value={html}
          onChange={(value) => setHtml(value)}
          height="300px"
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
