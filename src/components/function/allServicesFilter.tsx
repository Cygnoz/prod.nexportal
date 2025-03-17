import { useRegularApi } from "../../context/ApiContext";

export const useAllService = (projectName:any) => {
    const { allServices} = useRegularApi();
    
    return allServices?.filter((service:any) => service.products === projectName) || [];
};
