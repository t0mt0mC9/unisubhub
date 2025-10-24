import { Capacitor } from "@capacitor/core";

export interface SubscriptionInfo {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  tier: "Basic" | "Premium" | "Enterprise" | null;
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
    identifier: "default",
    serverDescription: "Default offering",
    metadata: {},
    availablePackages: [
      {
        identifier: "$rc_monthly",
        packageType: "MONTHLY",
        product: {
          identifier: "com.unisubhub.PM02",
          description: "Accès complet aux fonctionnalités premium",
          title: "Premium Mensuel",
          priceString: "4,99 €",
          price: 4.99,
          currencyCode: "EUR",
        },
        offeringIdentifier: "default",
      },
      {
        identifier: "$rc_lifetime",
        packageType: "LIFETIME",
        product: {
          identifier: "com.unisubhub.PAV02",
          description: "Accès à vie aux fonctionnalités premium",
          title: "Plan à vie",
          priceString: "89,99 €",
          price: 89.99,
          currencyCode: "EUR",
        },
        offeringIdentifier: "default",
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
        const { Purchases, LOG_LEVEL } = await import(
          "@revenuecat/purchases-capacitor"
        );
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        const platform = Capacitor.getPlatform();
        console.log("=== REVENUECAT INITIALIZATION DEBUG ===");
        console.log("Platform detected:", platform);
        console.log("Native platform:", this.isNative);

        if (platform === "ios") {
          console.log("Configuring RevenueCat for iOS with Sandbox...");
          await Purchases.configure({
            apiKey: "appl_GQGNOrPGOAqUKRTcAhDYoCAZPZN",
          });
          console.log("✅ RevenueCat configured for iOS");
        } else if (platform === "android") {
          console.log("Configuring RevenueCat for Android...");
          await Purchases.configure({
            apiKey: "goog_NXDlajMOxEzuDzzFDBVhJBQXfJq",
          });
          console.log("✅ RevenueCat configured for Android");

          // Test immédiat de l'API
          try {
            console.log("Testing RevenueCat API...");
            const customerInfo = await Purchases.getCustomerInfo();
            console.log(
              "✅ Customer info retrieved successfully:",
              customerInfo
            );

            // Test des offerings
            console.log("Testing offerings retrieval...");
            const offerings = await Purchases.getOfferings();
            console.log("✅ Offerings retrieved:", offerings);
            console.log(
              "Available offerings count:",
              Object.keys(offerings.all || {}).length
            );
          } catch (testError) {
            console.error("❌ RevenueCat API test failed:", testError);
            console.error("Error code:", (testError as any).code);
            console.error("Error message:", (testError as any).message);
            console.error("Error userInfo:", (testError as any).userInfo);
            throw testError;
          }
        } else {
          console.warn("❌ Unsupported platform for RevenueCat:", platform);
          throw new Error(`Unsupported platform: ${platform}`);
        }
      } else {
        // Mode simulation pour le web
        console.log("RevenueCat: Running in web simulation mode");
      }

      this.initialized = true;
      console.log("✅ RevenueCat initialization completed successfully");
    } catch (error) {
      console.error("❌ Failed to initialize RevenueCat:", error);
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);
      console.error("Error details:", JSON.stringify(error, null, 2));
      this.initialized = false;
      throw error;
    }
  }

  async getOfferings(): Promise<any[]> {
    try {
      if (this.isNative) {
        console.log("=== GETTING OFFERINGS - DEBUG ===");

        if (!this.initialized) {
          console.log("RevenueCat not initialized, initializing...");
          await this.initialize();
        }

        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        console.log("Fetching offerings from RevenueCat...");

        const offerings = await Purchases.getOfferings();
        console.log("✅ Offerings retrieved successfully");
        console.log(
          "Total offerings available:",
          Object.keys(offerings.all || {}).length
        );

        if (!offerings.all || Object.keys(offerings.all).length === 0) {
          console.error("❌ No offerings found in RevenueCat");
          console.error("This usually means:");
          console.error("1. Products not configured in App Store Connect");
          console.error(
            "2. Products not submitted for review in App Store Connect"
          );
          console.error("3. RevenueCat configuration issue");
          console.error(
            "4. Using sandbox environment - check App Store Connect sandbox setup"
          );

          // Return empty array instead of throwing error
          return [];
        }

        return offerings.all ? Object.values(offerings.all) : [];
      } else {
        console.log("Using mock offerings for web platform");
        return MOCK_OFFERINGS;
      }
    } catch (error) {
      console.error("❌ Failed to get offerings:", error);
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);

      // Si c'est l'erreur 23 (configuration), on lance une erreur plus explicite
      if ((error as any).code === 23) {
        throw new Error(
          "Erreur de configuration RevenueCat - Vérifiez que vos produits sont soumis dans App Store Connect"
        );
      }

      // Pour les autres erreurs, on retourne les mock data pour éviter le crash
      console.log("Returning mock offerings as fallback");
      return MOCK_OFFERINGS;
    }
  }

  async getCurrentOffering(): Promise<any | null> {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        const offerings = await Purchases.getOfferings();
        console.log("=== OFFERINGS DEBUG ===");
        console.log(
          "RevenueCat offerings:",
          JSON.stringify(offerings, null, 2)
        );
        console.log("Current offering:", offerings.current);
        console.log("All offerings:", offerings.all);

        // Log détaillé des offerings disponibles
        if (offerings.all) {
          console.log("Available offerings keys:", Object.keys(offerings.all));
          Object.entries(offerings.all).forEach(
            ([key, offering]: [string, any]) => {
              console.log(`=== Offering "${key}" ===`);
              console.log(
                `- Has ${offering.availablePackages?.length || 0} packages`
              );
              if (offering.availablePackages) {
                offering.availablePackages.forEach((pkg: any) => {
                  console.log(`  Package: ${pkg.identifier}`);
                  console.log(`    Product ID: ${pkg.product.identifier}`);
                  console.log(`    Product Title: ${pkg.product.title}`);
                  console.log(`    Package Type: ${pkg.packageType}`);
                  console.log(`    Price: ${pkg.product.priceString}`);
                });
              }
            }
          );
        }

        // Essayer de trouver un offering par priorité
        let targetOffering = null;

        if (offerings.current) {
          console.log("Using current offering");
          targetOffering = offerings.current;
        } else if (offerings.all) {
          // Essayer différents noms d'offering
          const possibleNames = ["default", "Default", "PRIMARY", "MAIN"];
          for (const name of possibleNames) {
            if (offerings.all[name]) {
              console.log(`Found offering with name: ${name}`);
              targetOffering = offerings.all[name];
              break;
            }
          }

          // Si aucun offering nommé trouvé, prendre le premier disponible
          if (!targetOffering) {
            const firstOfferingKey = Object.keys(offerings.all)[0];
            if (firstOfferingKey) {
              console.log(
                `Using first available offering: ${firstOfferingKey}`
              );
              targetOffering = offerings.all[firstOfferingKey];
            }
          }
        }

        if (targetOffering) {
          console.log("Selected offering:", targetOffering.identifier);
          console.log("Available packages in selected offering:");
          targetOffering.availablePackages?.forEach((pkg: any) => {
            console.log(`- ${pkg.identifier} (${pkg.product.identifier})`);
          });
        } else {
          console.error("No offering found!");
        }

        return targetOffering;
      } else {
        return MOCK_OFFERINGS[0] || null;
      }
    } catch (error) {
      console.error("Failed to get current offering:", error);
      return MOCK_OFFERINGS[0] || null;
    }
  }

  async purchasePackage(packageToPurchase: any): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");

        console.log("=== PURCHASE DEBUG ===");
        console.log("Attempting to purchase package:", packageToPurchase);
        console.log("Package identifier:", packageToPurchase.identifier);
        console.log(
          "Product identifier:",
          packageToPurchase.product?.identifier
        );
        console.log("Package type:", packageToPurchase.packageType);
        console.log(
          "Offering identifier:",
          packageToPurchase.offeringIdentifier
        );

        // Vérifier les offerings disponibles avant l'achat
        const offerings = await Purchases.getOfferings();
        console.log("Available offerings before purchase:", offerings);
        console.log(
          "Current offering packages:",
          offerings.current?.availablePackages
        );

        // Vérifier si le package a tous les champs requis
        if (!packageToPurchase.identifier) {
          console.error("ERROR: Package identifier is missing");
          throw new Error("Package identifier is missing");
        }

        if (!packageToPurchase.product?.identifier) {
          console.error("ERROR: Product identifier is missing");
          throw new Error("Product identifier is missing");
        }

        // Chercher le package dans les offerings actuels
        const currentOffering = offerings.current;
        if (currentOffering && currentOffering.availablePackages) {
          const foundPackage = currentOffering.availablePackages.find(
            (pkg: any) =>
              pkg.identifier === packageToPurchase.identifier ||
              pkg.product.identifier === packageToPurchase.product.identifier
          );
          console.log("Package found in current offering:", foundPackage);

          if (!foundPackage) {
            console.error("ERROR: Package not found in current offering!");
            console.error(
              "Looking for package identifier:",
              packageToPurchase.identifier
            );
            console.error(
              "Looking for product identifier:",
              packageToPurchase.product.identifier
            );
            console.error("Available packages:");
            currentOffering.availablePackages.forEach((pkg: any) => {
              console.error(
                `- Package: ${pkg.identifier}, Product: ${pkg.product.identifier}`
              );
            });
            throw new Error(
              `Package ${packageToPurchase.identifier} not found in current offering`
            );
          }
        }

        // Assurons-nous que le package a le bon format avec presentedOfferingContext
        const packageWithContext = {
          ...packageToPurchase,
          presentedOfferingContext: {
            offeringIdentifier:
              packageToPurchase.offeringIdentifier || "default",
            placementIdentifier: null,
            targetingContext: null,
          },
        };

        console.log("Package with context:", packageWithContext);

        const purchaseResult = await Purchases.purchasePackage({
          aPackage: packageWithContext,
        });
        console.log("Purchase successful:", purchaseResult);
        return purchaseResult.customerInfo;
      } else {
        // Simulation d'achat pour le web
        console.log("Mock purchase successful:", packageToPurchase);
        this.mockSubscriptionState = true;
        return {
          ...MOCK_CUSTOMER_INFO,
          activeSubscriptions: [packageToPurchase.identifier],
          entitlements: {
            active: {
              [packageToPurchase.identifier]: {
                expirationDate: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            },
          },
        };
      }
    } catch (error) {
      console.error("=== PURCHASE ERROR ===");
      console.error("Purchase failed with error:", error);
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async restorePurchases(): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        const restoreResult = await Purchases.restorePurchases();
        console.log("Purchases restored:", restoreResult);
        return restoreResult.customerInfo;
      } else {
        console.log("Mock purchases restored");
        return MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<any> {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        const result = await Purchases.getCustomerInfo();
        return result.customerInfo;
      } else {
        return this.mockSubscriptionState
          ? {
              ...MOCK_CUSTOMER_INFO,
              activeSubscriptions: ["$rc_monthly"],
              entitlements: {
                active: {
                  $rc_monthly: {
                    expirationDate: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                  },
                },
              },
            }
          : MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error("Failed to get customer info:", error);
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
      console.error("Failed to get subscription info:", error);
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        tier: null,
      };
    }
  }

  private getTierFromProductId(
    productId: string
  ): "Basic" | "Premium" | "Enterprise" {
    if (productId.includes("basic")) return "Basic";
    if (productId.includes("premium")) return "Premium";
    if (productId.includes("enterprise")) return "Enterprise";
    return "Basic";
  }

  async logout() {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        await Purchases.logOut();
      } else {
        this.mockSubscriptionState = false;
      }
      console.log("User logged out from RevenueCat");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  async identifyUser(userId: string) {
    try {
      if (this.isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        const result = await Purchases.logIn({ appUserID: userId });
        console.log("User identified in RevenueCat:", userId);
        return result.customerInfo;
      } else {
        console.log("Mock user identified:", userId);
        return MOCK_CUSTOMER_INFO;
      }
    } catch (error) {
      console.error("Failed to identify user:", error);
      throw error;
    }
  }

  async presentCodeRedemptionSheet(): Promise<void> {
    try {
      if (this.isNative && Capacitor.getPlatform() === "ios") {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        await Purchases.presentCodeRedemptionSheet();
        await Purchases.syncPurchases();
        console.log("Code redemption sheet presented");
      } else {
        console.log("Code redemption sheet is only available on iOS");
        throw new Error(
          "La fonctionnalité de code promo n'est disponible que sur iOS"
        );
      }
    } catch (error) {
      console.error("Failed to present code redemption sheet:", error);
      throw error;
    }
  }
}

export const revenueCatService = new RevenueCatService();
