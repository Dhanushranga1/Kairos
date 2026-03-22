import { ProjectData } from "@/lib/types";
import Card from "@/components/ui/Card";

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function DataOverviewCard({ data }: { data: ProjectData | null }) {
  if (!data) return null;
  return (
    <Card title="Data Overview">
      <div className="grid grid-cols-2 gap-2">
        <Count label="Tickets" value={data.tickets.length} />
        <Count label="Emails" value={data.emails.length} />
        <Count label="Messages" value={data.messages.length} />
        <Count label="Team" value={data.members.length} />
      </div>
    </Card>
  );
}
