import mongoose from 'mongoose';
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
});

export default mongoose.model('Tag', tagSchema);
