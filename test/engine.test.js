// Engine tests. Run: npm test  (node --test)
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

for (const f of ['money.js', 'data/sources.js', 'data/indonesia.js', 'data/countries.js', 'data/catalog.js', 'data/baskets.js', 'engine.js']) {
  require(path.join(__dirname, '..', 'src', f));
}
const { engine: E, money: M, data: D } = globalThis.RLS;
const rp = M.rp;
const newGame = (over = {}, seed = 12345) => E.createGame({ cityId: 'tangsel', difficulty: 'calm', ...over }, seed);
// Strip randomness from day-by-day tests: resolve any event with its free option.
function advance(state, days) {
  for (let i = 0; i < days && state.phase === 'play'; i++) {
    if (state.activeEvent) {
      const free = state.activeEvent.choices.findIndex((c) => c.cost <= 0);
      E.resolveEvent(state, free >= 0 ? free : 0);
    }
    E.advanceSimulationDay(state);
  }
}

test('money: decimal decrees convert exactly to minor units', () => {
  assert.equal(M.toMinor('3100881.40'), 310088140);
  assert.equal(M.toMinor('5247870'), 524787000);
  assert.equal(M.toMinor('2327386.07'), 232738607);
  assert.equal(M.format(M.toMinor('3100881.40'), { exact: true }), 'Rp3.100.881,40');
  assert.equal(M.applyBasisPoints(rp(5247870), 100), rp(52478.70));
});

test('wages: all 38 provinces have a 2026 UMP with a source', () => {
  assert.equal(D.indonesia.provinces.length, 38);
  for (const p of D.indonesia.provinces) {
    assert.ok(Number(p.wage.amountMajor) > 2000000, p.name);
    assert.ok(D.sourceById[p.wage.sourceId], p.name + ' source');
    assert.equal(p.wage.wageType, 'UMP');
  }
});

test('wages: a city with a loaded UMK uses it; others fall back to UMP with a notice', () => {
  const ts = E.resolveWage('tangsel');
  assert.equal(ts.wageType, 'UMK');
  assert.equal(ts.amount, rp(5247870));
  assert.equal(ts.fallback, false);
  const pk = E.resolveWage('pekanbaru');
  assert.equal(pk.wageType, 'UMP');
  assert.equal(pk.amount, M.toMinor(D.indonesia.provinceById.riau.wage.amountMajor));
  assert.equal(pk.fallback, true);
  assert.match(pk.notes[0], /No 2026 UMK/);
  const jk = E.resolveWage('jkt_selatan');
  assert.equal(jk.wageType, 'UMP');
  assert.equal(jk.fallback, false, 'Jakarta has no UMK, so UMP is not a fallback');
});

test('wages: every verified wage traces to a registered source', () => {
  for (const c of D.indonesia.cities) if (c.wage) {
    assert.equal(c.wage.verificationStatus, 'VERIFIED');
    assert.ok(D.sourceById[c.wage.sourceId], c.name);
  }
});

test('net income: formal deductions use BPJS rates and the TER band', () => {
  const pay = E.calculateNetIncome(rp(5729876), 'formal'); // Jakarta
  const by = Object.fromEntries(pay.items.map((i) => [i.key, i.amount]));
  assert.equal(by.jkn, M.applyBasisPoints(rp(5729876), 100));
  assert.equal(by.jht, M.applyBasisPoints(rp(5729876), 200));
  assert.equal(by.jp, M.applyBasisPoints(rp(5729876), 100));
  assert.equal(by.pph21, M.applyBasisPoints(rp(5729876), 50)); // 5,65–5,95 jt band = 0,5%
  assert.equal(pay.net, pay.gross - pay.totalDeductions);
  const low = E.calculateNetIncome(rp(2317601), 'formal');
  assert.equal(low.items.find((i) => i.key === 'pph21').amount, 0);
  const gross = E.calculateNetIncome(rp(3000000), 'gross');
  assert.equal(gross.net, rp(3000000));
  assert.equal(gross.items.length, 0);
});

test('starting balance follows the gross/net treatment', () => {
  const net = newGame({ wageTreatment: 'net' });
  const gross = newGame({ wageTreatment: 'gross' });
  const w = E.resolveWage('tangsel').amount;
  assert.equal(gross.transactions.find((t) => t.cls === 'income').amount, w);
  assert.equal(net.transactions.find((t) => t.cls === 'income').amount, E.calculateNetIncome(w, 'formal').net);
});

test('purchase reduces the wallet by exactly the quoted total', () => {
  const s = newGame();
  const lines = [{ itemId: 'rice_medium_5', qty: 2 }, { itemId: 'eggs_1kg', qty: 1 }, { itemId: 'apple_import', qty: 1 }];
  const quote = E.calculateGroceryBasket(lines, s.config);
  const before = s.wallet;
  const res = E.processPurchase(s, { store: 'dailymart', lines });
  assert.ok(res.ok);
  assert.equal(before - s.wallet, quote.total);
  assert.equal(res.tx.amount, -quote.total);
  assert.equal(res.tx.split.essential + res.tx.split.discretionary, quote.total);
  assert.equal(s.pantry.staple, 6 + 100);
});

