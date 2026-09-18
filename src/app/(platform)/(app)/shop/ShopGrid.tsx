"use client";

import { useMemo, useState } from "react";
import { ShopArt } from "@/components/platform/art";
import { IconCheck, IconCoin } from "@/components/platform/icons";
import { Panel, cx } from "@/components/platform/ui";
import { SHOP_ITEMS } from "@/lib/data";
import { useStore } from "@/lib/store";

const CATEGORIES = ["All", "Grants", "Tools", "Parts", "Swag"] as const;

export function ShopGrid() {
  const { coins, printerFund } = useStore();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [owned, setOwned] = useState<string[]>([]);

  const items = useMemo(
    () => (cat === "All" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === cat)),
    [cat],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={cx(
              "label rounded-full border-2 px-4 py-1.5 transition-colors",
              cat === c
                ? "border-navy bg-navy text-white"
                : "border-line text-navy-soft hover:border-navy hover:text-navy",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {items.map((item) => {
          const has = owned.includes(item.id);
          const out = item.stock === "out";
          // Banked coins are legal tender for a printer and for nothing else, so
          // what you can afford depends on what you are buying. Without this the
          // shop would offer to sell someone a hoodie out of their printer fund.
          //
          // Keyed on the artwork because this grid is still on dummy items, and
          // their "Grants" category covers the parts grants as well as the
          // machines. Once it reads the real catalogue this becomes the
          // ShopItemCategory.PRINTER the ledger already enforces.
          const purse = item.art === "printer" ? printerFund : coins;
          const afford = purse >= item.price;
          return (
            <Panel
              key={item.id}
              as="li"
              tone="line"
              radius={20}
              className="group flex flex-col overflow-hidden bg-paper"
            >
              <div className="relative grid aspect-[4/3] place-items-center bg-cream/70 p-3">
                <ShopArt art={item.art} className="h-full w-auto max-w-full drop-shadow-sm" />
                {item.stock === "low" && (
                  <span className="label absolute top-2.5 left-2.5 rounded-full bg-coral px-2.5 py-1 text-white">
                    Low stock
                  </span>
                )}
                {out && (
                  <span className="label absolute top-2.5 left-2.5 rounded-full bg-navy-soft px-2.5 py-1 text-white">
                    Sold out
                  </span>
                )}
                <button
                  type="button"
                  disabled={out || (!afford && !has)}
                  onClick={() => setOwned((o) => (has ? o.filter((x) => x !== item.id) : [...o, item.id]))}
                  className={cx(
                    "label absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 transition-all duration-150",
                    "opacity-100 sm:translate-y-1.5 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
                    has
                      ? "border-teal-deep bg-teal text-white"
                      : out || !afford
                        ? "cursor-not-allowed border-line bg-cream text-navy-soft"
                        : "border-teal-deep bg-teal-mid text-navy hover:bg-teal hover:text-white",
                  )}
                >
                  {has ? (
                    <>
                      <IconCheck className="text-sm" strokeWidth={3} /> In cart
                    </>
                  ) : out ? (
                    "Sold out"
                  ) : afford ? (
                    "Buy"
                  ) : (
                    "Not enough"
                  )}
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5">
                <h2 className="text-[0.98rem] leading-tight font-extrabold text-navy">{item.name}</h2>
                <p className="flex-1 text-[0.82rem] leading-snug text-navy-soft">{item.blurb}</p>
                <p className="mt-1 flex items-center gap-1.5">
                  <IconCoin className="text-[1.15rem] text-orange" />
                  <span
                    className={cx(
                      "text-[1.05rem] leading-none font-extrabold tabular-nums",
                      afford ? "text-navy" : "text-navy-soft",
                    )}
                  >
                    {item.price}
                  </span>
                </p>
              </div>
            </Panel>
          );
        })}
      </ul>

      <p className="hand mt-8 text-center text-[0.86rem] text-navy-soft">
        you have <span className="font-bold text-orange-deep tabular-nums">{coins}</span> coins. every
        hour you log past your tier banks five more.
      </p>
    </>
  );
}
