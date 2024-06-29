const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  response: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    enum: ['brain-mri', 'chest-xray', 'report', 'injury'],
    required: true
  },
  base64String: {
    type: String,
    required: function() {
      return ['brain-mri', 'chest-xray', 'injury'].includes(this.type);
    }
  },
});

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis;
