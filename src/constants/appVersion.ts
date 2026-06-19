/** App version from package.json — single source for runtime UI footers. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const APP_VERSION: string = require('../../package.json').version as string;
