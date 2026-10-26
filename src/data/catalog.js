/*
 * catalog.js — product and service catalogs for the in-phone stores.
 *
 * Price status:
 *   VERIFIED     national consumer average from Panel Harga Bapanas (via press).
 *                Local prices differ, sometimes a lot (eastern Indonesia).
 *   ESTIMATED    derived from a documented method (see the item note).
 *   ILLUSTRATIVE plausible gameplay price, not an observed price.
 * No brand names are used: brand-level prices were not observed.
 *
 * effects (gameplay abstractions, all ILLUSTRATIVE):
 *   staple / side  portions added to the pantry; one home-cooked meal uses one of each
 *   complete       ready meals (or instant noodles) that count as a full meal
 *   water          days of drinking water
 *   soap / shampoo / toothpaste   days of bathroom supply
 *   laundry / dish days of cleaning supply
 *   gasMeals       meals that can be cooked on one LPG refill
 *   baby           days of baby supplies
 *   wellbeing      mood points from leisure
 */
(function (root) {
  const RLS = (root.RLS = root.RLS || {});
  RLS.data = RLS.data || {};
  const { rp } = RLS.money;

  const items = [];
  function add(store, cat, id, name, tier, size, unitQty, unitLabel, priceMajor, status, sourceId, effects = {}, opts = {}) {
    items.push({
      id, store, cat, name, tier, size, unitQty, unitLabel,
      price: rp(priceMajor), status, sourceId,
      observed: opts.observed || (status === 'VERIFIED' ? (RLS.data.sourceById[sourceId] || {}).published : null),
      effects, essential: opts.essential !== undefined ? opts.essential : true,
      origin: opts.origin || 'local', note: opts.note || null,
      requires: opts.requires || null,
    });
  }
  const V = 'VERIFIED', E = 'ESTIMATED', I = 'ILLUSTRATIVE', G = 'game_assumption';
  const FEB28 = 'pangan_20260228', FEB24 = 'pangan_20260224', JAN20 = 'pangan_20260120';
  const ricePer5 = 'Price = national average per kg × 5. Portions assume about 100 g uncooked rice per meal.';

  // ── DailyMart ────────────────────────────────────────────────────────
  const M = 'dailymart';
  // A. Staples
  add(M, 'staples', 'rice_sphp_5', 'Beras SPHP (Bulog), 5 kg', 'budget', '5 kg', 5000, 'g', 12365 * 5, V, FEB24, { staple: 50 }, { note: ricePer5 });
  add(M, 'staples', 'rice_medium_1', 'Beras medium, 1 kg', 'budget', '1 kg', 1000, 'g', 13473, V, FEB28, { staple: 10 }, { note: 'Smaller bag for tight weeks: same unit price as the 5 kg medium.' });
  add(M, 'staples', 'rice_medium_5', 'Beras medium, 5 kg', 'standard', '5 kg', 5000, 'g', 13473 * 5, V, FEB28, { staple: 50 }, { note: ricePer5 });
  add(M, 'staples', 'rice_premium_5', 'Beras premium, 5 kg', 'premium', '5 kg', 5000, 'g', 15368 * 5, V, FEB28, { staple: 50 }, { note: ricePer5 });
  add(M, 'staples', 'noodle_fried', 'Instant fried noodles, 1 pack', 'budget', '85 g', 85, 'g', 3500, I, G, { complete: 1 });
  add(M, 'staples', 'noodle_5pack', 'Instant noodles, 5-pack', 'budget', '5 × 85 g', 425, 'g', 16500, I, G, { complete: 5 });
  add(M, 'staples', 'bread_white', 'White sandwich bread', 'standard', '400 g', 400, 'g', 16000, I, G, { staple: 6 });
  add(M, 'staples', 'potato_1', 'Potatoes', 'standard', '1 kg', 1000, 'g', 18000, I, G, { staple: 6 });
  add(M, 'staples', 'bread_whole', 'Wholemeal sourdough loaf', 'premium', '500 g', 500, 'g', 45000, I, G, { staple: 6 }, { essential: false });
  add(M, 'staples', 'ramyeon', 'Imported Korean ramyeon', 'premium', '120 g', 120, 'g', 22000, I, G, { complete: 1 }, { origin: 'imported', essential: false });

  // B. Protein
  add(M, 'protein', 'tempe', 'Tempe, 1 board', 'budget', '400 g', 400, 'g', 7000, I, G, { side: 4 });
  add(M, 'protein', 'tahu', 'Tahu putih, 10 pcs', 'budget', '10 pcs', 10, 'pcs', 8000, I, G, { side: 4 });
  add(M, 'protein', 'eggs_10', 'Chicken eggs, 10 pcs', 'budget', '10 pcs', 10, 'pcs', 20000, E, FEB28, { side: 5 }, { note: 'Estimated from the national average of Rp31.038/kg at about 16 eggs per kg, plus a small-pack markup.' });
  add(M, 'protein', 'sardine', 'Canned sardines in tomato sauce', 'budget', '155 g', 155, 'g', 11000, I, G, { side: 3 });
  add(M, 'protein', 'eggs_1kg', 'Chicken eggs, 1 kg (about 16)', 'standard', '1 kg', 1000, 'g', 31038, V, FEB28, { side: 8 });
  add(M, 'protein', 'chicken_1kg', 'Chicken (ayam ras), whole cut', 'standard', '1 kg', 1000, 'g', 37459, V, FEB28, { side: 8 });
  add(M, 'protein', 'mackerel', 'Ikan kembung', 'standard', '500 g', 500, 'g', 25000, I, G, { side: 4 });
  add(M, 'protein', 'beef_500', 'Beef (daging sapi murni)', 'premium', '500 g', 500, 'g', Math.round(135331 / 2), V, FEB28, { side: 5 }, { note: 'Half of the national average per kg.' });
  add(M, 'protein', 'salmon', 'Imported salmon fillet', 'premium', '200 g', 200, 'g', 85000, I, G, { side: 2 }, { origin: 'imported', essential: false });

  // C. Cooking ingredients
  add(M, 'cooking', 'oil_bulk', 'Cooking oil, bulk (curah)', 'budget', '1 L', 1000, 'ml', 17266, V, JAN20, {});
  add(M, 'cooking', 'salt', 'Iodised salt', 'budget', '250 g', 250, 'g', 3000, I, G, {});
  add(M, 'cooking', 'spice_pack', 'Instant spice paste sachet', 'budget', '1 pack', 1, 'pcs', 4000, I, G, {});
  add(M, 'cooking', 'oil_pack', 'Cooking oil, packaged', 'standard', '1 L', 1000, 'ml', 20531, V, JAN20, {});
  add(M, 'cooking', 'sugar', 'Granulated sugar', 'standard', '1 kg', 1000, 'g', 18000, I, G, {});
  add(M, 'cooking', 'kecap', 'Sweet soy sauce (kecap manis)', 'standard', '520 ml', 520, 'ml', 24000, I, G, {});
  add(M, 'cooking', 'shallot', 'Shallots (bawang merah)', 'standard', '250 g', 250, 'g', 10000, I, G, {});
  add(M, 'cooking', 'garlic', 'Garlic (bawang putih)', 'standard', '250 g', 250, 'g', 9000, I, G, {});
  add(M, 'cooking', 'sambal', 'Bottled chilli sauce', 'standard', '335 ml', 335, 'ml', 18000, I, G, {}, { essential: false });
  add(M, 'cooking', 'olive_oil', 'Imported olive oil', 'premium', '500 ml', 500, 'ml', 95000, I, G, {}, { origin: 'imported', essential: false });
  add(M, 'cooking', 'pasta_sauce', 'Imported pasta sauce', 'premium', '400 g', 400, 'g', 55000, I, G, { side: 3 }, { origin: 'imported', essential: false });

  // D. Vegetables & fruit
  add(M, 'produce', 'kangkung', 'Water spinach (kangkung), 1 bunch', 'budget', '1 bunch', 1, 'pcs', 4000, I, G, { side: 2 });
  add(M, 'produce', 'bayam', 'Spinach (bayam), 1 bunch', 'budget', '1 bunch', 1, 'pcs', 4000, I, G, { side: 2 });
  add(M, 'produce', 'carrot', 'Carrots', 'standard', '500 g', 500, 'g', 9000, I, G, { side: 3 });
  add(M, 'produce', 'tomato', 'Tomatoes', 'standard', '500 g', 500, 'g', 10000, I, G, { side: 2 });
  add(M, 'produce', 'banana', 'Bananas, 1 hand', 'standard', '1 hand', 1, 'pcs', 20000, I, G, {}, { essential: false });
  add(M, 'produce', 'frozen_veg', 'Frozen mixed vegetables', 'premium', '500 g', 500, 'g', 35000, I, G, { side: 4 });
  add(M, 'produce', 'apple_import', 'Imported apples', 'premium', '1 kg', 1000, 'g', 45000, I, G, {}, { origin: 'imported', essential: false });

  // E. Drinks
  add(M, 'drinks', 'galon_refill', 'Drinking water, depot refill', 'budget', '19 L', 19000, 'ml', 6000, I, G, { water: 8 }, { note: 'Unbranded refill at a water depot.' });
  add(M, 'drinks', 'galon_brand', 'Drinking water, branded gallon refill', 'standard', '19 L', 19000, 'ml', 22000, I, G, { water: 8 });
  add(M, 'drinks', 'coffee_sachet', 'Instant coffee sachets, 10 pcs', 'budget', '10 pcs', 10, 'pcs', 15000, I, G, {}, { essential: false });
  add(M, 'drinks', 'tea_bags', 'Tea bags, 25 pcs', 'standard', '25 pcs', 25, 'pcs', 7000, I, G, {}, { essential: false });
  add(M, 'drinks', 'milk_uht', 'UHT milk', 'standard', '1 L', 1000, 'ml', 20000, I, G, {}, { essential: false });
  add(M, 'drinks', 'water_import', 'Imported mineral water', 'premium', '1 L', 1000, 'ml', 35000, I, G, { water: 0 }, { origin: 'imported', essential: false });
  add(M, 'drinks', 'coffee_beans', 'Specialty ground coffee', 'premium', '250 g', 250, 'g', 75000, I, G, {}, { essential: false });

  // F. Personal hygiene
  add(M, 'hygiene', 'soap_bar3', 'Bar soap, 3-pack', 'budget', '3 × 85 g', 255, 'g', 9000, I, G, { soap: 45 });
  add(M, 'hygiene', 'shampoo_sachet', 'Shampoo sachets, 12 pcs', 'budget', '12 × 10 ml', 120, 'ml', 6000, I, G, { shampoo: 12 });
  add(M, 'hygiene', 'toothpaste_s', 'Toothpaste', 'budget', '75 g', 75, 'g', 6500, I, G, { toothpaste: 25 });
  add(M, 'hygiene', 'toothbrush', 'Toothbrush', 'budget', '1 pc', 1, 'pcs', 5000, I, G, {});
  add(M, 'hygiene', 'pads', 'Sanitary pads, 10 pcs', 'budget', '10 pcs', 10, 'pcs', 12000, I, G, {});
  add(M, 'hygiene', 'bodywash', 'Body wash refill', 'standard', '450 ml', 450, 'ml', 25000, I, G, { soap: 40 });
  add(M, 'hygiene', 'shampoo_bottle', 'Shampoo bottle', 'standard', '170 ml', 170, 'ml', 25000, I, G, { shampoo: 30 });
  add(M, 'hygiene', 'toothpaste_l', 'Toothpaste, large', 'standard', '190 g', 190, 'g', 15000, I, G, { toothpaste: 60 });
  add(M, 'hygiene', 'deodorant', 'Roll-on deodorant', 'standard', '50 ml', 50, 'ml', 22000, I, G, {});
  add(M, 'hygiene', 'tissue', 'Facial tissue', 'standard', '250 sheets', 250, 'pcs', 12000, I, G, {});
  add(M, 'hygiene', 'toilet_paper', 'Toilet paper, 4 rolls', 'standard', '4 rolls', 4, 'pcs', 18000, I, G, {});
  add(M, 'hygiene', 'shampoo_salon', 'Salon shampoo', 'premium', '300 ml', 300, 'ml', 120000, I, G, { shampoo: 50 }, { origin: 'imported', essential: false });
  add(M, 'hygiene', 'bodywash_lux', 'Imported body wash', 'premium', '500 ml', 500, 'ml', 95000, I, G, { soap: 45 }, { origin: 'imported', essential: false });

  // G. Household
  add(M, 'household', 'detergent_s', 'Laundry detergent sachets, 6 pcs', 'budget', '6 pcs', 6, 'pcs', 6000, I, G, { laundry: 12 });
  add(M, 'household', 'dish_refill', 'Dishwashing liquid refill', 'budget', '400 ml', 400, 'ml', 9000, I, G, { dish: 30 });
  add(M, 'household', 'mosquito_coil', 'Mosquito coils, 10 pcs', 'budget', '10 pcs', 10, 'pcs', 6000, I, G, {});
  add(M, 'household', 'trash_bags', 'Trash bags, 20 pcs', 'budget', '20 pcs', 20, 'pcs', 8000, I, G, {});
  add(M, 'household', 'lpg_3', 'LPG 3 kg refill (subsidised tube)', 'budget', '3 kg', 3000, 'g', 22000, I, G, { gasMeals: 60 }, { note: 'Retail price at a neighbourhood shop; the regulated base price at official outlets is lower and varies by region.' });
  add(M, 'household', 'detergent_l', 'Laundry detergent, 800 g', 'standard', '800 g', 800, 'g', 24000, I, G, { laundry: 35 });
  add(M, 'household', 'floor_cleaner', 'Floor cleaner', 'standard', '780 ml', 780, 'ml', 15000, I, G, {});
  add(M, 'household', 'sponge', 'Kitchen sponges, 3 pcs', 'standard', '3 pcs', 3, 'pcs', 9000, I, G, {});
  add(M, 'household', 'lpg_55', 'LPG 5,5 kg non-subsidised refill', 'premium', '5,5 kg', 5500, 'g', 95000, I, G, { gasMeals: 110 });
  add(M, 'household', 'detergent_eco', 'Imported eco detergent', 'premium', '1 L', 1000, 'ml', 85000, I, G, { laundry: 40 }, { origin: 'imported', essential: false });

  // H. Ready-to-eat
  add(M, 'ready', 'warteg', 'Nasi warteg (rice + two sides)', 'budget', '1 plate', 1, 'pcs', 15000, I, G, { complete: 1 });
  add(M, 'ready', 'gorengan', 'Street fritters (gorengan), 3 pcs', 'budget', '3 pcs', 3, 'pcs', 5000, I, G, {}, { essential: false });
  add(M, 'ready', 'nasi_padang', 'Nasi Padang, takeaway', 'standard', '1 pack', 1, 'pcs', 25000, I, G, { complete: 1 });
  add(M, 'ready', 'bento', 'Convenience-store rice bowl', 'standard', '1 bowl', 1, 'pcs', 22000, I, G, { complete: 1 });
  add(M, 'ready', 'restaurant_set', 'Restaurant set meal', 'premium', '1 set', 1, 'pcs', 55000, I, G, { complete: 1, wellbeing: 2 }, { essential: false });

  // I. Baby & dependent care (only shown with a dependent)
  add(M, 'baby', 'diapers', 'Diapers, 20 pcs', 'budget', '20 pcs', 20, 'pcs', 55000, I, G, { baby: 5 }, { requires: 'dependent' });
  add(M, 'baby', 'formula', 'Toddler formula milk', 'standard', '400 g', 400, 'g', 85000, I, G, { baby: 7 }, { requires: 'dependent' });
  add(M, 'baby', 'diapers_prem', 'Premium diapers, 20 pcs', 'premium', '20 pcs', 20, 'pcs', 95000, I, G, { baby: 5 }, { requires: 'dependent', origin: 'imported' });

  // ── ShopSquare (fashion & replacement) ──────────────────────────────
  const F = 'shopsquare';
  const three = (store, cat, base, name, prices, opts = {}, effects = {}) => {
    ['budget', 'standard', 'premium'].forEach((tier, i) => add(store, cat, `${base}_${tier}`, name, tier, opts.size || '1 pc', 1, 'pcs', prices[i], I, G, effects, opts));
  };
  three(F, 'basics', 'tee', 'Plain T-shirt', [45000, 120000, 350000], { essential: false });
  three(F, 'workwear', 'work_shirt', 'Work shirt', [90000, 220000, 550000], { essential: false });
  three(F, 'shoes', 'shoes', 'Everyday shoes', [120000, 350000, 1200000], { essential: false });
  three(F, 'bags', 'bag', 'Work bag', [80000, 250000, 900000], { essential: false });
  three(F, 'underwear', 'underwear', 'Underwear, 3-pack', [45000, 110000, 300000], { size: '3 pcs' });
  three(F, 'rain', 'raincoat', 'Raincoat', [35000, 85000, 250000], {}, { raincoat: 1 });
  three(F, 'replacement', 'charger', 'Phone charger and cable', [35000, 90000, 350000]);
  three(F, 'replacement', 'umbrella', 'Folding umbrella', [30000, 70000, 200000]);
  three(F, 'household', 'fan', 'Standing fan', [175000, 320000, 900000]);

  // ── Glow (beauty & personal care) ───────────────────────────────────
  const B = 'glow';
  three(B, 'lips', 'liptint', 'Lip tint', [25000, 65000, 400000], { essential: false }, { wellbeing: 1 });
  three(B, 'sunscreen', 'sunscreen', 'Sunscreen SPF 50', [30000, 65000, 250000], { size: '50 ml' });
  three(B, 'moisturizer', 'moisturizer', 'Moisturiser', [25000, 90000, 450000], { size: '50 ml', essential: false });
  three(B, 'cleanser', 'cleanser', 'Facial cleanser', [18000, 55000, 220000], { size: '100 ml' });
  three(B, 'makeup', 'cushion', 'Cushion foundation', [45000, 150000, 750000], { essential: false }, { wellbeing: 1 });
  three(B, 'hair', 'hairoil', 'Hair serum', [20000, 55000, 300000], { essential: false });
  three(B, 'body', 'lotion', 'Body lotion', [18000, 45000, 250000], { essential: false });
  three(B, 'fragrance', 'perfume', 'Fragrance', [35000, 150000, 1800000], { essential: false }, { wellbeing: 2 });
  three(B, 'grooming', 'razor', 'Razor and grooming kit', [15000, 40000, 200000]);

  // ── Care (pharmacy) ─────────────────────────────────────────────────
  const C = 'care';
  add(C, 'pharmacy', 'paracetamol_gen', 'Paracetamol 500 mg, generic strip', 'budget', '10 tablets', 10, 'pcs', 5000, I, G, { health: 1 });
  add(C, 'pharmacy', 'oralit', 'Oral rehydration salts', 'budget', '1 sachet', 1, 'pcs', 3000, I, G, { health: 1 });
  add(C, 'pharmacy', 'masks', 'Medical masks, 50 pcs', 'budget', '50 pcs', 50, 'pcs', 25000, I, G, {});
  add(C, 'pharmacy', 'paracetamol_brand', 'Branded fever and pain relief', 'standard', '10 tablets', 10, 'pcs', 15000, I, G, { health: 1 });
  add(C, 'pharmacy', 'cough_syrup', 'Cough syrup', 'standard', '100 ml', 100, 'ml', 25000, I, G, { health: 1 });
  add(C, 'pharmacy', 'vitamin_c', 'Vitamin C, 30 tablets', 'standard', '30 tablets', 30, 'pcs', 30000, I, G, {}, { essential: false });
  add(C, 'clinic', 'clinic_gp', 'GP visit at a private clinic', 'standard', '1 visit', 1, 'pcs', 150000, I, G, { health: 3 }, { note: 'Out of pocket. Visits to your registered JKN clinic are covered.' });
  add(C, 'clinic', 'dental_check', 'Dental check-up, private', 'premium', '1 visit', 1, 'pcs', 250000, I, G, { health: 2 });
  add(C, 'pharmacy', 'multivit', 'Imported multivitamin, 60 tablets', 'premium', '60 tablets', 60, 'pcs', 180000, I, G, {}, { essential: false, origin: 'imported' });

  // ── AfterHours (leisure) ────────────────────────────────────────────
  const L = 'afterhours';
  const leisure = (cat, id, name, tier, price, wb) => add(L, cat, id, name, tier, '1×', 1, 'pcs', price, I, G, { wellbeing: wb }, { essential: false });
  leisure('cinema', 'cinema_wd', 'Cinema ticket, weekday', 'budget', 40000, 5);
  leisure('cinema', 'cinema_we', 'Cinema ticket, weekend', 'standard', 55000, 5);
  leisure('cinema', 'cinema_prem', 'Premium cinema seat', 'premium', 100000, 6);
  leisure('cafe', 'kopi_susu', 'Iced coffee with palm sugar', 'budget', 22000, 2);
  leisure('cafe', 'cafe_hang', 'Café afternoon with a friend', 'standard', 60000, 4);
  leisure('cafe', 'cafe_brunch', 'Brunch at a specialty café', 'premium', 150000, 5);
  leisure('social', 'hangout', 'Dinner with friends', 'standard', 100000, 6);
  leisure('social', 'karaoke', 'Karaoke room share', 'standard', 60000, 5);
  leisure('social', 'gift_small', 'Small gift for a friend', 'budget', 50000, 3);
  leisure('hobby', 'book_used', 'Second-hand book', 'budget', 40000, 3);
  leisure('hobby', 'book_new', 'New paperback', 'standard', 110000, 4);
  leisure('hobby', 'game_indie', 'Indie game download', 'standard', 75000, 4);
  leisure('events', 'concert', 'Concert ticket', 'premium', 750000, 12);
  leisure('events', 'free_event', 'Free car-free-day morning', 'budget', 0, 3);

  // ── QuickBite (food delivery) ───────────────────────────────────────
  const menu = [
    ['geprek', 'Ayam geprek with rice', 'budget', 18000],
    ['mie_ayam', 'Mie ayam', 'budget', 17000],
    ['nasgor', 'Nasi goreng', 'budget', 22000],
    ['bakso', 'Bakso', 'standard', 22000],
    ['padang_box', 'Nasi Padang rendang box', 'standard', 32000],
    ['sate', 'Sate ayam, 10 skewers', 'standard', 30000],
    ['burger', 'Burger chain combo', 'premium', 58000],
    ['sushi', 'Sushi set', 'premium', 89000],
    ['kopi', 'Iced coffee (drink only)', 'budget', 22000, true],
    ['boba', 'Brown-sugar boba (drink only)', 'standard', 28000, true],
  ];
  menu.forEach(([id, name, tier, price, drink]) => add('quickbite', drink ? 'drinks' : 'meals', 'qb_' + id, name, tier, '1', 1, 'pcs', price, I, G, drink ? { wellbeing: 1 } : { complete: 1 }, { essential: !drink && tier !== 'premium' }));

  RLS.data.catalog = {
    items,
    byId: Object.fromEntries(items.map((i) => [i.id, i])),
    categories: {
      dailymart: [
        ['staples', 'Rice & staples'], ['protein', 'Protein'], ['cooking', 'Cooking'], ['produce', 'Vegetables & fruit'],
        ['drinks', 'Drinks'], ['hygiene', 'Personal hygiene'], ['household', 'Household'], ['ready', 'Ready to eat'], ['baby', 'Baby & dependant'],
      ],
      shopsquare: [['basics', 'Basics'], ['workwear', 'Workwear'], ['shoes', 'Shoes'], ['bags', 'Bags'], ['underwear', 'Underwear'], ['rain', 'Rainwear'], ['replacement', 'Replacements'], ['household', 'Home']],
      glow: [['cleanser', 'Cleanser'], ['sunscreen', 'Sunscreen'], ['moisturizer', 'Moisturiser'], ['lips', 'Lips'], ['makeup', 'Makeup'], ['hair', 'Hair'], ['body', 'Body'], ['fragrance', 'Fragrance'], ['grooming', 'Grooming']],
      care: [['pharmacy', 'Pharmacy'], ['clinic', 'Clinic visits']],
      afterhours: [['cinema', 'Cinema'], ['cafe', 'Cafés'], ['social', 'Social'], ['hobby', 'Hobbies'], ['events', 'Events']],
      quickbite: [['meals', 'Meals'], ['drinks', 'Drinks']],
    },
  };

  // ── Connect: phone & internet ───────────────────────────────────────
  RLS.data.connect = {
    dataPlans: [
      { id: 'data_7d', name: 'Prepaid data 8 GB', days: 7, price: rp(30000), status: I, sourceId: G },
      { id: 'data_30d_20', name: 'Prepaid data 20 GB', days: 30, price: rp(60000), status: I, sourceId: G },
      { id: 'data_30d_50', name: 'Prepaid data 50 GB', days: 30, price: rp(100000), status: I, sourceId: G },
      { id: 'data_30d_unl', name: 'Large quota 120 GB', days: 30, price: rp(150000), status: I, sourceId: G },
    ],
    homeInternet: [
      { id: 'net_20', name: 'Home fibre 20 Mbps', price: rp(250000), status: I, sourceId: G },
      { id: 'net_50', name: 'Home fibre 50 Mbps', price: rp(350000), status: I, sourceId: G },
    ],
    devices: [
      { id: 'phone_budget', name: 'Entry-level Android phone', price: rp(1500000), status: I, sourceId: G },
      { id: 'phone_mid', name: 'Mid-range Android phone', price: rp(3500000), status: I, sourceId: G },
      { id: 'screen_fix', name: 'Screen replacement at a phone counter', price: rp(400000), status: I, sourceId: G },
    ],
  };

  // ── Recurring subscriptions ────────────────────────────────────────
  RLS.data.subscriptions = [
    { id: 'sub_video', name: 'Video streaming, mobile plan', price: rp(54000), wellbeing: 2, status: I, sourceId: G },
    { id: 'sub_music', name: 'Music streaming, individual', price: rp(55000), wellbeing: 2, status: I, sourceId: G },
    { id: 'sub_cloud', name: 'Cloud storage 100 GB', price: rp(27000), wellbeing: 0, status: I, sourceId: G },
    { id: 'sub_gym', name: 'Neighbourhood gym membership', price: rp(200000), wellbeing: 3, status: I, sourceId: G },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = RLS.data.catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this);
