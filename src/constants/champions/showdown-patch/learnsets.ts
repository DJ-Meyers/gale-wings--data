// GENERATED — do not edit by hand. See index.ts for how to regenerate.
// Delta of smogon/pokemon-showdown@a5df8274 (data/mods/champions/learnsets.ts)
// over @pkmn/mods@0.10.11 + @pkmn/dex@0.10.11. Provenance in meta.json.
// Per-species move-id deltas over the installed learnset (mod override if
// present, else Gen 9 vanilla) after move-legality filtering. All Champions
// learnset sources upstream are '9M', so ids alone are lossless.
export type LearnsetPatch = {
  readonly add: readonly string[]
  readonly remove: readonly string[]
}

export const Learnsets: Readonly<Record<string, LearnsetPatch>> = {
  charizard: { add: ['slash'], remove: [] },
  wigglytuff: {
    add: ['healpulse', 'moonblast', 'perishsong', 'wish'],
    remove: [
      'allyswitch', 'attract', 'chargebeam', 'counter', 'curse', 'detect', 'doubleteam',
      'dynamicpunch', 'healbell', 'minimize', 'mudslap', 'pound', 'recycle', 'roleplay',
      'seismictoss', 'swagger', 'toxic', 'zapcannon',
    ],
  },
  persian: {
    add: ['flail'],
    remove: [
      'attract', 'curse', 'detect', 'mudslap', 'nightslash', 'swagger', 'torment',
      'toxic', 'zapcannon',
    ],
  },
  persianalola: {
    add: ['flail', 'flatter', 'partingshot'],
    remove: ['attract', 'lastresort', 'swagger', 'torment', 'toxic'],
  },
  farfetchd: {
    add: ['trailblaze'],
    remove: [
      'defog', 'detect', 'doubleedge', 'doubleteam', 'lastresort', 'mudslap', 'pluck',
      'psychup', 'reflect', 'swagger', 'tailwind', 'toxic', 'whirlwind', 'wish', 'yawn',
    ],
  },
  mrmime: {
    add: [],
    remove: [
      'aerialace', 'counter', 'covet', 'curse', 'doubleedge', 'doubleteam',
      'dynamicpunch', 'focuspunch', 'followme', 'infestation', 'mudslap', 'pound',
      'psychup', 'seismictoss', 'swagger', 'toxic', 'zapcannon',
    ],
  },
  pinsir: { add: ['slash'], remove: [] },
  feraligatr: { add: ['slash'], remove: [] },
  politoed: { add: [], remove: ['pound'] },
  qwilfish: { add: ['barbbarrage'], remove: [] },
  scizor: { add: ['slash'], remove: [] },
  skarmory: { add: ['slash'], remove: [] },
  sceptile: { add: ['slash'], remove: [] },
  blaziken: { add: ['slash'], remove: [] },
  swalot: {
    add: [
      'acidarmor', 'clearsmog', 'corrosivegas', 'destinybond', 'skittersmack',
      'stuffcheeks',
    ],
    remove: [
      'attract', 'block', 'counter', 'doubleteam', 'dynamicpunch', 'explosion',
      'infestation', 'pound', 'swagger',
    ],
  },
  sharpedo: { add: ['slash'], remove: [] },
  banette: { add: ['slash'], remove: [] },
  absol: { add: ['slash'], remove: [] },
  salamence: {
    add: ['dragonrush', 'slash', 'thrash'],
    remove: ['aircutter', 'aquatail', 'attract', 'defog', 'doubleteam', 'swagger', 'toxic'],
  },
  garchomp: { add: ['slash'], remove: [] },
  weavile: { add: ['slash'], remove: [] },
  gliscor: { add: ['slash'], remove: [] },
  gallade: { add: ['slash'], remove: [] },
  samurott: { add: ['slash'], remove: [] },
  samurotthisui: { add: ['slash'], remove: [] },
  liepard: { add: ['slash'], remove: [] },
  excadrill: { add: ['slash'], remove: [] },
  beartic: { add: ['slash'], remove: [] },
  gogoat: { add: ['megahorn'], remove: ['attract', 'bounce', 'doubleteam', 'swagger', 'toxic'] },
  pangoro: { add: ['slash'], remove: [] },
  meowstic: {
    add: ['imprison', 'meanlook', 'mistyterrain', 'quickguard', 'wish'],
    remove: ['extrasensory', 'futuresight'],
  },
  aegislash: { add: ['slash'], remove: [] },
  malamar: { add: ['slash'], remove: [] },
  barbaracle: { add: ['slash'], remove: [] },
  golisopod: {
    add: [
      'agility', 'aquajet', 'chillingwater', 'doublehit', 'gunkshot', 'nightslash',
      'pounce', 'uturn', 'wideguard',
    ],
    remove: [
      'aerialace', 'doubleteam', 'endeavor', 'frostbreath', 'knockoff', 'painsplit',
      'psychup', 'swagger', 'toxic', 'waterpulse',
    ],
  },
  mimikyu: { add: ['slash'], remove: [] },
  rillaboom: {
    add: ['fakeout', 'growth', 'hammerarm', 'leechseed', 'worryseed'],
    remove: ['attract', 'darkestlariat'],
  },
  cinderace: { add: ['highjumpkick', 'suckerpunch'], remove: ['allyswitch', 'attract'] },
  inteleon: {
    add: ['aquajet', 'aquaring', 'doubleteam', 'fellstinger', 'iceshard'],
    remove: ['attract', 'pound', 'safeguard'],
  },
  thievul: {
    add: [
      'doubleteam', 'firstimpression', 'howl', 'knockoff', 'quickguard', 'roar',
      'torment', 'trailblaze',
    ],
    remove: [],
  },
  toxtricity: { add: ['zapcannon'], remove: ['attract'] },
  toxtricitylowkey: { add: ['paraboliccharge'], remove: ['attract'] },
  grapploct: {
    add: [
      'chillingwater', 'circlethrow', 'machpunch', 'painsplit', 'seismictoss', 'soak',
      'stormthrow', 'suckerpunch',
    ],
    remove: [],
  },
  perrserker: {
    add: ['bite', 'bulkup', 'covet', 'flail', 'nightslash', 'spikes', 'thunderwave'],
    remove: ['attract'],
  },
  sirfetchd: {
    add: [
      'aerialace', 'counter', 'covet', 'curse', 'doubleedge', 'featherdance', 'feint',
      'flail', 'nightslash', 'quickattack', 'quickguard', 'simplebeam', 'skyattack',
      'slash',
    ],
    remove: [],
  },
  pincurchin: { add: [], remove: ['attract'] },
  indeedee: { add: ['wish'], remove: ['allyswitch', 'attract'] },
  indeedeef: { add: ['sing', 'wish'], remove: ['allyswitch', 'attract', 'expandingforce'] },
  kleavor: { add: ['slash'], remove: [] },
  sneasler: { add: ['slash'], remove: [] },
  meowscarada: { add: ['slash'], remove: [] },
  mabosstiff: { add: ['destinybond', 'focusenergy'], remove: ['charm'] },
  arboliva: { add: ['memento', 'strengthsap', 'synthesis'], remove: [] },
  baxcalibur: { add: ['aquatail', 'dragonrush', 'freezedry', 'frostbreath'], remove: [] },
  pawmot: { add: ['fakeout', 'machpunch', 'sweetkiss', 'wish'], remove: [] },
  squawkabilly: { add: ['lunge', 'seedbomb'], remove: [] },
  kingambit: { add: ['slash'], remove: [] },
  archaludon: { add: ['slash'], remove: ['metalburst', 'mirrorcoat'] },
}
