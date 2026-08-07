import fs from 'fs';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';
import moment from 'moment';

/**
 * glob@8 exposes glob.sync(pattern, options) as a CJS default export helper.
 * glob@9+/@10+ moved to a promise-first ESM API — glob.sync import shape changes.
 */
export function listFixtureFiles(cwd: string, pattern = '**/*.json'): string[] {
  return glob.sync(pattern, {
    cwd,
    absolute: false,
    nodir: true,
    ignore: ['node_modules/**'],
  });
}

export function loadListingsFromDir(dir: string): Array<Record<string, unknown>> {
  const files = listFixtureFiles(dir, '*.json');
  const listings = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  });
  return _.sortBy(listings, [(l) => String(l.sku)]);
}

export function summarizeAsks(asks: number[]): {
  count: number;
  min: number | undefined;
  max: number | undefined;
  avg: number;
} {
  const compact = _.compact(asks);
  return {
    count: compact.length,
    min: _.min(compact),
    max: _.max(compact),
    avg: compact.length ? Number((_.sum(compact) / compact.length).toFixed(2)) : 0,
  };
}

/** moment@2 formatting used in order receipts */
export function formatOrderTimestamp(date: Date | string = new Date()): string {
  return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
}

export function daysSinceListed(listedAt: string): number {
  return moment.utc().diff(moment.utc(listedAt), 'days');
}
