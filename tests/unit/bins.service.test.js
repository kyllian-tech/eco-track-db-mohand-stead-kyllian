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

test('calculateAverageFillRate returns 0 for an empty array', () => {
  assert.equal(binsService.calculateAverageFillRate([]), 0);
});

test('calculateAverageFillRate ignores entries without a numeric taux_remplissage', () => {
  const avg = binsService.calculateAverageFillRate([
    { taux_remplissage: 50 },
    { taux_remplissage: 'invalid' },
    { taux_remplissage: 100 },
  ]);

  assert.equal(avg, 75);
});

test('calculateAverageFillRate returns 0 when no entry has a numeric taux_remplissage', () => {
  const avg = binsService.calculateAverageFillRate([{ taux_remplissage: 'invalid' }]);
  assert.equal(avg, 0);
});

test('getPriorityBins excludes bins at exactly 85% (boundary)', () => {
  const bins = binsService.getPriorityBins([
    { id: 1, taux_remplissage: 85 },
    { id: 2, taux_remplissage: 85.1 },
  ]);

  assert.deepEqual(bins.map((bin) => bin.id), [2]);
});

test('getPriorityBins ignores entries without a numeric taux_remplissage', () => {
  const bins = binsService.getPriorityBins([
    { id: 1, taux_remplissage: 'invalid' },
    { id: 2, taux_remplissage: 90 },
  ]);

  assert.deepEqual(bins.map((bin) => bin.id), [2]);
});

test('getPriorityBins throws ValidationError with explicit message when input is not an array', () => {
  assert.throws(() => binsService.getPriorityBins('not-an-array'), {
    name: 'ValidationError',
    message: 'bins doit être un tableau',
  });
});

test('updateBin checks existence then delegates to the repository', async () => {
  const originalFindById = binsRepository.findById;
  const originalUpdate = binsRepository.update;

  binsRepository.findById = async () => ({ id: 'bin-1' });
  binsRepository.update = async (id, payload) => ({ id, ...payload });

  const updated = await binsService.updateBin('bin-1', { type: 'OMR' });
  assert.deepEqual(updated, { id: 'bin-1', type: 'OMR' });

  binsRepository.findById = originalFindById;
  binsRepository.update = originalUpdate;
});

test('deleteBin checks existence then delegates to the repository', async () => {
  const originalFindById = binsRepository.findById;
  const originalDelete = binsRepository.delete;

  binsRepository.findById = async () => ({ id: 'bin-1' });
  let deleteCalledWith = null;
  binsRepository.delete = async (id) => {
    deleteCalledWith = id;
    return true;
  };

  const result = await binsService.deleteBin('bin-1');
  assert.equal(result, true);
  assert.equal(deleteCalledWith, 'bin-1');

  binsRepository.findById = originalFindById;
  binsRepository.delete = originalDelete;
});
