import { Chain } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const alchemyRpcUrl = `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
export const DEFAULT_CHAIN: Chain = arbitrumSepolia;
