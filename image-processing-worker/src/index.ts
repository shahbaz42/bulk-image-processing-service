import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { PORT } from './config';

app
// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });
