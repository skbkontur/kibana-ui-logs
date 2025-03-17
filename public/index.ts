import './index.scss';

import { KibanaSearchLoggerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new KibanaSearchLoggerPlugin();
}
export { KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart } from './types';
