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

      <Tabs defaultValue="streaming" className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-6 min-w-max lg:grid-cols-6 lg:min-w-full">
            <TabsTrigger value="streaming" className="whitespace-nowrap text-xs sm:text-sm">Streaming</TabsTrigger>
            <TabsTrigger value="press" className="whitespace-nowrap text-xs sm:text-sm">Presse</TabsTrigger>
            <TabsTrigger value="gaming" className="whitespace-nowrap text-xs sm:text-sm">Gaming</TabsTrigger>
            <TabsTrigger value="fitness" className="whitespace-nowrap text-xs sm:text-sm">Fitness</TabsTrigger>
            <TabsTrigger value="creativity" className="whitespace-nowrap text-xs sm:text-sm">Créativité</TabsTrigger>
            <TabsTrigger value="productivity" className="whitespace-nowrap text-xs sm:text-sm">Productivité</TabsTrigger>
          </TabsList>
        </div>

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