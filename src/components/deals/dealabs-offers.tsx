import React from 'react';
import { Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamingComparisonTable } from './streaming-comparison-table';
import { PressComparisonTable } from './press-comparison-table';
import { GamingComparisonTable } from './gaming-comparison-table';
import { FitnessComparisonTable } from './fitness-comparison-table';
import { CreativityComparisonTable } from './creativity-comparison-table';
import { ProductivityComparisonTable } from './productivity-comparison-table';

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="press">Presse</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="creativity">Créativité</TabsTrigger>
          <TabsTrigger value="productivity">Productivité</TabsTrigger>
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

        <TabsContent value="fitness">
          <FitnessComparisonTable />
        </TabsContent>

        <TabsContent value="creativity">
          <CreativityComparisonTable />
        </TabsContent>

        <TabsContent value="productivity">
          <ProductivityComparisonTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};