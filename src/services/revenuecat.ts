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
        identifier: 'premium_monthly',
        packageType: 'MONTHLY',
        product: {
          identifier: 'PM02',
          description: 'Accès complet aux fonctionnalités premium',
          title: 'Premium Mensuel',
          priceString: '4,99 €',
          price: 4.99,
          currencyCode: 'EUR',
        },
        offeringIdentifier: 'default',
      },
      {
        identifier: 'premium_lifetime',
        packageType: 'LIFETIME',
        product: {
          identifier: 'PAV02',
          description: 'Accès à vie aux fonctionnalités premium',
          title: 'Premium à vie',
          priceString: '49,99 €',
          price: 49.99,
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
        
        const platform = Capacitor.getPlatform();
        console.log('Configuring RevenueCat for platform:', platform);
        
        if (platform === 'ios') {
          await Purchases.configure({
            apiKey: 'appl_GQGNOrPGOAqUKRTcAhDYoCAZPZN',
          });
          console.log('RevenueCat configured with API key for iOS');
        } else if (platform === 'android') {
          // TODO: Remplacer par votre clé API Google Play
          await Purchases.configure({
            apiKey: 'goog_YOUR_GOOGLE_API_KEY_HERE',
          });
          console.log('RevenueCat configured with API key for Android');
        } else {
          console.warn('Unsupported platform for RevenueCat:', platform);
          throw new Error(`Unsupported platform: ${platform}`);
        }
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
        console.log('RevenueCat offerings:', offerings);
        console.log('Current offering:', offerings.current);
        console.log('All offerings:', offerings.all);
        
        // Si l'offering s'appelle "Default" dans RevenueCat, essayons de le récupérer
        if (!offerings.current && offerings.all) {
          console.log('No current offering, checking for Default offering...');
          const defaultOffering = offerings.all['Default'] || offerings.all['default'];
          if (defaultOffering) {
            console.log('Found Default offering:', defaultOffering);
            return defaultOffering;
          }
        }
        if (offerings.current && offerings.current.availablePackages) {
          console.log('Available packages:', offerings.current.availablePackages);
          offerings.current.availablePackages.forEach((pkg: any) => {
            console.log('Package details:', {
              identifier: pkg.identifier,
              productId: pkg.product.identifier,
              packageType: pkg.packageType
            });
          });
        }
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
        
        console.log('Attempting to purchase package:', packageToPurchase);
        console.log('Package identifier:', packageToPurchase.identifier);
        console.log('Product identifier:', packageToPurchase.product?.identifier);
        console.log('Package type:', packageToPurchase.packageType);
        
        // Vérifier si le package a tous les champs requis
        if (!packageToPurchase.identifier) {
          throw new Error('Package identifier is missing');
        }
        
        if (!packageToPurchase.product?.identifier) {
          throw new Error('Product identifier is missing');
        }
        
        // Assurons-nous que le package a le bon format avec presentedOfferingContext
        const packageWithContext = {
          ...packageToPurchase,
          presentedOfferingContext: {
            offeringIdentifier: packageToPurchase.offeringIdentifier || 'default',
            placementIdentifier: null,
            targetingContext: null
          }
        };
        
        console.log('Package with context:', packageWithContext);
        
        const purchaseResult = await Purchases.purchasePackage({
          aPackage: packageWithContext,
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
      console.error('Purchase failed with error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
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