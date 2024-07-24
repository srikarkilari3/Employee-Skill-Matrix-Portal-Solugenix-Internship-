
import React, { useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import welcomeImage from '../pages/Home.jpeg'; // Ensure the path is correct

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fff;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
`;

const Image = styled.img`
  width: 80%;
  max-width: 600px;
  margin-top: 2rem;
`;

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <PageContainer>
      <Container>
        {user ? (
          <>
            <Title>Hi {user.name}!</Title>
            <Subtitle>Have a nice day</Subtitle>
          </>
        ) : (
          <>
            <Title>Welcome to the Employee Skill Matrix Portal</Title>
            <Subtitle>Please login or register to continue.</Subtitle>
          </>
        )}
        <Image src={welcomeImage} alt="Welcome" />
      </Container>
    </PageContainer>
  );
};

export default Home;