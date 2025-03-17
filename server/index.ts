import { PluginInitializerContext } from '../../../src/core/server';
import { KibanaSearchLoggerPlugin } from './plugin';
import { schema, TypeOf } from '@kbn/config-schema';
import { INDEX_NAME } from '../common';

export const config = {
  schema:schema.object({
    indexname: schema.string({ defaultValue: INDEX_NAME }),
  }),
}

export type MyPluginConfigType = TypeOf<typeof config.schema>;

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new KibanaSearchLoggerPlugin(initializerContext);
}

export { KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart } from './types';
