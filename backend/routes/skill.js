const express = require('express');
const Skill = require('../models/skill');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all skills
router.get('/', auth, async (req, res) => {
  try {
    const skills = await Skill.find({});
    res.status(200).send(skills);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Add a skill
router.post('/', auth, async (req, res) => {
  const skill = new Skill(req.body);
  try {
    await skill.save();
    res.status(201).send(skill);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update a skill
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'category'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).send();
    }

    updates.forEach((update) => (skill[update] = req.body[update]));
    await skill.save();
    res.send(skill);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete a skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      res.status(404).send();
    }

    res.send(skill);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;