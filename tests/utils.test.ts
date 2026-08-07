import fs from 'fs';
import os from 'os';
import path from 'path';
import { newListingId, assertUuidV4 } from '../src/utils/ids';
import { info, success } from '../src/utils/logging';
import { encodeQuery, createCancelableGet } from '../src/utils/http';
import { listFixtureFiles, loadListingsFromDir, summarizeAsks, formatOrderTimestamp } from '../src/utils/catalog';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import glob from 'glob';
import axios from 'axios';

describe('uuid@8', () => {
  it('generates v4 ids', () => {
    const id = newListingId();
    expect(assertUuidV4(id)).toBe(true);
    expect(uuidv4()).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe('chalk@4 cjs', () => {
  it('colorizes strings via chalk.cyan / chalk.green.bold', () => {
    expect(chalk.cyan('x')).toContain('x');
    expect(success('listed')).toContain('listed');
    expect(info('boot')).toContain('boot');
  });
});

describe('node-fetch@2 + axios@0.27 + qs', () => {
  it('exports a callable fetch function', () => {
    expect(typeof fetch).toBe('function');
  });

  it('builds qs strings and cancel tokens', () => {
    expect(encodeQuery({ a: 1, tags: ['x', 'y'] })).toContain('a=1');
    const { promise, cancel } = createCancelableGet('http://127.0.0.1:9');
    promise.catch(() => undefined);
    cancel('demo-cancel');
    expect(typeof cancel).toBe('function');
    expect(typeof axios.CancelToken).toBe('function');
  });
});

describe('glob@8 sync API', () => {
  it('lists json fixtures with glob.sync', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-'));
    fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify({ sku: 'B' }));
    fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify({ sku: 'A' }));
    const files = listFixtureFiles(dir, '*.json');
    expect(files.sort()).toEqual(['a.json', 'b.json']);
    expect(typeof glob.sync).toBe('function');
    const listings = loadListingsFromDir(dir);
    expect(listings[0].sku).toBe('A');
  });
});

describe('moment + lodash helpers', () => {
  it('formats timestamps and summarizes asks', () => {
    expect(formatOrderTimestamp('2020-01-01T00:00:00Z')).toBe('2020-01-01T00:00:00Z');
    expect(summarizeAsks([100, 200, null as any])).toEqual({
      count: 2,
      min: 100,
      max: 200,
      avg: 150,
    });
  });
});
