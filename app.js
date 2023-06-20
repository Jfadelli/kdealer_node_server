const axios = require('axios');
const modelMap = require('./modelMap')
const XLSX = require('xlsx');

console.log(modelMap)

async function sendRequests() {
    const workbook = XLSX.utils.book_new();
    const bearerToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkVGpvYjJTb3VfbTEtOTFHMklaeWpDbXVKeHZJN2xJOVIxRUdyVGUyeHciLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJkOWNjODIxZC1hN2U5LTQzMmYtODY5Zi1kNmUwNjUzOTE2OTUiLCJleHRlbnNpb25fQWxsb3dVc2VyTG9naW4iOnRydWUsImV4dGVuc2lvbl9tZmFCeVBob25lT3JFbWFpbCI6IkVtYWlsIiwiZXh0ZW5zaW9uX3Bhc3N3b3JkUmVzZXRPbiI6MTY4MzkwNjM4Miwic2lnbkluTmFtZXMuZW1haWxBZGRyZXNzIjoiSkZBREVMTElAUFJFTUlFUk9GQ0FSTFNCQUQuQ09NIiwibmFtZSI6Ikphc29uIEZhZGVsbGkiLCJnaXZlbl9uYW1lIjoiSmFzb24iLCJmYW1pbHlfbmFtZSI6IkZhZGVsbGkiLCJjdXJyZW50RGF0ZVRpbWUiOjE2ODcyMzgyNjcsImlzUGFzc3dvcmRSZXNldE9uR3JlYXRlclRoYW5Ob3ciOnRydWUsImlzUGFzc3dvcmRSZXNldE9uUHJlc2VudCI6dHJ1ZSwic2tpcFBhc3N3b3JkUmVzZXQiOnRydWUsImlkcCI6IkxvY2FsIiwidGlkIjoiNWNlZGUzYjEtOWQyNS00NjY1LTgwOTctN2RiZmUwMzJjNGNkIiwiaXNGb3Jnb3RQYXNzd29yZCI6ZmFsc2UsInVzZXJNZXNzYWdlIjoiZmFsc2UiLCJub25jZSI6ImIxNzE5OTcyLTQ2NmItNGM1Ni04MWNjLWQyMTdiOWJhMTFjMyIsImF6cCI6IjM0N2VhMWIyLTc4NWEtNDMyOS1hNDVlLTgwMWJhMjBhMWMxZiIsInZlciI6IjEuMCIsImlhdCI6MTY4NzIzODI2OCwiYXVkIjoiMzQ3ZWExYjItNzg1YS00MzI5LWE0NWUtODAxYmEyMGExYzFmIiwiZXhwIjoxNjg3Mjg1MDY4LCJpc3MiOiJodHRwczovL2tpYXVzYS5iMmNsb2dpbi5jb20vNWNlZGUzYjEtOWQyNS00NjY1LTgwOTctN2RiZmUwMzJjNGNkL3YyLjAvIiwibmJmIjoxNjg3MjM4MjY4fQ.sOU1H6QI8wKW-LZpl9X51azaX1wxRqKpdHXyQMTpHn6F0Y1KR0NOwlKQNq03ev4YCJ0aGXXkBDahgYhftqhPRUTMOq4JJhHNOVRh9SCUfh6b0m5mYbYlpblXVm-s3fXtHlX1wMw8NOEFOtRPAibQAV2r-fiJ3HN1t5Ro8DiSjs2TOFL_q1w9B0CT3F67xoJBCX2Lf_Nez1EYLgtmakiGlAxNKY15yB1RNAyU8CQ4LvcrfCfL5BEr3Qkqe6MiTz0n6OAX6-Wf5--b_QQCFhKKWt6_-jnntU1NN4jwPMgEDhIKTQPM4W09y4niG_pR7nIrDaWuPy4k1bbIlWPL1gGoqw"; // Replace with your actual bearer token

    for (const model in modelMap) {
        const item = modelMap[model];
        try {
            const requestBody = {
                dealerCode: "CA317",
                year: "2023", // will be var in next version
                series: item,
                inDealer: "CA317",
                vin: "",
                extCol: "",
                intCol: "",
                optGrp: "",
                pio: "",
                radius: "",
                status: "DS",
                region: "WE",
                district: "W03",
                sortOrder: "",
                sortBy: "",
                pageSize: 100,
                pageNum: 1,
                tradePartner: [
                    {
                        tradedealerCode: "CA317",
                        tradedealerName: "CA317-Premier Kia of Carlsbad",
                        flag: 1
                    }
                ]
            };

            const response = await axios.post('https://kdplusservices.kdealer.com/SALES/api/v1/VehicleApi/GetVeicleLocator', requestBody, {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            });

            // Store the response data in a worksheet
            const worksheet = XLSX.utils.json_to_sheet([response.data]);

            XLSX.utils.book_append_sheet(workbook, worksheet, model);
            var ws = workbook.Sheets[worksheet];
            XLSX.utils.sheet_add_aoa(ws, dealerCode);
        } catch (error) {
            console.error(`Error sending request for item ${item} (${model}):`, error.message);
        }
    }

    // Write the workbook to a file
    const excelFileName = 'output.xlsx';
    XLSX.writeFile(workbook, excelFileName);

    console.log(`Data exported to ${excelFileName}`);
}

sendRequests();