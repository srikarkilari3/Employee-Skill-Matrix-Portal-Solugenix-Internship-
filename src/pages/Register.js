// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from '../IMG_5667.JPG'; // Adjust the path as needed
import groupImage from '../IMG_5667.JPG'; // Adjust the path to the new group image

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${backgroundImage}) no-repeat center center;
  background-size: cover;
`;

const FormContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1.5rem;
`;

const InputContainer = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #555;
  }
`;

const Error = styled.p`
  color: red;
`;

const GroupImage = styled.img`
  width: 100%;
  max-width: 400px;
  margin-bottom: 2rem;
`;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/users/register', { name, email, password, role });
      setError(''); // Clear error message
      alert('User registered successfully');
    } catch (err) {
      setError('Registration failed. Please check your input.');
    }
  };

  return (
    <Container>
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <GroupImage src={groupImage} alt="Group" />
          <Title>Register</Title>
          <InputContainer>
            <Label>Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputContainer>
          <InputContainer>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputContainer>
          <InputContainer>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputContainer>
          <InputContainer>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Select>
          </InputContainer>
          <Button type="submit">Register</Button>
          {error && <Error>{error}</Error>}
        </Form>
      </FormContainer>
    </Container>
  );
};

export default Register;