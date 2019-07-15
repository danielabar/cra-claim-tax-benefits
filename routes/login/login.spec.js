const request = require('supertest')
const session = require('supertest-session')
const cheerio = require('cheerio')
const app = require('../../app.js')

describe('Test /login responses', () => {
  //login page
  test('it redirects to /login/code from /login', async () => {
    const response = await request(app).get('/login')
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/login/code')
  })

  //login/code
  test('it returns a 200 response for /login/code', async () => {
    const response = await request(app).get('/login/code')
    expect(response.statusCode).toBe(200)
  })

  test('it renders the h1 text for /login/code', async () => {
    const response = await request(app).get('/login/code')

    const $ = cheerio.load(response.text)
    expect($('h1').text()).toEqual('Enter your personal access code')
  })

  test('it returns a 500 response if no redirect is provided', async () => {
    const response = await request(app).post('/login/code')
    expect(response.statusCode).toBe(500)
  })

  test('it reloads /login/code with a 422 status if no code is provided', async () => {
    const response = await request(app)
      .post('/login/code')
      .send({ redirect: '/' })
    expect(response.statusCode).toBe(422)
  })

  describe('Error list tests', () => {
    test('it renders the error-list for /login/code', async () => {
      const response = await request(app)
        .post('/login/code')
        .send({ redirect: '/' })
      const $ = cheerio.load(response.text)
      expect($('title').text()).toMatch(/^Error:/)
      expect($('.error-list__header').text()).toEqual('Please correct the errors on the page')
      expect($('.error-list__list').children()).toHaveLength(1)
      expect($('.validation-message').text()).toEqual('Error: Access code must be 8 characters')
      expect($('#code').attr('aria-describedby')).toEqual('code-error')
    })

    test('it renders an inline error for /login/code with appropriate describedby', async () => {
      const response = await request(app)
        .post('/login/code')
        .send({ redirect: '/' })
      const $ = cheerio.load(response.text)
      expect($('.validation-message').text()).toEqual('Error: Access code must be 8 characters')
      expect($('#code').attr('aria-describedby')).toEqual('code-error')
    })
  })

  test('it does not allow a code more than 8 characters', async () => {
    const response = await request(app)
      .post('/login/code')
      .send({ code: 'A23XGY12111', redirect: '/' })
    expect(response.statusCode).toBe(422)
  })

  test('it does not allow a code less than 8 characters', async () => {
    const response = await request(app)
      .post('/login/code')
      .send({ code: 'A23X', redirect: '/' })
    expect(response.statusCode).toBe(422)
  })

  test('it does not allow non-alphanumeric characters', async () => {
    const response = await request(app)
      .post('/login/code')
      .send({ code: 'A23X456@', redirect: '/' })
    expect(response.statusCode).toBe(422)
  })

  const codes = ['QWER1234', 'qwer1234']
  codes.map(code => {
    test(`it redirects if a valid code is provided: "${code}"`, async () => {
      const response = await request(app)
        .post('/login/code')
        .send({ code, redirect: '/' })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual('/')
    })
  })

  test('it does not allow non-numeric characters', async () => {
    const response = await request(app)
      .post('/login/code')
      .send({ code: 'A23X456@1', redirect: '/' })
    expect(response.statusCode).toBe(422)
  })

  describe('Test /login/sin responses', () => {
    // Social Insurance Number Page /login/sin
    test('it returns a 200 response for /login/sin', async () => {
      const response = await request(app).get('/login/sin')
      expect(response.statusCode).toBe(200)
    })

    test('it renders the h1 text for /login/sin', async () => {
      const response = await request(app).get('/login/sin')

      const $ = cheerio.load(response.text)
      expect($('h1').text()).toEqual('Enter your Social Insurance Number (SIN)')
    })

    test('it returns a 500 response if no redirect is provided', async () => {
      const response = await request(app).post('/login/sin')
      expect(response.statusCode).toBe(500)
    })

    test('it reloads /login/sin with a 422 status if no sin is provided', async () => {
      const response = await request(app)
        .post('/login/sin')
        .send({ redirect: '/' })
      expect(response.statusCode).toBe(422)
      const $ = cheerio.load(response.text)
      expect($('title').text()).toMatch(/^Error:/)
      expect($('.error-list__header').text()).toEqual('Please correct the errors on the page')
      expect($('.error-list__list').children()).toHaveLength(1)
      expect($('.validation-message').text()).toEqual('Error: Your SIN should have 9 numbers')
      expect($('#sin').attr('aria-describedby')).toEqual('sin-error')
    })

    describe('Error list tests', () => {
      test('it renders the error-list for /login/sin', async () => {
        const response = await request(app)
          .post('/login/sin')
          .send({ redirect: '/' })
        const $ = cheerio.load(response.text)
        expect($('title').text()).toMatch(/^Error:/)
        expect($('.error-list__header').text()).toEqual('Please correct the errors on the page')
        expect($('.error-list__list').children()).toHaveLength(1)
        expect($('.validation-message').text()).toEqual('Error: Your SIN should have 9 numbers')
        expect($('#sin').attr('aria-describedby')).toEqual('sin-error')
      })
    })

    test('it does not allow a code more than 9 characters', async () => {
      const response = await request(app)
        .post('/login/sin')
        .send({ code: '12345678910', redirect: '/' })
      expect(response.statusCode).toBe(422)
    })

    test('it does not allow a code less than 9 characters', async () => {
      const response = await request(app)
        .post('/login/sin')
        .send({ code: '12345678', redirect: '/' })
      expect(response.statusCode).toBe(422)
    })

    /*
      These tests make sure that a SIN which would ordinarily be
      accepted (ie, "123456789") is no longer accepted after
      a user logs in.

      After that, only the sin used by the user in /api/user.json
      will be accepted.
    */
    describe('after entering an access code', () => {
      let authSession

      beforeEach(async () => {
        authSession = session(app)
        const response = await authSession
          .post('/login/code')
          .send({ code: 'QWER1234', redirect: '/login/sin' })
        expect(response.statusCode).toBe(302)
      })

      it('it should return 422 for the wrong SIN', async () => {
        const response = await authSession
          .post('/login/sin')
          .send({ sin: '123456789', redirect: '/login/sin' })
        expect(response.statusCode).toBe(422)
      })

      it('it should return 302 for the right SIN', async () => {
        const response = await authSession
          .post('/login/sin')
          .send({ sin: '111 222 333', redirect: '/login/sin' })
        expect(response.statusCode).toBe(302)
      })
    })
  })

  //it returns a 200 response for /login/dateOfBirth
  //access code test (look above for sin)

  describe('Test login/dateOfBirth responses', () => {
    test('it returns a 200 response for /login/dateOfBirth', async () => {
      const response = await request(app).get('/login/dateOfBirth')
      expect(response.statusCode).toBe(200)
    })

    let goodDoBRequest = {
      dateOfBirth: '1909/03/22',
      sin: '111222333',
      redirect: '/login/success',
    }

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const day = currentDate.getDate()

    const dateToString = dateInput => {
      const add0 = s => {
        return s < 10 ? '0' + s : s
      }
      const d = new Date(dateInput)
      return [d.getFullYear(), add0(d.getMonth() + 1), add0(d.getDate())].join('/')
    }

    const fewMonthsAgo = dateToString(new Date(year, month - 3, day))

    const tooLongAgo = dateToString(new Date(year - 201, month, day))

    const badDoBRequests = [
      {
        label: 'no date of birth',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '' },
        },
      },
      {
        label: 'date of birth over 10 characters',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/03/222' },
        },
      },
      {
        label: 'date of birth less than 10 characters',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/03/2' },
        },
      },
      {
        label: 'date of birth includes not allowed characters',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/03/ee' },
        },
      },
      {
        label: 'date of birth month is less than 1',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/00/22' },
        },
      },
      {
        label: 'date of birth month is greater than 12',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/13/22' },
        },
      },
      {
        label: 'date of birth day is less than 1',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '1909/01/00' },
        },
      },
      {
        label: 'date of birth day is greater than in that month',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: '2017/02/29' },
        },
      },
      {
        label: 'date of birth is less than a year ago',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: fewMonthsAgo },
        },
      },
      {
        label: 'date of birth is more than 200 years ago',
        send: {
          ...goodDoBRequest,
          ...{ dateOfBirth: tooLongAgo },
        },
      },
    ]

    badDoBRequests.map(badRequest => {
      test(`it returns a 422 with: "${badRequest.label}"`, async () => {
        const response = await request(app)
          .post('/login/dateOfBirth')
          .send(badRequest.send)
        expect(response.statusCode).toBe(422)
      })
    })

    test('it returns a 302 with valid dob', async () => {
      const response = await request(app)
        .post('/login/dateOfBirth')
        .send(goodDoBRequest)
      expect(response.statusCode).toBe(302)
    })
  })

  // Success page
  test('it returns a 200 response for /login/success', async () => {
    const response = await request(app).get('/login/success')
    expect(response.statusCode).toBe(200)
  })

  /*
      These tests make sure that a date of birth which would ordinarily be is no longer accepted after
      a user logs in.

      After that, only the date of birth corressponding to the user in /api/user.json
      will be accepted.
    */
  describe('after entering an access code', () => {
    let authSession

    beforeEach(async () => {
      authSession = session(app)
      const response = await authSession
        .post('/login/code')
        .send({ code: 'QWER1234', redirect: '/login/sin' })
        .then(() => {
          return authSession
            .post('/login/sin')
            .send({ code: 'QWER1234', sin: '111222333', redirect: '/login/dateOfBirth' })
        })
      expect(response.statusCode).toBe(302)
    })

    it('it should return 422 for the wrong DoB', async () => {
      const response = await authSession
        .post('/login/dateOfBirth')
        .send({ dateOfBirth: '1909/03/23', redirect: '/login/success' })
      expect(response.statusCode).toBe(422)
    })

    it('it should return 302 for the right DoB', async () => {
      const response = await authSession
        .post('/login/dateOfBirth')
        .send({ dateOfBirth: '1909/03/22', redirect: '/login/success' })
      expect(response.statusCode).toBe(302)
    })
  })

  describe('Test /login/auth responses', () => {
    test('it returns a 200 response for /login/auth', async () => {
      const response = await request(app).get('/login/auth')
      expect(response.statusCode).toBe(200)
    })
  })
})
