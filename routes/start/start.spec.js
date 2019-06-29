const request = require('supertest')
const cheerio = require('cheerio')
const app = require('../../app.js')

describe('Test server responses', () => {
  test('it should redirect to /start for the root path', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/start')
  })

  test('it should show the h1 for the /start path', async () => {
    const response = await request(app).get('/start')
    expect(response.statusCode).toBe(200)

    const $ = cheerio.load(response.text)
    expect($('h1').text()).toEqual('Claim tax benefits')
  })

  test('it should return security-focused headers in reponses', async () => {
    const response = await request(app).get('/start')

    /*
      More documentaion on each of these can be found here:
      - https://helmetjs.github.io/docs/
    */
    expect(response.headers['x-dns-prefetch-control']).toEqual('off')
    expect(response.headers['x-frame-options']).toEqual('SAMEORIGIN')
    expect(response.headers['strict-transport-security']).toEqual(
      'max-age=15552000; includeSubDomains',
    )
    expect(response.headers['x-download-options']).toEqual('noopen')
    expect(response.headers['x-content-type-options']).toEqual('nosniff')
    expect(response.headers['x-xss-protection']).toEqual('1; mode=block')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})