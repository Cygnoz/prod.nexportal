import { useEffect, useState } from "react";
import AreaIcon from "../../assets/icons/AreaIcon";
import FileCheck from "../../assets/icons/FileCheck";
import RegionIcon from "../../assets/icons/RegionIcon";
import RowsIcon from "../../assets/icons/RowsIcon";
import TreePain from "../../assets/icons/TreePain";
import Wallet from "../../assets/icons/Wallet";
import indLogo from "../../assets/image/IndiaLogo.png";
import SaudhLogo from "../../assets/image/SaudiLogo.png";
import UAELogo from "../../assets/image/UAELogo.webp";
import HomeCard from "../../components/ui/HomeCards";
import RatingStar from "../../components/ui/RatingStar";
import TicketsBar from "../../components/ui/TicketsBar";
import { useRegularApi } from "../../context/ApiContext";
import useApi from "../../Hooks/useApi";
import { endPoints } from "../../services/apiEndpoints";
import LeadConversionRate from "./Graphs/LeadConversionRate";
import TopBreakDownByRegion from "./Graphs/TopBreakDownByRegion";
import TopRevenueByRegion from "./Graphs/TopRevenueByRegion";
import NoRecords from "../../components/ui/NoRecords";
import TargetComparison from "./Graphs/TargetComparission";
import ProgressBar from "./Graphs/ProgressBar";

const DashboardPage = () => {
  const { totalCounts,dropdownRegions,refreshContext } = useRegularApi();
  const { request: getSolveTickets } = useApi("get", 3003);
  const [solvedTickets, setSolvedTickets] = useState([]);
  const homeCardData = [
    {
      icon: <RegionIcon size={24} />,
      number: totalCounts?.totalUsers,
      title: "Total Users",
      iconFrameColor: "#F9A51A",
      iconFrameBorderColor: "#FFF2DDCC",
    },
    {
      icon: <RowsIcon size={24} />,
      number: totalCounts?.totalRegion,
      title: "Total Regions",
      iconFrameColor: "#FCB23E",
      iconFrameBorderColor: "#FDE3BBCC",
    },
    {
      icon: <AreaIcon size={24} />,
      number: totalCounts?.totalArea,
      title: "Total Area",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <Wallet size={24} />,
      number: " ₹ 76,789,8",
      title: "Sales Revenue",
      iconFrameColor: "#F9911A",
      iconFrameBorderColor: "#EDD2BBCC",
    },
    {
      icon: <FileCheck size={24} />,
      number: totalCounts?.activeLicensor,
      title: "Active Licenses",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <TreePain size={24} />,
      number: "10%",
      title: "Sales Growth",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
  ];

  // Country logos array
  const countryLogo = [
    {
      country: "India",
      logo: indLogo,
    },
    {
      country: "Saudi Arabia",
      logo: SaudhLogo,
    },
    {
      country: "United Arab Emirates",
      logo: UAELogo,
    },
  ];

  // Color array
  const colors = [
    "#FF9800",
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
    "#F44336",
    "#FFC107",
  ];

  const countries = [
    {
      countryName: "India",
      logo: indLogo,
      ratingCount: 4,
    },
    {
      countryName: "Saudi",
      logo: SaudhLogo,
      ratingCount: 3,
    },
    {
      countryName: "UAE",
      logo: UAELogo,
      ratingCount: 5,
    },
    {
      countryName: "Iran",
      logo: SaudhLogo,
      ratingCount: 2,
    },
    {
      countryName: "Japan",
      logo: indLogo,
      ratingCount: 5,
    },
    {
      countryName: "Brazil",
      logo: UAELogo,
      ratingCount: 3,
    },
  ];

  const maxTicketCount = Math.max(
    ...solvedTickets.map((region: any) => region.solvedTicket)
  );

  const getSolvedTickets = async () => {
    try {
      const { response, error } = await getSolveTickets(
        endPoints.RESOLVED_TICKETS
      );

      if (response && !error) {
        setSolvedTickets(response.data);
      } else {
        console.log("err", error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSolvedTickets();
    refreshContext({counts:true,dropdown:true})
  }, []);

  return (
    <div className="text-[#303F58] mb-3">
      <h1 className="text-[#303F58] text-xl font-bold">Dashboard</h1>
      <p className="text-ashGray text-sm">
      A visual overview of essential business data and performance metrics. 
            </p>
      {/* HomeCards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-2 mt-2">
  {homeCardData.map((card, index) => (
    <HomeCard
      iconFrameColor={card.iconFrameColor}
      iconFrameBorderColor={card.iconFrameBorderColor}
      key={index}
      icon={card.icon}
      number={card?.number}
      title={card.title}
    />
  ))}
</div>

      <div className="mt-3">
        <ProgressBar/>
      </div>

      <div className="mt-3">
        <TargetComparison/>
      </div>
      <div className="grid grid-cols-12 gap-4 max-lg:gap-2 mt-3">
  {/* Top Revenue By Region */}
  <div className="col-span-8 max-md:col-span-6 max-sm:col-span-12">
    <TopRevenueByRegion />
  </div>

  {/* Breakdown by Region */}
  <div className="col-span-4 max-md:col-span-6 max-sm:col-span-12">
    <TopBreakDownByRegion allRegions={dropdownRegions} />
  </div>

  {/* Top Rated by Region (Customer Support) */}
  <div className="col-span-2 max-md:col-span-6 max-sm:col-span-12">
    <div className="p-4 bg-white w-full space-y-3 rounded-lg h-full">
      <h2 className="font-bold text-center sm:text-sm">Top Rated by Region</h2>
      {countries.map((country, index) => (
        <div key={index} className="grid grid-cols-2 py-1">
          <div className="flex items-center gap-2">
            <img className="w-5 h-5 rounded-full" src={country.logo} alt="" />
            <p className="text-sm">{country.countryName}</p>
          </div>
          <RatingStar count={country.ratingCount} />
        </div>
      ))}
    </div>
  </div>

  {/* Top Ticket Resolved Regions */}
  <div className="col-span-2 max-md:col-span-6 max-sm:col-span-12">
    <div className="p-4 bg-white w-full space-y-3 rounded-lg h-full">
      <h2 className="font-bold text-center sm:text-sm">Top Ticket Resolved</h2>
      {solvedTickets?.length > 0 ? (
        solvedTickets.map((solve:any, index) => {
          const countryData = countryLogo.find(
            (country) => country.country === solve.country
          );
          const color = colors[index % colors.length];

          return (
            <div key={solve?.regionName} className="grid grid-cols-2 py-1">
              <div className="flex items-center gap-2">
                <img
                  className="w-5 h-5 rounded-full"
                  src={countryData?.logo || ""}
                  alt={solve?.country || "Unknown Country"}
                />
                <p className="text-sm">
                  {solve?.regionName.length > 8
                    ? `${solve?.regionName.slice(0, 8)}...`
                    : solve?.regionName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TicketsBar
                  count={solve?.solvedTicket}
                  maxCount={maxTicketCount}
                  color={color}
                />
              </div>
            </div>
          );
        })
      ) : (
        <NoRecords text="No Tickets found" imgSize={60} parentHeight="300px" textSize="md" />
      )}
    </div>
  </div>

  {/* Lead Conversion Rate */}
  <div className="col-span-8 max-md:col-span-12 max-sm:col-span-12">
    <LeadConversionRate allRegions={dropdownRegions} />
  </div>
</div>


    </div>
  );
};

export default DashboardPage;
