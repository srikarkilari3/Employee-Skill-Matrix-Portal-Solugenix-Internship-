import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const CategoryContainer = styled.div`
  width: 80%;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CategoryTitle = styled.h3`
  background-color: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SkillRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SkillLabel = styled.label`
  font-size: 1rem;
  color: #333;
`;

const SkillSelect = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const AddSkillsButton = styled.button`
  background-color: #333;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #555;
  }
`;

const SelectedSkillsContainer = styled.div`
  width: 80%;
  background-color: #f1f1f1;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const SelectedSkillRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const EditButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #555;
  }
`;

const Skills = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [configuredSkills, setConfiguredSkills] = useState([]);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConfiguredSkills = async () => {
      try {
        const response = await axios.get('http://localhost:5001/skills/configured', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setConfiguredSkills(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching configured skills:', error);
      }
    };

    const fetchUserSkills = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/users/${user.userId}/skills`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSelectedSkills(response.data.skills || []);
      } catch (error) {
        console.error('Error fetching user skills:', error);
      }
    };

    if (token) {
      fetchConfiguredSkills().then(() => fetchUserSkills());
    }
  }, [token, user]);

  const handleSkillChange = (skillName, proficiency) => {
    setSelectedSkills(prevState => {
      const existingSkill = prevState.find(skill => skill.name === skillName);
      if (existingSkill) {
        return prevState.map(skill =>
          skill.name === skillName ? { ...skill, proficiency } : skill
        );
      } else {
        return [...prevState, { name: skillName, proficiency }];
      }
    });
  };

  const handleAddSkills = async () => {
    try {
      await axios.post('http://localhost:5001/skills', { skills: selectedSkills }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Skills added successfully');
    } catch (error) {
      console.error('Error adding skills:', error);
      alert('Error adding skills');
    }
  };

  const handleEditSkill = (skillName) => {
    const skill = selectedSkills.find(s => s.name === skillName);
    if (skill) {
      document.querySelector(`select[name="${skillName}"]`).value = skill.proficiency;
    }
  };

  return (
    <Container>
      <Title>Add Your Skills</Title>
      {configuredSkills.map((category, idx) => (
        <CategoryContainer key={idx}>
          <CategoryTitle>{category.name}</CategoryTitle>
          {category.skills.map(skill => {
            const userSkill = selectedSkills.find(s => s.name === skill);
            return (
              <SkillRow key={skill}>
                <SkillLabel>{skill}</SkillLabel>
                <SkillSelect
                  name={skill}
                  value={userSkill ? userSkill.proficiency : '0'}
                  onChange={(e) => handleSkillChange(skill, parseInt(e.target.value, 10))}
                >
                  <option value="0">None</option>
                  <option value="1">Beginner</option>
                  <option value="2">Proficient</option>
                  <option value="3">Expert</option>
                </SkillSelect>
              </SkillRow>
            );
          })}
        </CategoryContainer>
      ))}
      <AddSkillsButton onClick={handleAddSkills}>Add Skills</AddSkillsButton>

      <SelectedSkillsContainer>
        <h2>Your Skills</h2>
        {selectedSkills.map(skill => (
          <SelectedSkillRow key={skill.name}>
            <span>{skill.name} - {['None', 'Beginner', 'Proficient', 'Expert'][skill.proficiency]}</span>
          </SelectedSkillRow>
        ))}
      </SelectedSkillsContainer>
    </Container>
  );
};

export default Skills;