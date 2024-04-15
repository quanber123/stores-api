import { config } from 'dotenv';
config();
const whileList = [...process.env.ALLOW_WEBSITE.split(' ')];
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
