const mongoose = require('mongoose');



// Comment Schema
const commentSchema = new mongoose.Schema({
  text: String,
  sentiment: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who posted the comment
},
    {
    timestamps: true
  }
);



const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;