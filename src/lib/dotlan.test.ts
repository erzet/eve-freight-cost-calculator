import { describe, it, expect } from 'vitest';
import { dotlanJumpUrl } from './dotlan';
import type { RouteLeg } from './pathfind';

const leg = (fromName: string, toName: string): RouteLeg => ({ fromId: 0, fromName, toId: 0, toName, distLy: 0, fuel: 0 });

describe('dotlanJumpUrl', () => {
  it('encodes skills as JDC,JFC,JF and joins waypoints with colons', () => {
    const url = dotlanJumpUrl('Rhea', 5, 4, 4, [leg('Kuharah', 'Astabih'), leg('Astabih', 'Otela')]);
    expect(url).toBe('https://evemaps.dotlan.net/jump/Rhea,544/Kuharah:Astabih:Otela');
  });

  it('returns null when there are no legs', () => {
    expect(dotlanJumpUrl('Rhea', 5, 4, 4, [])).toBeNull();
  });

  it('URL-encodes spaces in system names', () => {
    const url = dotlanJumpUrl('Rhea', 5, 5, 5, [leg('New Caldari', 'Old Man Star')]);
    expect(url).toBe('https://evemaps.dotlan.net/jump/Rhea,555/New%20Caldari:Old%20Man%20Star');
  });
});
