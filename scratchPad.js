let vehicleDetailsApi = "https://kdplusservices.kdealer.com/SALES/api/v1/VehicleMasterApi/VehicleMasterDetails"
let vehicleDetailsApiPayload = {
    vin: "5XXG44J83RG231730", //vin will be dynamic
    dealerCode: "CA317"
}

let monroneyApi = "https://kdplusservices.kdealer.com/SALES/api/v1/VehicleMasterApi/MonroneyPDF"
let monroneyApiPayload = { vin: "5XXG44J83RG231730" } //vin will be dynamic

const hyperlink = `http://localhost:3000/getMonroney/${vin}`; // Replace with your desired URL format
