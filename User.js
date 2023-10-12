import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
});
const userSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    min: 1,
    validate: {
      validator: () => {},
    },
  },
  email: {
    type: String,
    minLength: 10,
    // required: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
  bestFriend: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  hobbies: [String],
  address: addressSchema,
});
userSchema.statics.findByName = function (name) {
  return this.where({ name: new RegExp(name, 'i') });
};
userSchema.virtual('nameEmail').get(function () {
  return `${this.name} <${this.email}>`;
});
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
export default mongoose.model('User', userSchema);
