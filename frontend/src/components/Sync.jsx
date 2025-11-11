import React, { useState } from "react";
import { syncBatch } from "../api";

export default function Sync({ apiBase, token }) {
  const [payload, setPayload] = useState(
    '{\n  "farmers": [\n    {\n      "personal_info": {"first_name":"John","last_name":"Doe","phone_primary":"+260..."},\n      "address": {"province":"Lusaka","district":"..."}\n    }\n  ]\n}'
  );
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);

  async function send() {
    setMsg("");
    setStatus(null);
    try {
      const parsed = JSON.parse(payload);
      const res = await syncBatch(apiBase, token, parsed);
      setMsg("Queued: " + res.job_id);
      setStatus(res);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div className="view">
      <h2>Sync Batch</h2>
      <textarea value={payload} onChange={(e) => setPayload(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button onClick={send}>Send Sync</button>
      </div>
      <div className="message">{msg}</div>
      {status && <pre className="panel">{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
}
