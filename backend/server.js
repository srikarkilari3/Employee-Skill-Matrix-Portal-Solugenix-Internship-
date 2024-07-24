// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const SkillRecord = require('./models/skillRecord');
const ConfiguredSkills = require('./models/configuredSkills');
const Notification = require('./models/notification');
const auth = require('./middleware/authentication');
const reportController = require('./controllers/ReportController');

const app = express();
app.use(express.json());
app.use(cors());

const notifyEmployees = async (message) => {
  const employees = await User.find({ role: 'employee' });
  const notifications = employees.map(employee => ({
    userId: employee._id,
    message,
    read: false,
    timestamp: new Date()
  }));
  await Notification.insertMany(notifications);
};

mongoose.connect('mongodb://localhost:27017/skill-matrix', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = 5001;

// User registration and login
app.post('/users/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, 'secretKey', { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(400).send('Invalid credentials');
  }
});

// User-related routes
app.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

app.post('/employees', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const { name, email, password, role } = req.body;
    const employee = new User({ name, email, password, role });
    await employee.save();
    res.status(201).send('Employee added successfully');
  } catch (error) {
    res.status(500).send('Error adding employee: ' + error.message);
  }
});

app.put('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const userId = req.params.id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.send(user);
  } catch (error) {
    res.status(500).send('Error updating user: ' + error.message);
  }
});

app.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting user: ' + error.message);
  }
});

app.get('/users/:userId/skills', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const skillRecord = await SkillRecord.findOne({ userId });
    res.send(skillRecord || { skills: [] });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).send('Error fetching user skills');
  }
});

// Skill-related routes
app.get('/skills/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const skillRecord = await SkillRecord.findOne({ userId });
    res.send(skillRecord || { skills: [] });
  } catch (error) {
    res.status(500).send('Error fetching user skills: ' + error.message);
  }
});

app.post('/skills', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills } = req.body;
    let skillRecord = await SkillRecord.findOne({ userId });

    if (skillRecord) {
      skillRecord.skills = skills;
    } else {
      skillRecord = new SkillRecord({ userId, skills });
    }

    await skillRecord.save();

    // Notify admin about the skill update
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      message: `Employee ${req.user.name} has updated their skill matrix.`,
      read: false,
      timestamp: new Date()
    }));
    await Notification.insertMany(notifications);

    res.status(201).send('Skills added successfully');
  } catch (error) {
    res.status(500).send('Error adding skills: ' + error.message);
  }
});


// Make sure notifications are sent to employees when admin configures new skills
app.post('/skills/configure', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const { categories } = req.body;
    let configuredSkills = await ConfiguredSkills.findOne();
    if (!configuredSkills) {
      configuredSkills = new ConfiguredSkills({ categories });
    } else {
      configuredSkills.categories = categories;
    }
    await configuredSkills.save();

    // Notify employees about new skills
    await notifyEmployees('New skills have been added to the portal.');

    res.status(201).send('Skills and categories configured successfully');
  } catch (error) {
    res.status(500).send('Error configuring skills: ' + error.message);
  }
});


app.put('/skills/configure', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const { categories } = req.body;
    const configuredSkills = await ConfiguredSkills.findOneAndUpdate({}, { categories }, { new: true, upsert: true });

    // Notify employees about updated skills
    await notifyEmployees('Skills and categories have been updated.');

    res.status(200).send('Skills and categories updated successfully');
  } catch (error) {
    console.error('Error updating skills and categories:', error);
    res.status(500).send('Error updating skills and categories: ' + error.message);
  }
});

app.delete('/skills/configure/:skill', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const skill = req.params.skill;
    const configuredSkills = await ConfiguredSkills.findOne();
    if (configuredSkills) {
      configuredSkills.skills = configuredSkills.skills.filter(s => s !== skill);
      configuredSkills.categories.forEach(category => {
        category.skills = category.skills.filter(s => s !== skill);
      });
      await configuredSkills.save();
    }
    res.status(200).send('Skill deleted successfully');
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).send('Error deleting skill: ' + error.message);
  }
});

app.delete('/skills/configure/category/:categoryName', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const { categoryName } = req.params;
    const configuredSkills = await ConfiguredSkills.findOne();
    if (configuredSkills) {
      const category = configuredSkills.categories.find(category => category.name === categoryName);
      if (category) {
        // Collect all skills under the category
        const skillsToDelete = category.skills;

        // Remove the category
        configuredSkills.categories = configuredSkills.categories.filter(cat => cat.name !== categoryName);
        await configuredSkills.save();

        // Remove these skills from all employees' skill records
        await SkillRecord.updateMany({}, { $pull: { skills: { name: { $in: skillsToDelete } } } });
      }
    }

    res.status(200).send('Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Error deleting category: ' + error.message);
  }
});

app.delete('/skills/configure/skill/:categoryName/:skillName', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
    const { categoryName, skillName } = req.params;
    const configuredSkills = await ConfiguredSkills.findOne();
    if (configuredSkills) {
      const category = configuredSkills.categories.find(category => category.name === categoryName);
      if (category) {
        category.skills = category.skills.filter(skill => skill !== skillName);
        await configuredSkills.save();
      }
    }

    // Remove the skill from all employees' skill records
    await SkillRecord.updateMany({}, { $pull: { skills: { name: skillName } } });

    res.status(200).send('Skill deleted successfully');
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).send('Error deleting skill: ' + error.message);
  }
});

app.get('/skills/configured', auth, async (req, res) => {
  try {
    const configuredSkills = await ConfiguredSkills.findOne();
    res.send(configuredSkills || { skills: [], categories: [] });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/skill-matrix', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Access denied' });
    }
    const users = await User.find({ role: 'employee' }).lean();
    const userSkills = await SkillRecord.find().lean();
    const skillMatrix = users.map(user => ({
      name: user.name,
      skills: userSkills
        .filter(us => us.userId.equals(user._id))
        .map(us => us.skills)
        .flat()
    }));
    res.json(skillMatrix);
  } catch (error) {
    console.error('Error fetching skill matrix:', error);
    res.status(500).send('Failed to fetch skill matrix');
  }
});



// Fetch notifications
app.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.send(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).send('Error fetching notifications');
  }
});


// Fetch unread notifications count
app.get('/notifications/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.send({ unreadCount });
  } catch (error) {
    res.status(500).send('Error fetching unread notifications count: ' + error.message);
  }
});


// Mark all notifications as read
app.put('/notifications/markAllAsRead', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.send('All notifications marked as read');
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).send('Error marking notifications as read');
  }
});

// Mark a single notification as read
app.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.send('Notification marked as read');
  } catch (error) {
    res.status(500).send('Error marking notification as read: ' + error.message);
  }
});

// Report generation routes
app.get('/api/reports', auth, reportController.generateCSVReport);
app.get('/api/reports/pdf', auth, reportController.generatePDFReport);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});