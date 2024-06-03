import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import directionsRoute from './routes/directionsRoute.js';
import authRoute from './routes/auth.js';
import busTimesRoute from './routes/busTimesRoutes.js';
import { sequelize } from './db/schema.js';

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use('/directions', directionsRoute);
app.use('/auth', authRoute);
app.use('/bus-times', busTimesRoute);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
