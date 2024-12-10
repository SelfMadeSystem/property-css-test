"use client";

import { ExportData } from "@/components/ShadowDomCreator";
import { ShadowDomViewer } from "@/components/ShadowDomViewer";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState<ExportData | undefined>(undefined);
  const [pasted, setPasted] = useState(false);
  function paste() {
    navigator.clipboard.readText().then((text) => {
      try {
        setData(JSON.parse(text));
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      } catch (e) {
        console.error(e);
      }
    });
  }
  return (
    <div className="flex flex-col gap-4 mx-auto max-w-3xl">
      <Link href="/create" className="block mt-5 text-blue-500 w-fit mx-auto">
        Create
      </Link>
      <h1 className="text-4xl font-bold text-center mt-10">
        CSS Shadow Dom Demo
      </h1>
      <button
        onClick={paste}
        className="block mx-auto bg-blue-500 text-white py-2 rounded w-20"
      >
        {pasted ? "Pasted!" : "Paste"}
      </button>
      <div className="mt-10 border">
        {data && <ShadowDomViewer {...data} />}
      </div>
    </div>
  );
}
