const credentials = require('./credentials');
const GhostAPI = require('@tryghost/content-api');
const ContentfulAPI = require('contentful');
const Koa = require('koa');
const KoaRouter = require('@koa/router');
const KoaServe = require('koa-static');
const KoaBody = require('koa-bodyparser');
const KoaJSON = require('koa-json');
const path = require('path');
const PORT = process.env.PORT || 3000;
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
const { getPosts, getTags, getPost, search, getPortfolio } = require('./routes');

router.get('/api/posts', getPosts(api, contentful));
router.get('/api/post/:slug', getPost(api, contentful));
router.get('/api/tags/:tag', getTags(api, contentful));
router.get('/api/portfolio', getPortfolio(api, contentful));
router.post('/api/search', search(api, contentful));

app
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on: ${PORT}`);

module.exports = server;
