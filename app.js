require('dotenv').config()
const axios = require('axios')
const modelMap = require('./modelMap')
const XLSX = require('xlsx')

async function sendRequests () {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  // Define custom headers
  const headers = ['VIN', 'Year', 'Model', 'Exterior', 'Interior', 'Accessory Code', 'PIOs', 'Invoice Total', 'MSRP Total']

  // Add headers to the worksheet
  XLSX.utils.sheet_add_aoa(worksheet, [headers])

  const vinList = []
  for (const year of ['2023', '2024']) {
    for (const model in modelMap) {
      const item = modelMap[model]

      try {
        const requestBody = {
          dealerCode: 'CA317',
          year,
          series: item,
          inDealer: 'CA317',
          vin: '',
          extCol: '',
          intCol: '',
          optGrp: '',
          pio: '',
          radius: '',
          status: 'DS',
          region: 'WE',
          district: 'W03',
          sortOrder: '',
          sortBy: '',
          pageSize: 100,
          pageNum: 1,
          tradePartner: [
            {
              tradedealerCode: 'CA317',
              tradedealerName: 'CA317-Premier Kia of Carlsbad',
              flag: 1
            }
          ]
        }

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
              const vehicleDetails = [vin, year, model, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal]

              // const vehicleDetails = Object.values(vehicleDetailsData)
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
