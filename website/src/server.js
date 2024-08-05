const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
require('./config');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 'loopback');
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './views'));

require('./middlewares/middlewares')(app);
require('./routes/routes')(app);

mongoose.set('strictQuery', true);
mongoose
   .connect(process.env.DB_CONNECTION)
   .then(() => {
      console.log('Successfully connected to MongoDB.');
      app.listen(port, () => console.log(`Listening on port ${port}...`));
   })
   .catch(err => console.log('An error occurred while connecting to MongoDB', err));
