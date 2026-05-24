import { Dex, Species, type ID, type ModData } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions';
import z from 'zod';

const championsDex = Dex.mod('champions' as ID, champions as ModData);

// Prime the Learnsets table at module load so derived schemas below (and any
// downstream sync access to championsDex.data.Learnsets) work without per-call
// priming. Makes this module async — consumers must await imports transitively.
await championsDex.learnsets.get('venusaur');

const championsSpeciesNameSchema = z.literal([
    ...championsDex.species.all()
        .filter((s) => s.isNonstandard == null && !s.isCosmeticForme)
        .flatMap((s) => s.name),
]);

type ChampionsSpeciesName = z.infer<typeof championsSpeciesNameSchema>;

const championsItemsSchema = z.literal(
    championsDex.items.all()
        .filter((i) => i.isNonstandard == null)
        .flatMap((i) => i.name)
);

const championsSpeciesAbilitiesSchema = (species: Species) =>
    z.literal(Object.values(species.abilities));

// Derived from legal species' abilities, NOT from filtering `dex.abilities.all()`:
// abilities like Protosynthesis/Beads of Ruin aren't flagged isNonstandard themselves,
// but every Pokémon that carries them is — so the ability isn't actually legal in Champions.
const championsAbilitiesSchema = z.literal([
    ...new Set(
        championsDex.species.all()
            .filter((s) => s.isNonstandard == null && !s.isCosmeticForme)
            .flatMap((s) => Object.values(s.abilities))
    )
]);



const championsSpeciesMovesSchema = (species: Species) => {
    const learnset = championsDex.data.Learnsets?.[species.id]?.learnset ?? {}
    const names: string[] = Object.keys(learnset)
        .map((id) => championsDex.moves.get(id)?.name as string | undefined)
        .filter((n): n is string => n != null)
    return z.literal(names as [string, ...string[]])
}

// Derived from learnsets of legal species, NOT from filtering `dex.moves.all()`.
// Some moves (Milk Drink, Soft-Boiled, Spore, Power Shift) aren't flagged isNonstandard
// but their only learners are non-Champions species, so they aren't legal in practice.
// NOTE: assumes Learnsets table is primed (e.g. via `await championsDex.learnsets.get(...)`)
// before this module is imported. Build-time evaluation may yield an empty set otherwise.
const championsMovesSchema = z.literal([
    ...new Set(
        championsDex.species.all()
            .filter((s) => s.isNonstandard == null && !s.isCosmeticForme)
            .flatMap((s) => Object.keys(championsDex.data.Learnsets?.[s.id]?.learnset ?? {}))
            .map((id) => championsDex.moves.get(id)?.name as string | undefined)
            .filter((n): n is string => n != null)
    )
]);

export {
    championsDex,
    type ChampionsSpeciesName,
    championsAbilitiesSchema,
    championsItemsSchema,
    championsMovesSchema,
    championsSpeciesAbilitiesSchema,
    championsSpeciesMovesSchema,
    championsSpeciesNameSchema,
}