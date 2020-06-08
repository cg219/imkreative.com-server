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
})

describe('Test Tagged Posts', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/posts');
        slug = response.body.posts[0].tags[0].slug;
        response = await request(app).get(`/api/tagged/${slug}`);
    })

    test('check if posts return truthy', () => {
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

describe('Test Socials', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/socials');
    })

    test('check if socials completes', () => {
        expect(response.body).toHaveProperty('socials');
    })
})

describe('Test Settings', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/settings');
    })

    test('check if settings completes', () => {
        expect(response.body).not.toHaveProperty('error');
    })
})
