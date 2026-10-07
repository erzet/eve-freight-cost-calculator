// Jump Freighter constants. Values verified against EVE University / EVE Ref.

export interface Ship {
  name: string;
  typeId: number;
  isotopeTypeId: number;
  /** Base jump-drive fuel consumption (isotope units per light-year at level 0 skills). */
  consumption: number;
  /** Base cargo hold volume (m3) before Racial Freighter skill bonus. */
  baseCargoM3: number;
  fuelBayM3: number;
  baseRangeLy: number;
}

export const SHIPS: Ship[] = [
  { name: 'Ark', typeId: 28850, isotopeTypeId: 16274, consumption: 8800, baseCargoM3: 135000, fuelBayM3: 12000, baseRangeLy: 5 },
  { name: 'Rhea', typeId: 28844, isotopeTypeId: 17888, consumption: 10000, baseCargoM3: 144000, fuelBayM3: 12000, baseRangeLy: 5 },
  { name: 'Anshar', typeId: 28848, isotopeTypeId: 17887, consumption: 9400, baseCargoM3: 137500, fuelBayM3: 12000, baseRangeLy: 5 },
  { name: 'Nomad', typeId: 28846, isotopeTypeId: 17889, consumption: 8200, baseCargoM3: 132000, fuelBayM3: 12000, baseRangeLy: 5 },
];

export const ISOTOPE_VOLUME_M3 = 0.03;
export const FUEL_BAY_UNITS = 400000;

export const ISOTOPE_NAMES: Record<number, string> = {
  16274: 'Helium Isotopes',
  17888: 'Nitrogen Isotopes',
  17887: 'Oxygen Isotopes',
  17889: 'Hydrogen Isotopes',
};
