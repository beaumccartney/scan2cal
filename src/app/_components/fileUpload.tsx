"use client"
import { useState } from "react";
import { api } from "~/trpc/react";

export default function S3Uploader(){
    const currentPresign = api.s3.presign.useMutation();
    const confirm = api.s3.confirm.useMutation();
    const [busy, setBusy] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);


  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setBusy(true);
    setLogs([]);

    try {
      const files = Array.from(fileList);

  
      const input =
        files.length === 1
          ? {
              filename: files[0]!.name,
              contentType: files[0]!.type || "application/octet-stream",
            }
          : {
              files: files.map((f) => ({
                filename: f.name,
                contentType: f.type || "application/octet-stream",
              })),
            };

      const result = await currentPresign.mutateAsync(input);

    
      const list = Array.isArray(result) ? result : [result];


      await Promise.all(
        list.map(async (p, i) => {
          const f = files[i]; 
          const res = await fetch(p!.url, {
            method: "PUT",
            headers: { "Content-Type": p!.contentType || "application/octet-stream" },
            body: f,
          });
          if (!res.ok) {
            throw new Error(`Upload failed: ${f!.name}`);
          }
          await confirm.mutateAsync({ key: p!.key });
          setLogs((L) => [...L, ` Uploaded: ${p!.key}`]);
        })
      );

      alert("All done!");
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        multiple
        disabled={busy || currentPresign.isPending}
        onChange={(e) => handleFiles(e.currentTarget.files)}
      />
      {busy && <p>Uploading...</p>}
      {!!logs.length && (
        <ul className="text-sm text-green-600">
          {logs.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}