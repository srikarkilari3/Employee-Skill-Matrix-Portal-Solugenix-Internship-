import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Item = styled.div`
  flex: 1;
  margin: 10px;
  padding: 20px;
  background-color: #f0f0f0;
  text-align: center;

  @media (max-width: 768px) {
    margin: 5px 0;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;

  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

export const Th = styled.th`
  border: 1px solid #000;
  padding: 10px;
  background-color: #ddd;
  color: #000;
  font-weight: bold;
`;

export const Td = styled.td`
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
`;