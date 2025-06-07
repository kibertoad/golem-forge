import { describe, expect, it } from 'vitest';
import { sortAndFilterActivations } from './activationFilter';
describe('activationFilter', () => {
    describe('filterActivations', () => {
        it('exclusive filters all other entries out', () => {
            const activations = [
                { priority: 1 },
                { priority: 3, isExclusive: true },
                { priority: 2 },
                { priority: 5, isExclusive: true },
                { priority: 4 },
            ];
            const result = sortAndFilterActivations(activations);
            expect(result).toMatchInlineSnapshot(`
        [
          {
            "isExclusive": true,
            "priority": 5,
          },
        ]
      `);
        });
        it('exclusive requires to be the only entry', () => {
            const activations = [
                { priority: 1 },
                { priority: 3, isExclusive: true },
                { priority: 2 },
                { priority: 0, isExclusive: true },
                { priority: 4 },
            ];
            const result = sortAndFilterActivations(activations);
            expect(result).toMatchInlineSnapshot(`
        [
          {
            "priority": 4,
          },
          {
            "priority": 2,
          },
          {
            "priority": 1,
          },
        ]
      `);
        });
    });
});
//# sourceMappingURL=activationFilter.spec.js.map