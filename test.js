require('dotenv').config()
const axios = require('axios')
const modelMap = require('./modelMapTest')
const XLSX = require('xlsx')

async function sendRequests () {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])

  const vinList = []

  for (const model in modelMap) {
    const item = modelMap[model]

    try {
      const requestBody = {
        dealerCode: 'CA317',
        year: '2023',
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
          const { vin, year, model, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal } = vehicle
          vinList.push(vin)

          const row = [vin, year, model, exterior, interior, accessoryCode, piOs, invoiceTotal, msrpTotal]
          XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1, originDate: new Date() })
        }
      }
    } catch (error) {
      console.error(`Error sending request for item ${item} (${model}):`, error.message)
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  const excelFileName = 'outputTest.xlsx'
  XLSX.writeFile(workbook, excelFileName)
  console.log(vinList)
  console.log(`Data exported to ${excelFileName}`)
}

sendRequests()
