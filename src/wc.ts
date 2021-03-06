import os from 'os';
import { execSync } from 'child_process';
import fs, { ReadStream } from 'fs';
import path from 'path';
import readline from 'readline';
import { ICSVDataPair, ICSVDataSource } from './types';
import createInterface from './utils/createInterface';

const platform = os.platform();

const optionToIndex: any = {
  l: 0,
  w: 1,
  c: 2,
};

interface WcOptions {
  [name: string]: boolean;
}

/**
 *
 * @param {string} dataSource
 * @param {object} options
 * @param {boolean} l lines
 * @param {boolean} w words
 * @param {boolean} c chars
 * @returns
 */
export default async function wc(dataSource: string | ICSVDataSource, options: WcOptions) {
  const fields = Object.entries(options)
    .filter(([key, value]) => value && optionToIndex[key] !== undefined)
    .map(([key, value]) => {
      return key;
    })
    .sort((a, b) => optionToIndex[a] - optionToIndex[b]);
  if (platform === 'win32' || typeof dataSource !== 'string') {
    const rl = createInterface(dataSource)
    if (!rl) {
      throw new Error("Cannot write into readable stream")
    }
    const r: any = { l: 0, w: 0, c: 0 };
    for await (const line of rl) {
      if (options.l) r.l++;
      if (options.w) r.w += line.split(/\s+/).length;
      if (options.c) r.c += line.length + 1; // 1 for \n
    }
    if (typeof dataSource === 'string') {
      const stats = fs.statSync(dataSource);
      if (options.c) r.c = stats.size;
    }
    const toReturn: any = {};
    for (const field of fields) {
      toReturn[field] = r[field];
    }
    rl.close()
    return toReturn;
  }

  const cmd = `wc ${fields.map((x) => `-${x}`).join(' ')} "${dataSource}"`;
  const stdout = execSync(cmd).toString().trim();
  const splited = stdout.split(/\s{1,}/);
  const toReturn: any = {};
  let i = 0;
  for (const field of fields) {
    toReturn[field] = parseInt(splited[i]);
    i++;
  }
  return toReturn;
}
