const express = require('express');
const cors = require('cors');
const cron = require('cron');
const fileupload = require('express-fileupload');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback')
const path = require('path');

const { initialMongoConnection } = require('./utils/mongoose');

const routerExcel = require('./routers/excel.router');
const routerFilter = require('./routers/filter.router');
const routerMs = require('./routers/ms.router');
const routerBoxBerry = require('./routers/boxberry.router');

const { updateListPointBoxberry } = require('./services/points.service');

require('dotenv').config();
initialMongoConnection();

const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.IS_PRODUCTION == 'true';

const app = express();

if (IS_PRODUCTION) {
    console.log('PROD...');
    app.use(history())
    app.use(serveStatic(path.resolve(__dirname, 'client')))
} else {
    console.log('DEV ...');
    app.use(cors({ origin: "*" }));
}

app.use(express.json());
app.use(fileupload());
app.use('/excel', routerExcel);
app.use('/filters', routerFilter);
app.use('/ms', routerMs);
app.use('/boxberry', routerBoxBerry);

const job = new cron.CronJob(
    '0 */2 * * *',
    updateListPointBoxberry
);



app.listen(PORT, async () => {
    console.log(`server started on port ${PORT}`);
    await updateListPointBoxberry();
    job.start();
});