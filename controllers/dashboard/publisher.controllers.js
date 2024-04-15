import { redisClient } from '../../config/redis.js';
import publisherModel from '../../models/publisher.model.js';
import { deleteCache, updateCache } from '../../modules/cache.js';
// Get All Publishers
export const getAllPublishers = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const findAllPublishers = await publisherModel.find().lean();
    if (findAllPublishers) {
      return res.status(200).json({
        error: false,
        success: true,
        publishers: findAllPublishers !== null ? findAllPublishers : [],
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Publisher

export const createPublisher = async (req, res) => {
  const publisher = req.body;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const existingPublisher = await publisherModel
      .findOne({
        name: publisher.name,
      })
      .lean();
    if (existingPublisher)
      return res.status(409).json({
        error: true,
        success: false,
        message: `Publisher name ${publisher.name} already existed!`,
      });
    const createdPublisher = await publisherModel.create(publisher);
    if (createdPublisher) {
      await redisClient.set(
        `publishers:${createdPublisher._id}`,
        JSON.stringify(createdPublisher)
      );
      return res
        .status(200)
        .json({ error: false, success: true, publisher: createdPublisher });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Publisher

export const updatePublisher = async (req, res) => {
  const { id } = req.params;
  const publisher = req.body;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const updatedPublisher = await publisherModel.findByIdAndUpdate({
      _id: id,
      publisher,
    });
    if (updatedPublisher) {
      await updateCache(`publishers:${updatedPublisher._id}`, updatedPublisher);
      return res
        .status(200)
        .json({ error: false, success: true, publisher: updatedPublisher });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found publisher by id: ${id}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Publisher

export const deletePublisher = async (req, res) => {
  const { id } = req.params;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const deletedPublisher = await publisherModel.findByIdAndDelete(id);
    if (deletedPublisher) {
      await deleteCache(`publishers:${deletedPublisher._id}`);
      return res
        .status(200)
        .json({ error: false, success: true, publisher: deletedPublisher });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found publisher by id: ${id}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
