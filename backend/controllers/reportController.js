const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const SkillRecord = require('../models/skillRecord');
const User = require('../models/user');
const csv = require('csv-stringify');

exports.generateCSVReport = async (req, res) => {
    const { skill, skillLevel, employee } = req.query;
    try {
      let query = {};
  
      if (employee) {
        const user = await User.findOne({ name: employee });
        if (user) {
          query.userId = user._id;
        }
      }
  
      let skillRecords = await SkillRecord.find(query).populate('userId', 'name');
  
      if (skill) {
        skillRecords = skillRecords.filter(record => record.skills.some(s => s.name === skill));
      }
  
      if (skillLevel) {
        skillRecords = skillRecords.filter(record => record.skills.some(s => s.proficiency == skillLevel));
      }
  
      const data = skillRecords.map(record => {
        const skills = record.skills
          .filter(s => (!skill || s.name === skill) && (!skillLevel || s.proficiency == skillLevel))
          .map(s => `${s.name} (${getProficiencyLevel(s.proficiency)})`)
          .join(', ');
  
        return {
          name: record.userId.name,
          skills: skills || 'No skills matching the criteria'
        };
      });
  
      csv(data, { header: true }, (err, output) => {
        if (err) {
          console.error('Error generating CSV:', err);
          return res.status(500).send('Error generating CSV report');
        }
        res.header('Content-Type', 'text/csv');
        res.attachment('skill-matrix.csv');
        res.send(output);
      });
    } catch (error) {
      console.error('Error generating CSV report:', error);
      res.status(500).send('Error generating CSV report');
    }
  };

exports.generatePDFReport = async (req, res) => {
  const { skill, skillLevel, employee } = req.query;
  try {
    let query = {};

    if (employee) {
      const user = await User.findOne({ name: employee });
      if (user) {
        query.userId = user._id;
      }
    }

    let skillRecords = await SkillRecord.find(query).populate('userId', 'name');
    
    if (skill) {
      skillRecords = skillRecords.filter(record => record.skills.some(s => s.name === skill));
    }

    if (skillLevel) {
      skillRecords = skillRecords.filter(record => record.skills.some(s => s.proficiency == skillLevel));
    }

    const doc = new PDFDocument();
    let filename = 'skill-matrix';
    filename = encodeURIComponent(filename) + '.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.fontSize(25).text('Skill Matrix Report', { align: 'center' });
    doc.moveDown();

    const table = {
      headers: ["Employee Name", "Skills"],
      rows: []
    };

    skillRecords.forEach(record => {
      if (record.userId) {
        const userName = record.userId.name;
        const skills = record.skills
          .filter(s => (!skill || s.name === skill) && (!skillLevel || s.proficiency == skillLevel))
          .map(s => `${s.name}: ${getProficiencyLevel(s.proficiency)}`)
          .join(', ');
        if (skills) {
          table.rows.push([userName, skills]);
        }
      }
    });

    doc.fontSize(12);
    generateTable(doc, table);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).send('Error generating PDF report');
  }
};

function getProficiencyLevel(proficiency) {
  switch(proficiency) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Proficient';
    case 3:
      return 'Expert';
    default:
      return '';
  }
}

function generateTable(doc, table) {
  const startX = doc.x;
  const startY = doc.y;
  const rowHeight = 20;
  
  // Determine the maximum width for each column based on content
  const colWidth = table.headers.map((header, i) => {
    let maxWidth = doc.widthOfString(header) + 20; // Add some padding
    table.rows.forEach(row => {
      maxWidth = Math.max(maxWidth, doc.widthOfString(row[i]) + 20);
    });
    return maxWidth;
  });

  // Draw headers
  table.headers.forEach((header, i) => {
    doc.rect(startX + colWidth.slice(0, i).reduce((a, b) => a + b, 0), startY, colWidth[i], rowHeight).stroke();
    doc.text(header, startX + colWidth.slice(0, i).reduce((a, b) => a + b, 0) + 10, startY + 5);
  });

  // Draw rows
  table.rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      const yPos = startY + (rowIndex + 1) * rowHeight;
      doc.rect(startX + colWidth.slice(0, cellIndex).reduce((a, b) => a + b, 0), yPos, colWidth[cellIndex], rowHeight).stroke();
      doc.text(cell, startX + colWidth.slice(0, cellIndex).reduce((a, b) => a + b, 0) + 10, yPos + 5);
    });
  });
}