const credentials = require('./credentials');
const GhostAPI = require('@tryghost/content-api');
const ContentfulAPI = require('contentful');
const Koa = require('koa');
const KoaRouter = require('@koa/router');
const KoaServe = require('koa-static');
const KoaBody = require('koa-bodyparser');
const KoaJSON = require('koa-json');
const path = require('path');
const app = new Koa();
const router = new KoaRouter();
const api = new GhostAPI({
    url: credentials.GHOST_URL,
    key: credentials.GHOST_KEY,
    version: credentials.GHOST_VERSION
});
const contentful = ContentfulAPI.createClient({
    space: credentials.CONTENTFUL_SPACE,
    accessToken: credentials.CONTENTFUL_ACCESS_TOKEN
});
const Routes = require('./routes/index')(api, contentful);
const PORT = process.env.PORT || 3000;
const IP = process.env.IP || 'localhost';

router.get('/api/posts', Routes.index);
router.get('/api/read/:slug', Routes.post);
router.get('/api/tags/:tag', Routes.tags);
router.get('/api/settings', Routes.settings);
router.get('/api/portfolio', Routes.portfolio);
router.post('/api/search', Routes.search);

app
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, IP);

console.log(`Running on: ${IP}:${PORT}`);
