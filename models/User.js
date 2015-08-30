import mongoose from 'mongoose';
let Schema = mongoose.Schema;

export default mongoose.model('User', new Schema({
  name: String,
  password: String
}));