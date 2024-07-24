const mongoose = require('mongoose');

const SkillRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [
    {
      name: { type: String, required: true },
      proficiency: { type: Number, required: true, min: 1, max: 3 }
    }
  ]
});

const SkillRecord = mongoose.model('SkillRecord', SkillRecordSchema);
module.exports = SkillRecord;