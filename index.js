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
const { getPosts, getTaggedPosts, getPost, search, getPortfolio, getSocials, getSettings } = require('./routes');

router.get('/api/posts', getPosts(api));
router.get('/api/socials', getSocials(contentful));
router.get('/api/settings', getSettings(api));
router.get('/api/post/:slug', getPost(api));
router.get('/api/tagged/:tag', getTaggedPosts(api));
router.get('/api/portfolio', getPortfolio(contentful));
router.post('/api/search', search(api));

app
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on: ${PORT}`);

module.exports = server;
