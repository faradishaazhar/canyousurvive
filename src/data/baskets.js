/*
 * baskets.js — suggested grocery baskets.
 * The game never forces these; DailyMart can load one into the cart, where
 * every quantity can be changed. Comparison mode uses them as the shared
 * grocery assumption so two places are compared on the same basket.
 * Sized for one adult eating about 3 home meals a day for 30 days.
 */
(function (root) {
  const RLS = (root.RLS = root.RLS || {});
  RLS.data = RLS.data || {};
  RLS.data.baskets = {
    budget: {
      label: 'Lean month',
      lines: [
        ['rice_sphp_5', 2], ['eggs_10', 4], ['tempe', 6], ['tahu', 4], ['kangkung', 4], ['bayam', 4],
        ['noodle_5pack', 2], ['oil_bulk', 1], ['salt', 1], ['spice_pack', 4],
        ['galon_refill', 4], ['lpg_3', 2],
        ['soap_bar3', 1], ['shampoo_sachet', 3], ['toothpaste_s', 1], ['detergent_s', 3], ['dish_refill', 1],
      ],
    },
    standard: {
      label: 'Everyday month',
      lines: [
        ['rice_medium_5', 2], ['eggs_1kg', 3], ['chicken_1kg', 2], ['tempe', 4], ['tahu', 2], ['mackerel', 2],
        ['kangkung', 4], ['carrot', 2], ['tomato', 2], ['oil_pack', 1], ['sugar', 1], ['kecap', 1], ['shallot', 1], ['garlic', 1],
        ['galon_brand', 4], ['lpg_3', 2], ['tea_bags', 1],
        ['bodywash', 1], ['shampoo_bottle', 1], ['toothpaste_l', 1], ['deodorant', 1], ['toilet_paper', 1],
        ['detergent_l', 1], ['dish_refill', 1],
      ],
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RLS.data.baskets;
})(typeof globalThis !== 'undefined' ? globalThis : this);
