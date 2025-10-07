const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['avis', 'reclamation', 'suggestion', 'autre'],
    default: 'autre'
  },
  status: {
    type: String,
    enum: ['nouveau', 'en_traitement', 'traité'],
    default: 'nouveau'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  response: {
    text: String,
    createdAt: {
      type: Date,
      default: null
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);