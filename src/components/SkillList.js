import React, { useEffect, useState } from 'react';
import api from '../api';

const SkillList = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get('/skills');
        setSkills(response.data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, []);

  return (
    <div>
      <h1>Skill List</h1>
      <ul>
        {skills.map(skill => (
          <li key={skill._id}>{skill.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SkillList;