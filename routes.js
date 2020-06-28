const validator = require('validator');
const credentials = require('./credentials');
const { formatDate, seasonizeDate, checkTag, appendFormattedDates } = require('./helpers');

exports.getSocials = (contentful) => (
    async function(ctx) {
        try {
            const rawData = await contentful.getEntries({ content_type: 'social' });
            const socials = rawData.items.map(data => {
                return {
                    name: data.fields.name,
                    url: data.fields.link
                }
            })

            ctx.body = { socials };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getSettings = (api) => (
    async function(ctx) {
        try {
            const rawSettings = await api.settings.browse();
            const rawOwner = await api.authors.read({slug: 'mente'});

            ctx.body = {
                title: rawSettings.title,
                description: rawSettings.description,
                logo: rawSettings.logo,
                facebook: rawSettings.facebook,
                twitter: rawSettings.twitter,
                url: credentials.FRONTEND_URL,
                owner: {
                    slug: rawOwner.slug,
                    name: rawOwner.name,
                    profile_image: rawOwner.profile_image,
                    cover_image: rawOwner.cover_image,
                    bio: rawOwner.bio,
                    facebook: rawOwner.facebook,
                    twitter: rawOwner.twitter,
                    website: rawOwner.website
                }
            }
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getPost = (api) => (
    async function(ctx) {
        try {
            let post = await api.posts.read({
                include: 'tags,authors',
                slug: ctx.params.slug
            });

            const tags = post.tags.length > 0 ? `tags.slug:[${post.tags.map(tag => tag.slug)}],` : '';
            const authors = `authors.slug:[${post.primary_author.slug}]`;
            const related = await api.posts.browse({
                limit: 4,
                fields: 'slug,title,feature_image',
                filter: `(${tags}${authors})+id:-${post.id}`
            });

            const updatedPost = {
                ...post,
                formatted_date: formatDate(post.published_at),
                related
            }

            ctx.body = { post: updatedPost };

        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getPosts = (api) => (
    async function(ctx) {
        try {
            const posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
            });

            const updatedPosts = await appendFormattedDates(posts);

            ctx.body = { posts: updatedPosts };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getTaggedPosts = (api) => (
    async function(ctx) {
        try {
            let posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,feature_image,feature,published_at,custom_excerpt,primary_author',
                filter: `tags.slug:[${ctx.params.tag}]`
            });

            const updatedPosts = await appendFormattedDates(posts);

            ctx.body = { posts: updatedPosts };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.search = (api) => (
    async function(ctx) {
        try {
            const term = validator.trim(validator.blacklist(ctx.request.body.term, '\'\"+,()><=[]&{}'));
            const posts = await api.posts.browse({
                limit: 'all',
                include: 'tags,authors',
                fields: 'slug,title,meta_title,meta_description,feature_image,feature,published_at,custom_excerpt,primary_author,primary_tag'
            });

            const updatedPosts = posts.filter(post => (post.title.toLowerCase().indexOf(term.toLowerCase()) >= 0 || checkTag(term, post.tags)) && post);
            const finalPosts = updatedPosts.map(post => {
                return {
                    ...post,
                    formatted_date: formatDate(post.published_at)
                }
            })

            ctx.body = { posts: finalPosts };
        } catch (error) {
            ctx.body = { error, status: true }
        }
    }
)

exports.getPortfolio = (contentful) => (
    async function(ctx) {
        try {
            const entries = await contentful.getEntries({
                content_type: 'site',
                order: '-fields.date'
            });
            const updatedItems = entries.items.map(site => {
                return {
                    ...site.fields,
                    formatted_date: seasonizeDate(site.fields.date),
                    thumbnail: {
                        url: site.fields.thumbnail.fields.file.url,
                        filename: site.fields.thumbnail.fields.file.fileName
                    }
                };

            });

            ctx.body = { items: updatedItems };
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
