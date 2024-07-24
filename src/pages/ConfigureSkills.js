import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import './Button.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  color: #333;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: white;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
`;

const SkillCategory = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
`;

const SkillItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px;
  width: 100%;
`;

const DeleteButton = styled.button`
  padding: 5px 10px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  background-color: #f44336;
  color: white;
  cursor: pointer;
  
  &:hover {
    background-color: #da190b;
  }
`;

const ConfigureSkills = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySkills, setNewCategorySkills] = useState('');
  const { token } = useContext(AuthContext);

  const fetchConfiguredSkills = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/skills/configured', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching configured skills:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchConfiguredSkills();
    }
  }, [token, fetchConfiguredSkills]);

  const handleConfigureSkills = async () => {
    try {
      const updatedCategories = categories.map(category => ({
        ...category,
        skills: typeof category.skills === 'string' ? category.skills.split(',').map(skill => skill.trim()) : category.skills
      }));
  
      await axios.put('http://localhost:5001/skills/configure', { categories: updatedCategories }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Skills configured successfully');
      fetchConfiguredSkills();
    } catch (error) {
      console.error('Error configuring skills:', error);
      alert('Error configuring skills');
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName && newCategorySkills) {
      const updatedCategories = [...categories, { name: newCategoryName, skills: newCategorySkills.split(',').map(skill => skill.trim()) }];
      try {
        await axios.put('http://localhost:5001/skills/configure', { categories: updatedCategories }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNewCategoryName('');
        setNewCategorySkills('');
        fetchConfiguredSkills();
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category');
      }
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await axios.delete(`http://localhost:5001/skills/configure/category/${categoryName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchConfiguredSkills();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleDeleteSkill = async (categoryName, skillName) => {
    try {
      await axios.delete(`http://localhost:5001/skills/configure/skill/${categoryName}/${skillName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchConfiguredSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Error deleting skill');
    }
  };

  return (
    <Container>
      <Title>Configure Skills</Title>
      <Form>
        <Input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category Name" />
        <Input type="text" value={newCategorySkills} onChange={(e) => setNewCategorySkills(e.target.value)} placeholder="Skills (comma separated)" />
        <Button type="button" onClick={handleAddCategory}>Add Category</Button>
        <Button type="button" onClick={handleConfigureSkills}>Configure Skills</Button>
      </Form>
      {categories.map((category, index) => (
        <SkillCategory key={index}>
          <Input type="text" value={category.name} readOnly />
          {category.skills.map(skill => (
            <SkillItem key={skill}>
              <span>{skill}</span>
              <DeleteButton onClick={() => handleDeleteSkill(category.name, skill)}>Delete Skill</DeleteButton>
            </SkillItem>
          ))}
          <DeleteButton onClick={() => handleDeleteCategory(category.name)}>Delete Category</DeleteButton>
        </SkillCategory>
      ))}
    </Container>
  );
};

export default ConfigureSkills;