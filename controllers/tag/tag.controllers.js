import tagModel from '../../models/tag/tag.model.js';
// Get All Tags

export const getAllTags = async (req, res) => {
  try {
    const findAllTags = await tagModel.find().lean();
    if (findAllTags) {
      return res.status(200).json(findAllTags);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Tag

export const createTag = async (req, res) => {
  const tag = req.body;
  try {
    const existingTag = await tagModel.findOne({
      name: tag.name,
    });
    if (existingTag) {
      return res.status(409).json({
        message: `Tag name ${tag.name} already existed!`,
      });
    } else {
      const newTag = new tagModel(tag);
      const savedTag = await newTag.save();
      return res.status(200).json(savedTag);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Tag

export const updateTag = async (req, res) => {
  const { id } = req.params;
  const tag = req.body;
  try {
    const existingTag = await tagModel.findById(id).lean();
    if (existingTag) {
      return res.status(404).json({ message: `Not found Tag by id: ${id}` });
    } else {
      const updatedTag = await tagModel
        .findByIdAndUpdate({
          _id: id,
          tag,
        })
        .lean();
      return res.status(200).json(updatedTag);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Tag

export const deleteTag = async (req, res) => {
  const { id } = req.params;
  try {
    const existingTag = await tagModel.findById(id).lean();
    if (existingTag) {
      return res.status(404).json({ message: `Not found Tag by id: ${id}` });
    } else {
      const deletedTag = await tagModel.findByIdAndDelete(id).lean();
      return res.status(200).json(deletedTag);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
