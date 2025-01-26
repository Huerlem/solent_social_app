// components/Error.js
function Error({ message }) {
    return (
      <div style={{ color: 'red', margin: '10px 0' }}>
        <p>Erro: {message}</p>
      </div>
    );
  }
  
  export default Error;