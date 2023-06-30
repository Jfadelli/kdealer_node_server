require('dotenv').config()
const axios = require('axios')
const modelMap = require('./modelMap')
const XLSX = require('xlsx')
const requestBody = require('./requestBody')

async function sendRequests () {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  // Define custom headers
  const headers = ['VIN', 'Year', 'Model', 'Trim', 'Ext', 'Int', 'Acc', 'piOs', 'Invoice', 'MSRP']

  // Add headers to the worksheet
  XLSX.utils.sheet_add_aoa(worksheet, [headers])

  for (const year of ['2023', '2024']) {
    requestBody.year = year // Update the year in the requestBody for each iteration

    for (const model in modelMap) {
      const item = modelMap[model]
      requestBody.series = item // Update the series in the requestBody for each iteration

      try {
        const response = await axios.post(process.env.getVehicleLocatorEndpoint, requestBody, {
          headers: {
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
          }
        })

        const responseData = response.data
        if (responseData.msgRet.msgType === 'S') {
          const vehLocatorDetails = response.data.vehLocatorDetails

          for (const vehicle of vehLocatorDetails) {
            const row = Object.values(vehicle)
            const vin = row[5]
            const requestBody2 = {
              vin,
              dealerCode: 'CA317'
            }

            try {
              const vehicleDetailsResponse = await axios.post(process.env.getVehicleDetails, requestBody2, {
                headers: {
                  Authorization: `Bearer ${process.env.BEARER_TOKEN}`
                }
              })
              const vehicleDetailsData = vehicleDetailsResponse.data

              const { vin, year, model, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal } = vehicleDetailsData

              // Strip characters before and including a colon in the model
              const strippedModel = model.substring(model.lastIndexOf(':') + 1).trim()

              // Split the strippedModel at spaces into an array
              const modelSplitString = strippedModel.split(' ')

              // Remove the first item from the array
              const modelA = modelSplitString.shift()

              // Join the remaining elements of the array into a string separated by spaces
              const trim = modelSplitString.join(' ')

              console.log(modelA, trim)

              const vehicleDetails = [vin, year, modelA, trim, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal]

              XLSX.utils.sheet_add_aoa(worksheet, [vehicleDetails], { origin: -1, originDate: new Date() })
            } catch (error) {
              console.error(`Error in new query for VIN ${vin}:`, error.message)
            }
          }
        }
      } catch (error) {
        console.error(`Error sending request for item ${item} (${model}):`, error.message)
      }
    }
  }

  // Set the autofilter and table properties
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  const tableRange = XLSX.utils.encode_range(range)
  worksheet['!autofilter'] = { ref: tableRange }

  worksheet['!ref'] = `${tableRange}`
  worksheet['!ref'] = worksheet['!ref'].replace(/([A-Z]+)$/, '1:$1')

  // Apply table style
  worksheet['!table'] = {
    ref: tableRange,
    style: 'Table Style Light 1', // Choose the desired table style
    autoFilter: worksheet['!autofilter']
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  const excelFileName = 'output.xlsx'
  XLSX.writeFile(workbook, excelFileName)
  console.log(`Data exported to ${excelFileName}`)
}

sendRequests()
