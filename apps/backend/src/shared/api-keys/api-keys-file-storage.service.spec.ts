import { beforeEach, describe, expect, it, vi } from 'vitest';

// We'll dynamically import the module after setting STORAGE_DIR so its storages are initialized to our temp folder.

const baseDir = `.storage/tmp/spec_${Date.now()}`;
let counter = 0;

async function newService() {
  const dir = `${baseDir}/${++counter}`;
  process.env.STORAGE_DIR = dir;
  vi.resetModules();
  const mod = await import('./api-keys-file-storage.service');
  const Svc = mod.ApiKeysFileStorageService as any;
  return new Svc();
}

describe('ApiKeysFileStorageService (integration with node-persist)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('create -> findOne works and sets defaults', async () => {
    const svc = await newService();
    vi.setSystemTime(1_700_000_000_000);
    const created = await svc.create({ name: 'Key1', key: 'secret-1' });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Key1');
    expect(created.key).toBe('secret-1');
    expect(created.createdAt).toBe(1_700_000_000_000);
    expect(created.usageCount).toBe(0);

    const fetched = await svc.findOne(created.id);
    expect(fetched).toEqual(created);
  });

  it('create with existing id updates the record', async () => {
    const svc = await newService();
    const a = await svc.create({ name: 'A', key: 'k1' });
    const updated = await svc.create({ id: a.id, name: 'A2', key: 'k2' });

    expect(updated.id).toBe(a.id);
    expect(updated.name).toBe('A2');
    expect(updated.key).toBe('k2');

    const fetched = await svc.findOne(a.id);
    expect(fetched).toEqual(updated);
  });

  it('findAll returns all keys', async () => {
    const svc = await newService();
    const a = await svc.create({ name: 'A', key: 'k1' });
    const b = await svc.create({ name: 'B', key: 'k2' });
    const all = await svc.findAll();
    const ids = all.map((x: any) => x.id);
    expect(ids).toEqual(expect.arrayContaining([a.id, b.id]));
  });

  it('update modifies existing and throws for missing', async () => {
    const svc = await newService();
    const a = await svc.create({ name: 'A', key: 'k1' });

    const after = await svc.update(a.id, { name: 'A3' });
    expect(after.name).toBe('A3');

    await expect(svc.update('missing', { name: 'X' })).rejects.toThrow('Token not found');
  });

  it('remove deletes item', async () => {
    const svc = await newService();
    const a = await svc.create({ name: 'A', key: 'k1' });
    await svc.remove(a.id);
    const got = await svc.findOne(a.id);
    expect(got).toBeFalsy();
  });

  it('updateDefault and getDefault return the selected key; missing id yields nullish', async () => {
    const svc = await newService();
    const a = await svc.create({ name: 'A', key: 'k1' });
    const b = await svc.create({ name: 'B', key: 'k2' });

    await svc.updateDefault(b.id);
    const def1 = await svc.getDefault();
    expect(def1?.id).toBe(b.id);

    await svc.remove(b.id);
    const def2 = await svc.getDefault();
    expect(def2 == null).toBe(true); // null or undefined
  });
});
