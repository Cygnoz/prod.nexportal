import ProductLogo from "./ProductLogo";

type Props = {
  projectName: string;
};

const LeadTrialProjectCardView = ({ projectName }: Props) => {
  // Map project names to corresponding background gradients
  const projectGradients: Record<string, string> = {
    BillBizz: "bg-gradient-to-br from-[#820000] to-[#2C353B]",
    SewNex: "bg-gradient-to-br from-[#007B7B] to-[#001515]",
    "6NexD": "bg-gradient-to-br from-[#1E90FF] to-[#0B355D]",
    SaloNex: "bg-gradient-to-br from-[#C67581] to-[#2E1317]",
  };

  // Get the gradient class based on projectName, default to a neutral background
  const gradientClass = projectGradients[projectName] || "bg-gray-700";

  return (
    <div className={`flex gap-4 p-4 ${gradientClass} rounded-xl my-4`}>
      <div>
        <ProductLogo projectName={projectName} />
      </div>
      <div>
        <p className="text-[#D6D6D6] text-xs font-normal">Product</p>
        <p className="text-[#F3F3F3] text-xs font-normal">{projectName}</p>
      </div>
    </div>
  );
};

export default LeadTrialProjectCardView;
