const whileList = ['http://localhost:5173'];
const corsOptions = {
  origin: (origin, cb) => {
    if (whileList.indexOf(origin) !== -1 || !origin) {
      cb(null, true);
    } else {
      cb(new Error('Not Allowed By CORS!'));
    }
  },
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};

export default corsOptions;
