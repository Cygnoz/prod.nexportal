import { useState } from "react";
import ActivityTimeline from "./ActivityTimeline";
import Mails from "./Mails";
import Notes from "./Notes";
import Tasks from "./Tasks";
import Meetings from "./Meetings";


type Props = {
  leadData:any
}

const ViewActivities = ({leadData}: Props) => {
    const tabs=["Activity Timeline","Mails", "Notes","Task","Meetings"]
    const [activeTab, setActiveTab] = useState<string>("Activity Timeline");
   
  return (
    <div>
<div className="flex flex-wrap gap-6 text-base font-bold my-5 border-b border-gray-200">
  {tabs.map((tab) => (
    <div
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`cursor-pointer py-3 px-[16px] ${
        activeTab === tab
          ? "text-deepStateBlue"
          : "text-gray-400"
      }`}
    >
      {tab}
    </div>
  ))}
</div>



    {activeTab==="Activity Timeline"&&(
        <div>
            <ActivityTimeline/>
        </div>
    )}

    {activeTab==="Mails"&&(
    <Mails leadData={leadData} />
    )}

    {activeTab==="Notes"&&(
    <Notes/>
    )}

    {activeTab==="Task"&&(
    <Tasks leadData={leadData} />
    )}

    {activeTab==="Meetings"&&(
    <Meetings/>
    )}


    </div>
  )
}

export default ViewActivities;