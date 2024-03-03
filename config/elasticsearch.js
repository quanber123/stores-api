import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ node: 'http://localhost:9200' });
console.log(esClient.ping());
export async function connectElasticSearch() {
  try {
    await esClient.ping();
    console.log('Elasticsearch is ready');
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
}
