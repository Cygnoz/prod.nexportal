export  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "New":
        return "bg-blue-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Contacted":
        return "bg-cyan-800 text-center text-white py-1 px-2 rounded-lg";
      case "In progress":
        return "bg-[#FACC15] text-center text-black py-1 px-2 rounded-lg";
        case "Inprogress":
          return "bg-[#FACC15] text-center text-black py-1 px-2 rounded-lg";
      case "In Progress":
        return "bg-[#FACC15] text-center text-black py-1 px-2 rounded-lg";
      case "Proposal":
        return "bg-violet-300 text-center text-black py-1 px-2 rounded-lg";
      case "Lost":
        return "bg-red-500 text-center text-white py-1 px-2 rounded-lg";
      case "Closed":
        return "bg-[#34D399] text-center text-white py-1 px-2 rounded-lg";
      case "Active":
        return "bg-green-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Converted":
        return "bg-purple-500 text-center text-white py-1 px-2 rounded-lg";
      case "Expired":
        return "bg-red-500 text-center text-white py-1 px-2 rounded-lg";
      case "Not Started":
        return "bg-orange-400 text-center text-white py-1 px-2 rounded-lg";
      case "Extended":
        return "bg-violet-500 text-center text-white py-1 px-2 rounded-lg";
      case "Pending Renewal":
        return "bg-orange-400 text-center text-white py-1 px-2 rounded-lg";
      case "Open":
        return "bg-[#60A5FA] text-center text-white py-1 px-2 rounded-lg";
      case "Pending":
        return "bg-yellow-400 text-center text-black py-1 px-2 rounded-lg";
      case "High":
        return "bg-red-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Medium":
        return "bg-orange-300 text-center text-white py-1 px-2 rounded-lg";
      case "Low":
        return "bg-green-300 text-center text-white py-1 px-2 rounded-lg";
      case "Won":
        return "bg-green-500 text-center text-white  py-1 px-2 w-fit rounded-lg";
      case "Resolved":
        return "bg-[#A78BFA] text-center text-black py-1 px-2 rounded-lg";
      case "Paid":
        return "bg-purple-200 text-center text-black py-1 px-2 rounded-lg";
        case "Deactive":
          return "bg-orange-500 text-center text-white py-1 px-2 rounded-lg";
  
      default:
        return "";
    }
  };