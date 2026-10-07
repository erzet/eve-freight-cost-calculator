import type { Ship } from '../lib/ships';
import type { Skills } from '../types';
import { CARD, LEGEND, FIELD, FIELD_LABEL, CONTROL } from '../ui';

interface Props {
  ships: Ship[];
  shipName: string;
  onShipName: (name: string) => void;
  skills: Skills;
  onSkills: (skills: Skills) => void;
}

const SKILL_FIELDS: { key: keyof Skills; label: string }[] = [
  { key: 'jdc', label: 'Jump Drive Calibration' },
  { key: 'jfc', label: 'Jump Fuel Conservation' },
  { key: 'jf', label: 'Jump Freighters' },
  { key: 'racial', label: 'Racial Freighter (cargo)' },
];

export default function ShipSkillsForm({ ships, shipName, onShipName, skills, onSkills }: Props) {
  return (
    <fieldset className={CARD}>
      <legend className={LEGEND}>Ship &amp; Skills</legend>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Jump Freighter</span>
        <select className={CONTROL} value={shipName} onChange={(e) => onShipName(e.target.value)}>
          {ships.map((s) => (
            <option key={s.typeId} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-x-3">
        {SKILL_FIELDS.map(({ key, label }) => (
          <label key={key} className={FIELD}>
            <span className={FIELD_LABEL}>{label}</span>
            <input
              className={CONTROL}
              type="number"
              min={0}
              max={5}
              value={skills[key]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(5, Math.round(Number(e.target.value) || 0)));
                onSkills({ ...skills, [key]: v });
              }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
