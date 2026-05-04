const test = require('node:test');
const assert = require('node:assert/strict');

const binsRepository = require('../../src/modules/bins/bins.repository');
const binsService = require('../../src/modules/bins/bins.service');

test('calculateAverageFillRate returns average', () => {
  const avg = binsService.calculateAverageFillRate([
    { taux_remplissage: 50 },
    { taux_remplissage: 100 },
  ]);

  assert.equal(avg, 75);
});

test('getPriorityBins returns only bins above 85%', () => {
  const bins = binsService.getPriorityBins([
    { id: 1, taux_remplissage: 84 },
    { id: 2, taux_remplissage: 86 },
    { id: 3, taux_remplissage: 100 },
  ]);

  assert.deepEqual(bins.map((bin) => bin.id), [2, 3]);
});

test('getBinById throws when repository returns null', async () => {
  const original = binsRepository.findById;
  binsRepository.findById = async () => null;

  await assert.rejects(() => binsService.getBinById('missing'), {
    name: 'NotFoundError',
  });

  binsRepository.findById = original;
});

test('createBin rejects invalid payload', async () => {
  await assert.rejects(() => binsService.createBin({ code: 'A' }), {
    name: 'ValidationError',
  });
});
