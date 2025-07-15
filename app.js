const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const touristRoutes = require('./routes/touristRoutes');
const barangayRoutes = require('./routes/barangayRoutes');
const residentRoutes = require('./routes/residentRoutes');
const business_ownerRoutes = require('./routes/business_ownerRoutes');
const businessRoutes = require('./routes/businessRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("John Paul Cambiado");
});

// Endpoint routes
app.use('/api/auth', authRoutes);
app.use('/api/tourist', touristRoutes); 
app.use('/api/barangay', barangayRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/business_owner', business_ownerRoutes);
app.use('/api/business', businessRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