test('a failed purchase deducts nothing and is recorded as failed', () => {
  const s = newGame();
  const before = s.wallet;
  const res = E.processPurchase(s, { store: 'afterhours', lines: [{ itemId: 'concert', qty: 50 }] });
  assert.equal(res.ok, false);
  assert.equal(res.error, 'insufficient_funds');
  assert.equal(s.wallet, before);
  assert.equal(s.transactions[0].status, 'failed');
  assert.equal(s.transactions[0].balanceAfter, before);
});

test('invalid purchases are rejected before any charge', () => {
  const s = newGame();
  const before = s.wallet;
  assert.equal(E.processPurchase(s, { store: 'dailymart', lines: [{ itemId: 'nope', qty: 1 }] }).error, 'unknown_item');
  assert.equal(E.processPurchase(s, { store: 'dailymart', lines: [{ itemId: 'rice_medium_5', qty: 0 }] }).error, 'invalid_quantity');
  assert.equal(E.processPurchase(s, { store: 'dailymart', lines: [{ itemId: 'diapers', qty: 1 }] }).error, 'item_unavailable');
  assert.equal(s.wallet, before);
});

test('a paid bill cannot be charged twice, including by autopay', () => {
  const s = newGame();
  const rent = E.billsThisMonth(s).find((b) => b.key === 'rent');
  E.setAutopay(s, rent.id, true);
  assert.ok(E.processBillPayment(s, rent.id).ok);
  const after = s.wallet;
  assert.equal(E.processBillPayment(s, rent.id).error, 'already_paid');
  assert.equal(s.wallet, after);
  const rentCharges = () => s.transactions.filter((t) => t.merchant === rent.label && t.status === 'completed').length;
  advance(s, 6); // past the due date with autopay on
  assert.equal(rentCharges(), 1);
});

test('autopay pays on the due day; unpaid bills go overdue and carry over', () => {
  const s = newGame({ housingId: 'petak_typical' });
  const water = E.billsThisMonth(s).find((b) => b.key === 'water');
  E.setAutopay(s, water.id, true);
  advance(s, 40);
  assert.equal(water.status, 'paid');
  assert.equal(water.paidDay, 20);
  const rent = s.bills.find((b) => b.key === 'rent' && b.month === 1);
  assert.equal(rent.status, 'overdue');
  assert.equal(s.phase, 'report');
  E.startNextMonth(s);
  const arrears = E.billsThisMonth(s).find((b) => b.key === 'arrears-rent');
  assert.ok(arrears);
  assert.equal(arrears.amount, rent.amount + rp(50000));
  assert.equal(E.billsThisMonth(s).filter((b) => b.key === 'rent').length, 1, 'no duplicate rent bill');
});

test('savings transfers move money but are not consumption', () => {
  const s = newGame();
  const before = s.wallet;
  assert.ok(E.processSavingsTransfer(s, rp(500000), 'in').ok);
  assert.equal(s.wallet, before - rp(500000));
  assert.equal(s.savings, rp(500000));
  assert.ok(E.processSavingsTransfer(s, rp(200000), 'out').ok);
  const r = E.generateMonthlyReport(s);
  assert.equal(r.consumption, 0);
  assert.equal(r.netSavings, rp(300000));
  assert.equal(r.remaining, r.income);
  assert.equal(E.processSavingsTransfer(s, rp(999999999), 'in').error, 'insufficient_funds');
  assert.equal(E.processSavingsTransfer(s, rp(400000), 'out').error, 'insufficient_savings');
});

test('report identity: wallet change = income − consumption − upfront − net savings', () => {
  const s = newGame({ difficulty: 'chaotic' }, 777);
  E.processPurchase(s, { store: 'dailymart', lines: D.baskets.standard.lines.map(([itemId, qty]) => ({ itemId, qty })) });
  E.processSavingsTransfer(s, rp(250000), 'in');
  E.buyDataPlan(s, 'data_30d_20');
  for (const b of E.billsThisMonth(s)) E.processBillPayment(s, b.id);
  for (let i = 0; i < 40 && s.phase === 'play'; i++) {
    if (s.activeEvent) E.resolveEvent(s, 0) .ok || E.resolveEvent(s, s.activeEvent.choices.length - 1);
    E.advanceSimulationDay(s);
  }
  const r = s.lastReport;
  assert.equal(r.walletEnd, r.income - r.consumption - r.upfront - r.netSavings);
  assert.ok(r.essentialRatio > 0 && r.essentialRatio < 1);
});

test('changing region changes wage, rent and transport options', () => {
  const a = newGame({ cityId: 'jkt_pusat' });
  const b = newGame({ cityId: 'banjarnegara' });
  assert.notEqual(a.transactions[0].amount, b.transactions[0].amount);
  assert.notEqual(E.getHousing('jkt_pusat', 'kost_typical').monthlyRent, E.getHousing('banjarnegara', 'kost_typical').monthlyRent);
  const ids = (city) => E.transportModes(city).map((m) => m.id);
  assert.ok(ids('jkt_pusat').includes('mrt'));
  assert.ok(ids('jkt_pusat').includes('tj'));
  assert.ok(!ids('banjarnegara').includes('mrt'));
  assert.ok(!ids('banjarnegara').includes('krl'));
  assert.ok(ids('tangsel').includes('krl'));
  assert.ok(!ids('tangsel').includes('tj'));
  assert.ok(!ids('kota_bandung').includes('krl'));
});

