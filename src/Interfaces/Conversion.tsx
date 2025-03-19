export interface Conversion {
    organizationName: string;
    contactName: string;
    contactNum: string;
    email: string;
    password: string;
    confirmPassword:string
    startDate: string;
    customerStatus?:string
    endDate: string;
    country:string
    state:string
    registered?:string;
    gstNumber?:string
    salesAccountId?:string
    depositAccountId?:string
    taxGroup?:string
    sellingPrice?:string
    placeOfSupply?:string
    plan?:string
    planName?:string
}