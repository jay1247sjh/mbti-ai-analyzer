import { app } from './app.js';

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`MBTI API running on http://localhost:${port}`);
});
