// src/pages/Login.js
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import image from '../IMG_5667.JPG';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #FFFFFF;
`;

const Image = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  text-align: center;
`;

const LoginForm = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Subtitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: white;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error handling is already managed in the login function within AuthContext
    }
  };

  return (
    <Container>
      <Title>Employee Skill Matrix Portal</Title>
      <Image src={image} alt="Group of people" />
      <LoginForm>
        <Subtitle>Login</Subtitle>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email:</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <Label>Password:</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>
          <Button type="submit">Login</Button>
        </form>
      </LoginForm>
    </Container>
  );
};

export default Login;