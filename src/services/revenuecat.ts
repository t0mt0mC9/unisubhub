import { Capacitor } from '@capacitor/core';

export interface SubscriptionInfo {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  tier: 'Basic' | 'Premium' | 'Enterprise' | null;
}

// Interfaces simplifiées pour le mode web
interface MockProduct {
  identifier: string;
  description: string;
  title: string;
  priceString: string;
  price: number;
  currencyCode: string;
}

interface MockPackage {
  identifier: string;
  packageType: string;
  product: MockProduct;
  offeringIdentifier: string;
}

interface MockOffering {
  identifier: string;
  serverDescription: string;
  metadata: Record<string, any>;
  availablePackages: MockPackage[];
}

interface MockCustomerInfo {
  activeSubscriptions: string[];
  entitlements: {
    active: Record<string, { expirationDate?: string }>;
  };
}

// Mock data pour le développement web
const MOCK_OFFERINGS: MockOffering[] = [
  {
    identifier: 'default',
    serverDescription: 'Default offering',
    metadata: {},
    availablePackages: [
      {
        identifier: 'basic_monthly',
        packageType: 'MONTHLY',
        product: {
          identifier: 'basic_monthly',
          description: 'Plan basique mensuel',
          title: 'Plan Basique',
          priceString: '4,99 €',
          price: 4.99,
          currencyCode: 'EUR',
        },
        offeringIdentifier: 'default',
      },
      {
        identifier: 'premium_monthly',
        packageType: 'MONTHLY',
        product: {
          identifier: 'premium_monthly',
          description: 'Plan premium mensuel',
          title: 'Plan Premium',
          priceString: '9,99 €',
          price: 9.99,
          currencyCode: 'EUR',
        },
        offeringIdentifier: 'default',
      },
    ],
  },
];

// Mock CustomerInfo pour simulation web
const MOCK_CUSTOMER_INFO: MockCustomerInfo = {
  activeSubscriptions: [],
  entitlements: { active: {} },
};

class RevenueCatService {
  private initialized = false;
  private isNative = Capacitor.isNativePlatform();
  private mockSubscriptionState = false;

  async initialize() {
    if (this.initialized) return;

    try {
      if (this.isNative) {
        // Import dynamique pour éviter les erreurs web
        const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        await Purchases.configure({
          apiKey: 'appl_GQGNOrPGOAqUKRTcAhDYoCAZPZN',
        });
        console.log('RevenueCat configured with API key for iOS');
      } else {
        // Mode simulation pour le web
        console.log('RevenueCat: Running in web simulation mode');
      }

      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async getOfferings(): Promise<any[]> {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const offerings = await Purchases.getOfferings();
        return offerings.all ? Object.values(offerings.all) : [];
      } else {
        return MOCK_OFFERINGS;
      }
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return MOCK_OFFERINGS;
    }
  }

  async getCurrentOffering(): Promise<any | null> {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const offerings = await Purchases.getOfferings();
        return offerings.current || null;
      } else {
        return MOCK_OFFERINGS[0] || null;
      }
    } catch (error) {
      console.error('Failed to get current offering:', error);
      return MOCK_OFFERINGS[0] || null;
    }
  }

  async purchasePackage(packageToPurchase: any): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const purchaseResult = await Purchases.purchasePackage({
          aPackage: packageToPurchase,
        });
        console.log('Purchase successful:', purchaseResult);
        return purchaseResult.customerInfo;
      } else {
        // Simulation d'achat pour le web
        console.log('Mock purchase successful:', packageToPurchase);
        this.mockSubscriptionState = true;
        return {
          ...MOCK_CUSTOMER_INFO,
          activeSubscriptions: [packageToPurchase.identifier],
          entitlements: {
            active: {
              [packageToPurchase.identifier]: {
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          },
        };
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const restoreResult = await Purchases.restorePurchases();
        console.log('Purchases restored:', restoreResult);
        return restoreResult.customerInfo;
      } else {
        console.log('Mock purchases restored');
        return MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const result = await Purchases.getCustomerInfo();
        return result.customerInfo;
      } else {
        return this.mockSubscriptionState ? {
          ...MOCK_CUSTOMER_INFO,
          activeSubscriptions: ['premium_monthly'],
          entitlements: {
            active: {
              premium_monthly: {
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          },
        } : MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const activeSubscriptions = customerInfo.activeSubscriptions;
      
      if (activeSubscriptions.length === 0) {
        return {
          isActive: false,
          productId: null,
          expirationDate: null,
          tier: null,
        };
      }

      // Récupérer la première souscription active
      const activeSubscription = activeSubscriptions[0];
      const entitlement = customerInfo.entitlements.active[activeSubscription];
      
      return {
        isActive: true,
        productId: activeSubscription,
        expirationDate: entitlement?.expirationDate || null,
        tier: this.getTierFromProductId(activeSubscription),
      };
    } catch (error) {
      console.error('Failed to get subscription info:', error);
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        tier: null,
      };
    }
  }

  private getTierFromProductId(productId: string): 'Basic' | 'Premium' | 'Enterprise' {
    if (productId.includes('basic')) return 'Basic';
    if (productId.includes('premium')) return 'Premium';
    if (productId.includes('enterprise')) return 'Enterprise';
    return 'Basic';
  }

  async logout() {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        await Purchases.logOut();
      } else {
        this.mockSubscriptionState = false;
      }
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  async identifyUser(userId: string) {
    try {
      if (this.isNative) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const result = await Purchases.logIn({ appUserID: userId });
        console.log('User identified in RevenueCat:', userId);
        return result.customerInfo;
      } else {
        console.log('Mock user identified:', userId);
        return MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
      throw error;
    }
  }
}

export const revenueCatService = new RevenueCatService();