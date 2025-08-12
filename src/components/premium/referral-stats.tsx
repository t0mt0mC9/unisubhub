import { Mail, Users, Crown, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReferralStats } from "@/hooks/use-referrals";

interface ReferralStatsProps {
  stats: ReferralStats;
}

export function ReferralStatsCards({ stats }: ReferralStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-warning" />
            <span className="text-2xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-sm text-muted-foreground">En attente</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-4 w-4 text-success" />
            <span className="text-2xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-sm text-muted-foreground">Inscrits</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-purple-500" />
            <span className="text-2xl font-bold">{stats.rewarded}</span>
          </div>
          <p className="text-sm text-muted-foreground">Récompensés</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-pink-500" />
            <span className="text-2xl font-bold">{Math.floor(stats.completed / 2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Mois gagnés</p>
        </CardContent>
      </Card>
    </div>
  );
}