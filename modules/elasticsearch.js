import { esClient } from '../config/elasticsearch.js';
export const docWithoutId = (doc) => {
  return Object.fromEntries(
    Object.entries(doc).filter(([key]) => key !== '_id')
  );
};
export async function firstLoadingElasticSearch(arrType, arrModel) {
  try {
    let nonExisted = [];

    for (let type of arrType) {
      const existedIndex = await esClient.indices.exists({
        index: type,
      });
      if (existedIndex === false) {
        nonExisted.push(type);
        await esClient.indices.create(
          {
            index: type,
            body: {
              mappings: {
                properties: {
                  created_at: { type: 'date' },
                  details: {
                    type: 'nested',
                  },
                },
              },
            },
          },
          { ignore: [400] }
        );
      }
    }
    const nonExistedModel = arrModel.filter((m) => nonExisted.includes(m.type));
    if (nonExistedModel.length !== 0) {
      for (let model of nonExistedModel) {
        const data = await model.model
          .find()
          .populate([...model.populate])
          .lean();
        if (data) {
          const operations = await Promise.all(
            data.flatMap((doc) => {
              return [
                { index: { _index: model.type, _id: doc._id } },
                docWithoutId(doc),
              ];
            })
          );
          if (operations) {
            const bulkResponse = await esClient.bulk({
              refresh: true,
              operations,
            });
            if (bulkResponse.errors) {
              const erroredDocuments = [];
              bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                  erroredDocuments.push({
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: operations[i * 2],
                    document: operations[i * 2 + 1],
                  });
                }
              });
              console.log(erroredDocuments);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during first loading of Elasticsearch:', error);
  }
}
