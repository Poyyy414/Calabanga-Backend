const express = require('express');
const bodyParser = require('body-parser');

//routes here
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

app.get('/', function(req, res) {
  res.send("John Paul Cambiado");

});

//Endpoit Here
app.use('/api/auth',authRoutes);
app.use('./api/user',userRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});