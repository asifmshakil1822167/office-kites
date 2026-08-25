import { Radio, WifiOff } from 'lucide-react';

const LiveBadge = ({ live, lastUpdate }: { live: boolean; lastUpdate: Date | null }) => (
  <div className="flex items-center gap-2 text-xs">
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
        live ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {live ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
      {live ? 'Live' : 'Reconnecting'}
    </span>
    {lastUpdate && (
      <span className="text-muted-foreground hidden sm:inline">
        updated {lastUpdate.toLocaleTimeString()}
      </span>
    )}
  </div>
);

export default LiveBadge;
