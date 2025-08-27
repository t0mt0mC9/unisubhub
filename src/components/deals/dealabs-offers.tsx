import React from 'react';
import { Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamingComparisonTable } from './streaming-comparison-table';
import { PressComparisonTable } from './press-comparison-table';
import { GamingComparisonTable } from './gaming-comparison-table';

interface DealabsOffersProps {
  userSubscriptions?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
}

export const DealabsOffers: React.FC<DealabsOffersProps> = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Offres du marché
        </h2>
      </div>

      <Tabs defaultValue="streaming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="press">Presse</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
        </TabsList>

        <TabsContent value="streaming">
          <StreamingComparisonTable />
        </TabsContent>

        <TabsContent value="press">
          <PressComparisonTable />
        </TabsContent>

        <TabsContent value="gaming">
          <GamingComparisonTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};