test('switching scenario starts clean, with no stale bills', () => {
  const a = newGame({ cityId: 'jkt_pusat', housingId: 'apartment_premium' });
  const b = E.createGame({ ...a.config, cityId: 'banjarnegara', housingId: 'kost_typical', commutePlanId: null }, 1);
  assert.ok(b.bills.every((x) => x.month === 1));
  assert.ok(!b.bills.some((x) => /apartment/i.test(x.label)));
  assert.equal(b.transactions.length >= 1, true);
  assert.equal(b.transactions.filter((t) => t.cls === 'income').length, 1);
});

test('KRL fares follow the published formula', () => {
  const krl = (d) => E.commutePlans('tangsel', d).find((p) => p.id === 'angkot_krl').legs[1].cost;
  assert.equal(krl(10), rp(3000));
  assert.equal(krl(25), rp(3000));
  assert.equal(krl(26), rp(4000));
  assert.equal(krl(36), rp(5000));
});

test('missing fares stay unavailable instead of being invented', () => {
  const plans = E.commutePlans('kota_bandung', 10);
  const bus = plans.find((p) => p.id === 'bus');
  assert.equal(bus.available, false);
  assert.equal(bus.perTrip, null);
  assert.equal(bus.legs[0].status, 'UNAVAILABLE');
  const withFare = E.commutePlans('kota_bandung', 10, { customBusFare: rp(4000) }).find((p) => p.id === 'bus');
  assert.equal(withFare.available, true);
  assert.equal(withFare.legs[0].status, 'ILLUSTRATIVE');
});

test('price adjustment relabels verified prices as estimated', () => {
  const item = D.catalog.byId.eggs_1kg;
  assert.equal(E.priceStatus(item, { priceAdjustBp: 0 }), 'VERIFIED');
  assert.equal(E.priceStatus(item, { priceAdjustBp: 2000 }), 'ESTIMATED');
  assert.ok(E.priceOf(item, { priceAdjustBp: 2000 }) > item.price);
});

test('no catalog item claims VERIFIED without a published source date', () => {
  for (const i of D.catalog.items) if (i.status === 'VERIFIED') {
    assert.ok(D.sourceById[i.sourceId], i.id);
    assert.ok(i.observed, i.id + ' observed date');
  }
});

test('prepaid token math: admin fee and PPJ come off before kWh', () => {
  const b = E.tokenBreakdown(rp(100000), '1300', 300);
  assert.equal(b.admin + b.ppj + b.energyValue, rp(100000));
  assert.ok(Math.abs(b.kwh - b.energyValue / M.toMinor('1444.70')) < 1e-9);
  const s = newGame();
  const before = s.electricity.kwhBalance;
  assert.ok(E.buyToken(s, rp(50000)).ok);
  assert.ok(s.electricity.kwhBalance > before);
  const incl = newGame({ housingId: 'kost_premium' });
  assert.equal(E.buyToken(incl, rp(50000)).error, 'included_in_rent');
});

test('seeded events replay identically', () => {
  const log = (seed) => { const s = newGame({ difficulty: 'chaotic' }, seed); const out = []; for (let i = 0; i < 30 && s.phase === 'play'; i++) { if (s.activeEvent) { out.push(s.date.day + s.activeEvent.id); E.resolveEvent(s, s.activeEvent.choices.length - 1); } E.advanceSimulationDay(s); } return out.join(','); };
  assert.equal(log(99), log(99));
  assert.notEqual(log(99), log(100));
});

test('the game runs from payday to the end-of-month report and into month 2', () => {
  const s = newGame();
  advance(s, 31);
  assert.equal(s.phase, 'report');
  assert.ok(s.lastReport.ladder[0].reached);
  const incomeBefore = s.transactions.filter((t) => t.cls === 'income').length;
  assert.ok(E.startNextMonth(s).ok);
  assert.equal(s.monthIndex, 2);
  assert.equal(s.date.day, 1);
  assert.equal(s.date.month, 11);
  assert.equal(s.transactions.filter((t) => t.cls === 'income').length, incomeBefore + 1);
  assert.equal(E.startNextMonth(s).error, 'month_not_finished');
});

test('overtime follows the 1/173 rule', () => {
  const w = rp(5190000);
  assert.equal(E.overtimePay(w, 1), Math.round((w / 173) * 1.5));
  assert.equal(E.overtimePay(w, 3), Math.round((w / 173) * 5.5));
});

test('serialisation round-trips the state', () => {
  const s = newGame();
  advance(s, 3);
  const back = E.deserialize(E.serialize(s));
  assert.deepEqual(back, JSON.parse(JSON.stringify(s)));
});
