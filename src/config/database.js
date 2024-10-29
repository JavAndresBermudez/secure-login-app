// En un entorno real, esto sería una conexión a una base de datos
const users = [
  {
    id: 1,
    username: 'admin',
    // En producción, esta contraseña debería estar hasheada
    password: 'admin123'
  }
];

module.exports = {
  findUser: (username, password) => {
    return users.find(u => u.username === username && u.password === password);
  }
};
