import { Alchemy, Network } from "alchemy-sdk";

// Singleton Alchemy client instance
let alchemyClient: Alchemy | null = null;

export function getAlchemyClient(): Alchemy {
  if (!alchemyClient) {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
    }

    alchemyClient = new Alchemy({
      apiKey,
      network: Network.ARB_SEPOLIA, // Using Arbitrum Sepolia as configured
    });
  }

  return alchemyClient;
}

// Export the client instance for direct use if needed
export { alchemyClient };
