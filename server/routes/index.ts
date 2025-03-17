// import { Client } from '@elastic/elasticsearch';
import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';
import { MyPluginConfigType } from '..';

export function defineRoutes(router: IRouter, config: MyPluginConfigType) {
  //  const esClient = new Client({
  //   // nodes: [
  //   //   'http://vm-elk-es01:9200',
  //   // ],
  //   // auth: {
  //   //   username: config.username,
  //   //   password: config.password
  //   // }
  // });
  
  router.post(
    {
      path: '/api/kibana_search_logger/log',
      validate: {
        body: schema.object({
          searchIndex: schema.string(),
          fromTime: schema.string(),
          toTime: schema.string(),
          query: schema.maybe(schema.string()),
          filters: schema.maybe(schema.arrayOf(schema.string()))
        }),
      },
    },
    async (context, request, response) => {
      const esClient = context.core.elasticsearch.client.asInternalUser;

      async function ensureIndexExists() {
        const { body: indexExists } = await esClient.indices.exists({ index: config.indexname });
        console.log('Index exists:', indexExists);
        
        if (!indexExists) {
          try {
            await esClient.indices.create({
              index: config.indexname,
              body: {
                mappings: {
                  properties: {
                    timestamp: { type: 'date' },
                    data: { type: 'object' },
                  },
                },
              },
            });
            console.log('Index created successfully');
          } catch (error) {
            console.error(`Error when creating index: ${error}`);
          }
        }
      }

      async function logData() {
        try {
          const { query, ...rest } = request.body;

          const logEntry: Record<string, any> = {
            timestamp: new Date().toISOString(),
            ...rest,
          };

          if (query) {
            logEntry.query = query; 
          }

          await esClient.index({
            index: config.indexname,
            body: logEntry,
          });
          console.log('Data indexed successfully');
        } catch (error) {
          console.error(`Data NOT indexed successfully: ${error}`);
        }
      }

      try {
        await ensureIndexExists();
        await logData();
        return response.ok({ body: { status: 'event logged' } });
      } catch (error) {
        return response.badRequest({ body: error.message });
      }
    }
  );
}
