import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #FFFFFF;
  }

  a {
    text-decoration: none;
    color: #007bff;
  }
`;

export default GlobalStyle;