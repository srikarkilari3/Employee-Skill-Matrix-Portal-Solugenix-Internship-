import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';


const SkillMatrixContainer = styled.div`
  margin: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: #333;
  font-size: 2.5rem;
`;

const CategorySelector = styled.div`
  margin-bottom: 2rem;
`;

const FilterContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 10px; /* Add spacing between cells */
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px; /* Add border-radius for the table */
`;

const Th = styled.th`
  border: 1px solid #000;
  padding: 10px;
  background-color: #ddd;
  color: #000;
  font-weight: bold;
  border-radius: 8px; /* Add border-radius for the th elements */
`;

const Td = styled.td`
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
  background-color: ${({ proficiency }) => {
    switch (proficiency) {
      case 1:
        return '#C1DBB8';
      case 2:
        return '#A2CA95';
      case 3:
        return '#44942B';
      case 0:
        return '#F5F5F5';
      default:
        return '#f4f4f4';
    }
  }};
  color: ${({ proficiency }) => {
    switch (proficiency) {
      case 1:
      case 3:
        return 'black';
      case 2:
        return 'black';
      case 0:
        return 'red';
      default:
        return 'black';
    }
  }};
  border-radius: 8px; /* Add border-radius for the td elements */
`;

const TdName = styled.td`
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
  background-color: #ddd;
  color: black;
  border-radius: 8px; /* Add border-radius for the tdName elements */
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  margin: 1rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #333;
  color: white;
  &:hover {
    background-color: #555;
  }
`;

const SkillMatrix = () => {
  const [skillMatrix, setSkillMatrix] = useState([]);
  const [configuredCategories, setConfiguredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterSkillLevel, setFilterSkillLevel] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const { token } = useContext(AuthContext);

  const fetchSkillMatrix = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/skill-matrix', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSkillMatrix(response.data);
    } catch (error) {
      console.error('Error fetching skill matrix:', error);
    }
  }, [token]);

  const fetchConfiguredSkills = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/skills/configured', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setConfiguredCategories(response.data.categories);
      if (response.data.categories.length > 0) {
        setSelectedCategory(response.data.categories[0].name);
      }
    } catch (error) {
      console.error('Error fetching configured skills:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSkillMatrix();
      fetchConfiguredSkills();
    }
  }, [token, fetchSkillMatrix, fetchConfiguredSkills]);

  const renderSkills = (userSkills) => {
    const category = configuredCategories.find(cat => cat.name === selectedCategory);
    if (!category) return null;
    return category.skills.map(skill => {
      const userSkill = userSkills.find(us => us.name === skill);
      const proficiency = userSkill ? userSkill.proficiency : 0;
      return (
        <Td key={skill} proficiency={proficiency}>
          {userSkill ? userSkill.proficiency : '❌'}
        </Td>
      );
    });
  };

  const generateReport = async (format) => {
    try {
      const url = format === 'pdf' ? 'http://localhost:5001/api/reports/pdf' : 'http://localhost:5001/api/reports';
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          skill: filterSkill,
          skillLevel: filterSkillLevel,
          employee: filterEmployee
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `skill-matrix.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const categorySkills = configuredCategories.find(cat => cat.name === selectedCategory)?.skills || [];

  return (
    <SkillMatrixContainer>
      <Title>Skill Matrix</Title>
      <CategorySelector>
        <label>Select Category: </label>
        <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {configuredCategories.map(category => (
            <option key={category.name} value={category.name}>{category.name}</option>
          ))}
        </Select>
      </CategorySelector>
      <FilterContainer>
        <div>
          <label>Filter by Skill: </label>
          <Select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
            <option value="">Select Skill</option>
            {categorySkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </Select>
        </div>
        <div>
          <label>Filter by Skill Level: </label>
          <Select value={filterSkillLevel} onChange={(e) => setFilterSkillLevel(e.target.value)}>
            <option value="">Select Level</option>
            <option value="1">Beginner</option>
            <option value="2">Proficient</option>
            <option value="3">Expert</option>
          </Select>
        </div>
        <div>
          <label>Filter by Employee: </label>
          <Input type="text" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} placeholder="Employee Name" />
        </div>
      </FilterContainer>
      <Table>
        <thead>
          <tr>
            <Th>Employee Name</Th>
            {categorySkills.map(skill => (
              <Th key={skill}>{skill}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skillMatrix.map(user => (
            <tr key={user.name}>
              <TdName>{user.name}</TdName>
              {renderSkills(user.skills)}
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button onClick={() => generateReport('csv')}>Generate CSV Report</Button>
        <Button onClick={() => generateReport('pdf')}>Generate PDF Report</Button>
      </div>
    </SkillMatrixContainer>
  );
};

export default SkillMatrix;