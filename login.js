require('dotenv').config()
const axios = require('axios')
const puppeteer = require('puppeteer')
const loginEndpoint = process.env.LOGIN_ENDPOINT

const username = process.env.USERNAME
const password = process.env.PASSWORD

async function login () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Enable request interception
  await page.setRequestInterception(true)

  // Capture the bearer token from the request headers
  let bearerToken
  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.url().includes(loginEndpoint)) {
      interceptedRequest.continue()
    } else if (interceptedRequest.url().includes(carDetailsEndpoint)) {
      const headers = interceptedRequest.headers()
      bearerToken = headers.authorization
      interceptedRequest.continue()
    } else {
      interceptedRequest.continue()
    }
  })

  await page.goto('https://www.kdealer.com', { timeout: 0 }) // Set timeout to 0 for no timeout

  // Wait for the signInName element to be available
  await page.waitForSelector('#signInName', { timeout: 0 }) // Set timeout to 0 for no timeout

  // Fill in the login form
  await page.type('#signInName', username)
  await page.type('#password', password)

  // Submit the form
  await Promise.all([
    page.waitForNavigation({ timeout: 0 }), // Set timeout to 0 for no timeout
    page.evaluate(() => {
      const form = document.querySelector('#localAccountForm')
      form.submit()
    })
  ])

  // Wait for the token to be captured
  await page.waitForRequest((request) => request.url().includes(carDetailsEndpoint), { timeout: 0 }) // Set timeout to 0 for no timeout

  // Close the browser
  await browser.close()

  return bearerToken
}
