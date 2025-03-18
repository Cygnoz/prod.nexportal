import { useRegularApi } from "../../context/ApiContext";

export const useAllService = (projectName:any) => {
    const { allServices} = useRegularApi();
    
    return allServices?.filter((service:any) => service.products === projectName) || [];
};


export const useOneServices = (planId:any) => {
    const { allServices} = useRegularApi();
    return allServices?.filter((service:any) => service._id === planId) || [];
};