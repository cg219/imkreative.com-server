const request = require('supertest');
const app = require('./../index');
let response;
let slug;

beforeAll(() => console.log('Testing Started'));
afterAll(() => {
    app.close();
    console.log('Testing Completed');
});

describe('Test All Posts', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/posts');
    })

    test('check if posts exists', () => {
        expect(response.body).toHaveProperty('posts');
    })

    test('check if dates exists', () => {
        expect(response.body).toHaveProperty('dates');
    })

    test('check if options exists', () => {
        expect(response.body).toHaveProperty('options');
    })
})

describe('Test Tags', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/posts');
        slug = response.body.posts[0].tags[0].slug;
        response = await request(app).get(`/api/tags/${slug}`);
    })

    test('check if tags return truthy', () => {
        expect(response.body).toHaveProperty('posts');
    })
})

describe('Test Single Post', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/posts');
        slug = response.body.posts[0].slug;
        response = await request(app).get(`/api/post/${slug}`);
    })

    test('check if post returns truthy', () => {
        expect(response.body).toHaveProperty('post');
    })
})

describe('Test Search', () => {

    beforeAll(async () => {
        response = await request(app).post('/api/search').send({ term: 'welcome' });
    })

    test('check if search completes', () => {
        expect(response.body).toHaveProperty('posts');
    })
})

describe('Test Portfolio', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/portfolio');
    })

    test('check if portfolio completes', () => {
        expect(response.body).toHaveProperty('items');
    })
})
