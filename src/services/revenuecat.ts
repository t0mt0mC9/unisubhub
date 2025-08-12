import { Purchases, LOG_LEVEL, PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';

export interface SubscriptionInfo {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  tier: 'Basic' | 'Premium' | 'Enterprise' | null;
}

class RevenueCatService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      
      // Remplacez 'your_api_key' par votre clé API RevenueCat
      await Purchases.configure({
        apiKey: 'appl_GQGNOrPGOAqUKRTcAhDYoCAZPZN',
      });

      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.all ? Object.values(offerings.all) : [];
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current || null;
    } catch (error) {
      console.error('Failed to get current offering:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: packageToPurchase,
      });
      
      console.log('Purchase successful:', purchaseResult);
      return purchaseResult.customerInfo;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const restoreResult = await Purchases.restorePurchases();
      console.log('Purchases restored:', restoreResult);
      return restoreResult.customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const result = await Purchases.getCustomerInfo();
      return result.customerInfo;
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
    // Adaptez selon vos identifiants de produits
    if (productId.includes('basic')) return 'Basic';
    if (productId.includes('premium')) return 'Premium';
    if (productId.includes('enterprise')) return 'Enterprise';
    return 'Basic'; // Valeur par défaut
  }

  async logout() {
    try {
      await Purchases.logOut();
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  async identifyUser(userId: string) {
    try {
      const result = await Purchases.logIn({ appUserID: userId });
      console.log('User identified in RevenueCat:', userId);
      return result.customerInfo;
    } catch (error) {
      console.error('Failed to identify user:', error);
      throw error;
    }
  }
}

export const revenueCatService = new RevenueCatService();