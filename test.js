require('dotenv').config()
const axios = require('axios')
const modelMap = require('./modelMapTest')
const XlsxPopulate = require('xlsx-populate')
const requestBody = require('./requestBody')

async function sendRequests () {
  const workbook = await XlsxPopulate.fromBlankAsync()
  const worksheet = workbook.sheet(0)
  // Define custom headers
  const headers = ['VIN', 'Year', 'Model', 'Trim', 'Ext', 'Int', 'Acc', 'piOs', 'Invoice', 'MSRP']

  // Add headers to the worksheet
  worksheet.cell('A1').value(headers)

  const vinList = []
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

          for (let rowIndex = 0; rowIndex < vehLocatorDetails.length; rowIndex++) {
            const vehicle = vehLocatorDetails[rowIndex]
            const row = Object.values(vehicle)
            const vin = row[5]
            vinList.push(vin)

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

              const vehicleDetails = [vin, year, modelA, trim, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal]

              // Set the hyperlink formula for the VIN cell
              worksheet
                .cell(`A${rowIndex + 2}`)
                .formula(`=HYPERLINK("localhost:3000/getMonroney${vin}", "${vin}")`)

              // Set the values for other cells in the row
              for (let colIndex = 0; colIndex < vehicleDetails.length; colIndex++) {
                worksheet.cell(XlsxPopulate.utils.columnNumberToName(colIndex + 2) + (rowIndex + 2)).value(vehicleDetails[colIndex])
              }
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

  // Auto-fit column widths
  worksheet.column('A').width(20)
  worksheet.columns('B:K').width(10)

  const excelFileName = 'outputTest.xlsx'
  await workbook.toFileAsync(excelFileName)
  console.log(`Data exported to ${excelFileName}`)
}

sendRequests()
