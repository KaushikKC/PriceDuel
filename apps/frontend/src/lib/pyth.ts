import { HermesClient } from "@pythnetwork/hermes-client";

const HERMES_ENDPOINT = "https://hermes.pyth.network";

export const PYTH_PRICE_IDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
};

const connection = new HermesClient(HERMES_ENDPOINT, {});

type PriceUpdate = {
  id?: string;
  price?: { price: string; expo: number };
};

export async function getLatestPythPrices() {
  const priceIds = Object.values(PYTH_PRICE_IDS);
  const priceUpdatesObj = await connection.getLatestPriceUpdates(priceIds);
  console.log(priceUpdatesObj);

  // Fix type error: cast to unknown first, then to PriceUpdate[]
  const priceUpdates: PriceUpdate[] = (
    priceUpdatesObj as unknown as { parsed?: unknown[] }
  ).parsed as unknown as PriceUpdate[];

  console.log(priceUpdates);

  // Map the result to asset keys and format as human-readable currency
  const result: Record<string, string | null> = {};
  for (const [key, id] of Object.entries(PYTH_PRICE_IDS)) {
    const cleanId = id.startsWith("0x")
      ? id.slice(2).toLowerCase()
      : id.toLowerCase();
    const update = Array.isArray(priceUpdates)
      ? priceUpdates.find((p) => p.id?.toLowerCase() === cleanId)
      : undefined;

    console.log(update, "update");
    if (update?.price?.price && typeof update.price.expo === "number") {
      const value =
        parseFloat(update.price.price) * Math.pow(10, update.price.expo);
      // Format as $123,456.78
      result[key] = `$${value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })}`;
    } else {
      result[key] = null;
    }
  }
  return result;
}
