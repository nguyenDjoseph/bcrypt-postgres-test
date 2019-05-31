const app = require('express')();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
  /* eslint-disable global-require */
  require('dotenv').config();
  /* eslint-enable global-require */
}

const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  post: process.env.PORT
});

client.connect();

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
};

app.post('/api/v1/create/', async (req, res) => {
  const userName = req.body.username;
  const hashedPw = await hashPassword(req.body.password);

  const values = [userName, hashedPw];
  client.query(
    'INSERT INTO users(username,password) VALUES($1, $2) RETURNING *',
    values,
    (err, response) => {
      console.log(response.rows);
      res.status(200).json('completed');
    }
  );
});

app.listen(8080, () => console.log('Express server is running on localhost:8080'));
