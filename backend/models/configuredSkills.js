const mongoose = require('mongoose');

const configuredSkillsSchema = new mongoose.Schema({
  skills: {
    type: [String],
    default: []
  },
  categories: [{
    name: String,
    skills: {
      type: [String],
      default: []
    }
  }]
});

module.exports = mongoose.model('ConfiguredSkills', configuredSkillsSchema);