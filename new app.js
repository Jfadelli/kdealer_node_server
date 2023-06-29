const axios = require('axios')
const modelMap = require('./modelMap')
const XLSX = require('xlsx')
require('dotenv').config()

async function sendRequests () {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])

  for (const model in modelMap) {
    const item = modelMap[model]
    const dealerCode = 'CA317'

    try {
      const requestBody = {
        dealerCode,
        year: '2023',
        series: item
        // Rest of the properties...
      }

      const response = await axios.post(process.env.getVehicleLocatorEndpoint, requestBody, {
        headers: {
          Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        }
      })

      const vehLocatorDetails = response.data.vehLocatorDetails

      // Add vehLocatorDetails to the worksheet
      vehLocatorDetails.forEach((vehicle) => {
        const row = Object.values(vehicle)
        XLSX.utils.sheet_add_aoa(worksheet, [row])
      })
    } catch (error) {
      console.error(`Error sending request for item ${item} (${model}):`, error.message)
    }
  }

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Write the workbook to a file
  const excelFileName = 'output.xlsx'
  XLSX.writeFile(workbook, excelFileName)

  console.log(`Data exported to ${excelFileName}`)
}

sendRequests()
