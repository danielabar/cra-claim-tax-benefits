const loginSchema = {
    code: {
      isLength: {
        errorMessage: 'Must be 8 characters',
        options: { min: 8, max: 8 }
      },
    },
  }

  module.exports = {
    loginSchema
  }