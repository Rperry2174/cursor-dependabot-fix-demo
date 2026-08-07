import { createApp } from './app';
import { info } from './utils/logging';

const port = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(port, () => {
  info(`listening on :${port}`);
});
