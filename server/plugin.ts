import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';
import { MyPluginConfigType } from '.'; 
import { KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart } from './types';
import { defineRoutes } from './routes';

export class KibanaSearchLoggerPlugin
  implements Plugin<KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart>
{
  private readonly logger: Logger;
  private readonly config$: MyPluginConfigType;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.get()
  }

  public setup(core: CoreSetup) {
    this.logger.debug('kibanaSearchLogger: Setup');
    
    const router = core.http.createRouter();

    defineRoutes(router,this.config$);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('kibanaSearchLogger: Started');

    return {};
  }

  public stop() {}
}
