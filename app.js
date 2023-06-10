DATABASE_URL="mongodb+srv://rami:k20409200@todolist.rq1azor.mongodb.net/";

const express = require('express');
const app = express();

const cors = require('cors');
const helmet = require('helmet')
app.use(cors());
app.use(helmet())

const mongoose = require('mongoose');
mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Databse connected'))

app.use(express.json())

const ticketsRouter = require('./routes/tickets')
app.use('/tickets', ticketsRouter)

const categoryRouter = require('./routes/categories')
app.use('/categories', categoryRouter)

const port = 3000; 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
