import publisherModel from '../models/publisher.model';

// Get All Publishers

export const getAllPublishers = async (req, res) => {
  const { publishers, page } = req.query;
  try {
    const totalPublishers = await publisherModel.countDocuments();
    const total = Math.ceil(totalPublishers / publishers);
    const findAllPublishers = await publisherModel
      .find()
      .skip((page - 1) * publishers)
      .limit(publishers);
    if (findAllPublishers) {
      return res
        .status(200)
        .json({ publishers: findAllPublishers, totalPage: total });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Publisher

export const createPublisher = async (req, res) => {
  const publisher = req.body;
  try {
    const existingPublisher = await publisherModel.findOne({
      name: publisher.name,
    });
    if (existingPublisher) {
      return res
        .status(409)
        .json({ message: `Publisher name ${publisher.name} already existed!` });
    } else {
      const newPublisher = new publisherModel(publisher);
      const savedPublisher = await newPublisher.save();
      return res.status(200).json(savedPublisher);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Publisher
