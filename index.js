const Sentry = require("@sentry/node");
const Apm = require("@sentry/apm");
const express = require("express");
const app = express();
const port = 3000

Sentry.init({
  dsn: "[project DSN]",
  integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Apm.Integrations.Express({ app })
  ],
  tracesSampleRate: 1
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// the rest of your app
app.use(Sentry.Handlers.errorHandler());

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/transaction', (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'sentry_express_transaction1',
    name: 'sentry_express_transaction1_name',
  });
  res.send('Hello Transaction!')
  transaction.finish();
  Sentry.captureException(new Error(`Test Capture - ${Date.now()}`));
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
