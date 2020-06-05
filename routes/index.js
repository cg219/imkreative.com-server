const DateHelper = require('./../helpers/date');
const DataHelper = require('./../helpers/data');
const TagHelper = require('./../helpers/tag');
const validator = require('validator');
const credentials = require('./../credentials');

module.exports = (api, contentful) => {
    return {
        async index(ctx) {
            try {
                let posts = await api.posts.browse({
                    limit: 'all',
                    include: 'tags,authors',
                    fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
                });
                const dates = posts.map(post => DateHelper.format(post.published_at));
                const settings = await api.settings.browse();
                const owner = await api.authors.read({slug: 'mente'});
                const socials = await contentful.getEntries({ content_type: 'social' });

                ctx.body = {
                    posts: posts,
                    dates: dates,
                    options: {
                        logo: settings.logo,
                        nav: settings.navigation,
                        title: settings.title,
                        owner: owner,
                        socials
                    },
                };
            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async tags(ctx) {
            try {
                let posts = await api.posts.browse({
                    limit: 'all',
                    include: 'tags,authors',
                    fields: 'slug,title,feature_image,feature,published_at,custom_excerpt,primary_author',
                    filter: `tags.slug:[${ctx.params.tag}]`
                });

                const dates = posts.map(post => DateHelper.format(post.published_at));
                const settings = await api.settings.browse();
                const owner = await api.authors.read({slug: 'mente'});
                const socials = await contentful.getEntries({ content_type: 'social' });

                ctx.body = {
                    posts: posts,
                    dates: dates,
                    options: {
                        logo: settings.logo,
                        nav: settings.navigation,
                        title: settings.title,
                        owner: owner,
                        tag: ctx.params.tag,
                        socials
                    },
                };
            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async settings(ctx) {
            try {
                let settings = await api.settings.browse();

                ctx.body = settings;
            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async authors(ctx) {
            try {
                let authors = await api.authors.read({slug: 'mente'});

                ctx.body = authors;
            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async post(ctx) {
            try {
                let post = await api.posts.read({
                    include: 'tags,authors',
                    slug: ctx.params.slug
                });

                const date = DateHelper.format(post.published_at);
                const settings = await api.settings.browse();
                const owner = await api.authors.read({slug: 'mente'});
                const tags = post.tags.length > 0 ? `tags.slug:[${post.tags.map(tag => tag.slug)}],` : '';
                const authors = `authors.slug:[${post.primary_author.slug}]`;
                const socials = await contentful.getEntries({ content_type: 'social' });
                const related = await api.posts.browse({
                    limit: 4,
                    fields: 'slug,title,feature_image',
                    filter: `(${tags}${authors})+id:-${post.id}`
                });

                ctx.body = {
                    post: post,
                    title: post.title,
                    date: date,
                    options: {
                        logo: settings.logo,
                        nav: settings.navigation,
                        title: settings.title,
                        owner,
                        related,
                        socials
                    }
                };

            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async search(ctx) {
            try {
                let term = validator.trim(validator.blacklist(ctx.request.body.term, '\'\"+,()><=[]&{}'));
                let posts = await api.posts.browse({
                    limit: 'all',
                    include: 'tags,authors',
                    fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
                });
                const dates = posts.map(post => DateHelper.format(post.published_at));
                const settings = await api.settings.browse();
                const owner = await api.authors.read({slug: 'mente'});
                const socials = await contentful.getEntries({ content_type: 'social' });

                posts = posts.filter(post => (post.title.toLowerCase().indexOf(term.toLowerCase()) >= 0 || TagHelper.check(term, post.tags)) && post);

                ctx.body = {
                    posts: posts,
                    dates: dates,
                    options: {
                        logo: settings.logo,
                        nav: settings.navigation,
                        title: settings.title,
                        owner: owner,
                        socials
                    },
                };
            } catch (error) {
                ctx.body = { error, status: true }
            }
        },
        async portfolio(ctx) {
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
    }
};
