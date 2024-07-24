import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  margin: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const Th = styled.th`
  background-color: #333;
  color: #fff;
  padding: 10px;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 10px;
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;

  input, select, button {
    margin: 5px;
    padding: 10px;
  }
`;

const Button = styled.button`
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 15px;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
`;

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const { token } = useContext(AuthContext);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/employees', { name, email, password, role }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchEmployees();
      setName('');
      setEmail('');
      setPassword('');
      setRole('employee');
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async (id) => {
    try {
      await axios.put(`http://localhost:5001/users/${id}`, { role }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <Container>
      <Title>Manage Employees</Title>
      <Form onSubmit={handleAddEmployee}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit">Add Employee</Button>
      </Form>
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <Td>{employee.name}</Td>
              <Td>{employee.email}</Td>
              <Td>
                <select value={employee.role} onChange={(e) => setRole(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </Td>
              <Td>
                <Button onClick={() => handleUpdateEmployee(employee._id)}>Update</Button>
                <Button onClick={() => handleDeleteEmployee(employee._id)}>Delete</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageEmployees;