import publisherModel from '../../models/publisher/publisher.model.js';

// Get All Publishers

export const getAllPublishers = async (req, res) => {
  const { publishers, page } = req.query;
  try {
    const totalPublishers = await publisherModel.countDocuments();
    const total = Math.ceil(totalPublishers / publishers);
    const findAllPublishers = await publisherModel
      .find()
      .skip((page - 1) * publishers)
      .limit(publishers)
      .lean();

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
    const existingPublisher = await publisherModel
      .findOne({
        name: publisher.name,
      })
      .lean();
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

export const updatePublisher = async (req, res) => {
  const { id } = req.params;
  const publisher = req.body;
  try {
    const existingPublisher = await publisherModel.findById(id);
    if (existingPublisher) {
      return res
        .status(404)
        .json({ message: `Not found publisher by id: ${id}` });
    } else {
      const updatedPublisher = await publisherModel.findByIdAndUpdate({
        _id: id,
        publisher,
      });

      return res.status(200).json(updatedPublisher);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Publisher

export const deletePublisher = async (req, res) => {
  const { id } = req.params;
  try {
    const existingPublisher = await publisherModel.findById(id);
    if (existingPublisher) {
      return res
        .status(404)
        .json({ message: `Not found publisher by id: ${id}` });
    } else {
      const deletedPublisher = await publisherModel.findByIdAndDelete(id);

      return res.status(200).json(deletedPublisher);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
