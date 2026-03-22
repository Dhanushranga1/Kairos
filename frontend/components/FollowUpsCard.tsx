"use client";

import { useState } from "react";
import { FollowUp } from "@/lib/types";
import Card from "@/components/ui/Card";

function EmailDraft({ fu }: { fu: FollowUp }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${fu.to}\nSubject: ${fu.subject}\n\n${fu.message}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">To: <span className="text-gray-300">{fu.to}</span></p>
          <p className="text-sm font-medium text-white mt-0.5">{fu.subject}</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex-shrink-0"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{fu.message}</p>
    </div>
  );
}

export default function FollowUpsCard({ followUps }: { followUps?: FollowUp[] }) {
  if (!followUps || followUps.length === 0) return null;
  return (
    <Card title="Suggested Follow-ups">
      <div className="space-y-3">
        {followUps.map((fu, i) => (
          <EmailDraft key={i} fu={fu} />
        ))}
      </div>
    </Card>
  );
}
