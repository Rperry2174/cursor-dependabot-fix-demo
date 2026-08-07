import chalk from 'chalk';

/**
 * chalk@4 supports CommonJS default import/require.
 * chalk@5+ is ESM-only — `import chalk from 'chalk'` / require() fails under CJS.
 */
export function info(message: string): string {
  const line = chalk.cyan('[kickvault]') + ' ' + chalk.white(message);
  // eslint-disable-next-line no-console
  console.log(line);
  return line;
}

export function warn(message: string): string {
  const line = chalk.yellow('[kickvault:warn]') + ' ' + chalk.white(message);
  // eslint-disable-next-line no-console
  console.warn(line);
  return line;
}

export function success(message: string): string {
  const line = chalk.green.bold('[kickvault:ok]') + ' ' + chalk.green(message);
  // eslint-disable-next-line no-console
  console.log(line);
  return line;
}
