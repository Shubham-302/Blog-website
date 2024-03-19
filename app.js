const express = require('express');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const multer = require('multer');
const http = require('http');
const initSocket = require('./socket'); // Update the path accordingly

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

initSocket(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

app.engine(
  'hbs',
  exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    allowProtoMethodsByDefault: true,
  })
);

app.set('view engine', 'hbs');
app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);


app.get('/blog', (req, res) => {
  res.render('home', { user: req.session.user });
});

mongoose.connect('mongodb://127.0.0.1:27017/St2')
  .then(() =>
    server.listen(4000, () => {
      console.log('Server started at port: 4000');
    })
  )
  .catch((error) => console.error(error));
