const express = require('express');
const SkillRecord = require('../models/skillRecord');
const router = express.Router();

// Example route: Get all skill records
router.get('/', async (req, res) => {
  try {
    const skillRecords = await SkillRecord.find({}).populate('user').populate('skill');
    res.status(200).send(skillRecords);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;