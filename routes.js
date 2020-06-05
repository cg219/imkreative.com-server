const DateHelper = require('./helpers/date');
const DataHelper = require('./helpers/data');
const TagHelper = require('./helpers/tag');
const validator = require('validator');
const credentials = require('./credentials');

const getMetadata = async function(posts, api, contentful) {
    const dates = posts.length > 0 ? posts.map(post => DateHelper.format(post.published_at)) : DateHelper.format(posts.published_at);
    const settings = await api.settings.browse();
    const owner = await api.authors.read({slug: 'mente'});
    const socials = await contentful.getEntries({ content_type: 'social' });

    return { dates, settings, owner, socials };
}

exports.getPosts = (api, contentful) => (
    async function(ctx) {
        try {
            let posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
            });

            const metadata = await getMetadata(posts, api, contentful);

            ctx.body = {
                posts: posts,
                dates: metadata.dates,
                options: {
                    logo: metadata.settings.logo,
                    nav: metadata.settings.navigation,
                    title: metadata.settings.title,
                    owner: metadata.owner,
                    socials: metadata.socials
                },
            };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getTags = (api, contenful) => (
    async function(ctx) {
        try {
            let posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,feature_image,feature,published_at,custom_excerpt,primary_author',
                filter: `tags.slug:[${ctx.params.tag}]`
            });

            const metadata = await getMetadata(posts, api, contenful);

            ctx.body = {
                posts: posts,
                dates: metadata.dates,
                options: {
                    logo: metadata.settings.logo,
                    nav: metadata.settings.navigation,
                    title: metadata.settings.title,
                    owner: metadata.owner,
                    tag: ctx.params.tag,
                    socials: metadata.socials
                },
            };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getSettings = (api) => (
    async function(ctx) {
        try {
            let settings = await api.settings.browse();

            ctx.body = settings;
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getAuthors = (api) => (
    async function(ctx) {
        try {
            let authors = await api.authors.read({slug: 'mente'});

            ctx.body = authors;
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getPost = (api, contentful) => (
    async function(ctx) {
        try {
            let post = await api.posts.read({
                include: 'tags,authors',
                slug: ctx.params.slug
            });

            const metadata = await getMetadata(post, api, contentful);
            const tags = post.tags.length > 0 ? `tags.slug:[${post.tags.map(tag => tag.slug)}],` : '';
            const authors = `authors.slug:[${post.primary_author.slug}]`;
            const related = await api.posts.browse({
                limit: 4,
                fields: 'slug,title,feature_image',
                filter: `(${tags}${authors})+id:-${post.id}`
            });

            ctx.body = {
                post: post,
                title: post.title,
                date: metadata.dates,
                options: {
                    logo: metadata.settings.logo,
                    nav: metadata.settings.navigation,
                    title: metadata.settings.title,
                    owner: metadata.owner,
                    related,
                    socials: metadata.socials
                }
            };

        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.search = (api, contentful) => (
    async function(ctx) {
        try {
            let term = validator.trim(validator.blacklist(ctx.request.body.term, '\'\"+,()><=[]&{}'));
            let posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
            });
            const metadata = await getMetadata(posts);

            posts = posts.filter(post => (post.title.toLowerCase().indexOf(term.toLowerCase()) >= 0 || TagHelper.check(term, post.tags)) && post);

            ctx.body = {
                posts: posts,
                dates: metadata.dates,
                options: {
                    logo: metadata.settings.logo,
                    nav: metadata.settings.navigation,
                    title: metadata.settings.title,
                    owner: metadata.owner,
                    socials: metadata.socials
                },
            };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getPortfolio = (api, contentful) => (
    async function(ctx) {
        try {
            let entries = await contentful.getEntries({
                content_type: 'site',
                order: '-fields.date'
            });
            const settings = await api.settings.browse();
            const updatedItems = entries.items.map( site => DataHelper.transform(site, {DateHelper}));

            ctx.body = {
                items: updatedItems,
                options: {
                    logo: settings.logo,
                    nav: settings.navigation,
                    title: settings.title,
                    images: credentials.CONTENTFUL_IMAGES
                },
            };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)
