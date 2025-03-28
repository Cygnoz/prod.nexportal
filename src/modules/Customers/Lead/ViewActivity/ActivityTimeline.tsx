import { useEffect, useState } from 'react';
import EditIcon from '../../../../assets/icons/EditIcon';
import rightArrow from '../../../../assets/image/right-arrow.png';
import { endPoints } from '../../../../services/apiEndpoints';
import { useParams } from 'react-router-dom';
import useApi from '../../../../Hooks/useApi';
import NoRecords from '../../../../components/ui/NoRecords';
import SelectDropdown from '../../../../components/ui/SelectDropdown';
import DOMPurify from 'dompurify';

const ActivityTimeline = () => {
  const { request: getAllActivityTimeline } = useApi('get', 3001);
  const [activityData, setActivityData] = useState<any[]>([]);
  const { id } = useParams();

  const [selectedPeriod, setSelectedPeriod] = useState({ label: 'All Timelines', value: '' });
  const [selectedActivity, setSelectedActivity] = useState({ label: 'All Activities', value: '' });
  const [displayDate, setDisplayDate] = useState('');

  const activityOptions = [
    { label: 'Meeting', value: 'meeting' },
    { label: 'Mail', value: 'email' },
    { label: 'Note', value: 'note' },
    { label: 'Task', value: 'task' },
  ];

  const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'After 7 Days', value: 'after_7_days' },
    { label: 'After 30 Days', value: 'after_30_days' },
  ];

  // Fetch timeline data on component mount
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const { response, error } = await getAllActivityTimeline(`${endPoints.ACTIVITY_TIMELINE}/${id}`);
        console.log('activityleee', response);
        console.log('err', error);

        if (response && !error) {
          setActivityData(response.data.activities || []);
        } else {
          console.error('API Error:', error.response?.data?.message || error.message);
          window.location.reload(); // Refresh page to fetch data again
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        window.location.reload(); // Refresh page to fetch data again
      }
    };

    fetchTimelineData();
  }, [id]);

  // Format date for display
  const formatDate = (date: Date, label: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
    const dateString = date.toLocaleDateString('en-US', options);
    return `${label}, ${dateString}`;
  };

  // Update display date based on selected period
  const updateDate = (selectedValue: string) => {
    const today = new Date();
    let formattedDate = '';

    switch (selectedValue) {
      case 'today':
        formattedDate = formatDate(today, 'Today');
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        formattedDate = formatDate(yesterday, 'Yesterday');
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        formattedDate = formatDate(tomorrow, 'Tomorrow');
        break;
      case 'after_7_days':
        const after7Days = new Date(today);
        after7Days.setDate(today.getDate() + 7);
        formattedDate = formatDate(after7Days, 'After 7 Days');
        break;
      case 'after_30_days':
        const after30Days = new Date(today);
        after30Days.setDate(today.getDate() + 30);
        formattedDate = formatDate(after30Days, 'After 30 Days');
        break;
      default:
        formattedDate = '';
    }

    setDisplayDate(formattedDate);
  };

  // Handle activity filter selection
  const handleActivitySelection = (selectedOption: any) => {
    setSelectedActivity(selectedOption);
  };

  // Handle timeline filter selection
  const handleTimelineSelection = (selectedOption: any) => {
    setSelectedPeriod(selectedOption);
    updateDate(selectedOption?.value);

  };

  // Filter activities based on selected filters
  const filteredActivities = activityData.filter((activity) => {
    if (!activity?.activityType) return false;

    // Filter by activity type
    const matchesActivity =
      selectedActivity.value === '' ||
      selectedActivity.value.toLowerCase() === activity.activityType.toLowerCase();

    // Show all activities if "All Timelines" is selected
    if (selectedPeriod.value === '') {
      return matchesActivity;
    }

    // Filter by timeline
    const createdAt = activity.createdAt ? new Date(activity.createdAt) : '';
    const today = new Date();

    let matchesPeriod = false;

    if (createdAt) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const after7Days = new Date(today);
      after7Days.setDate(today.getDate() + 7);

      const after30Days = new Date(today);
      after30Days.setDate(today.getDate() + 30);

      matchesPeriod =
        (selectedPeriod.value === 'today' && createdAt.toDateString() === today.toDateString()) ||
        (selectedPeriod.value === 'yesterday' && createdAt.toDateString() === yesterday.toDateString()) ||
        (selectedPeriod.value === 'tomorrow' && createdAt.toDateString() === tomorrow.toDateString()) ||
        (selectedPeriod.value === 'after_7_days' && createdAt >= after7Days) ||
        (selectedPeriod.value === 'after_30_days' && createdAt >= after30Days);
    }

    return matchesActivity && matchesPeriod;
  });

  return (
    <div className='h-full'>
      <div className="w-full h-fit rounded-lg p-5 gap-5 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row gap-4">
          <SelectDropdown
            filteredData={activityOptions}
            selectedValue={selectedActivity}
            setSelectedValue={handleActivitySelection}
            placeholder="All Activities"
            searchPlaceholder="Search Activities"
            width="w-full md:w-44"
          />

          <SelectDropdown
            filteredData={periodOptions}
            placeholder="All Timelines"
            selectedValue={selectedPeriod}
            setSelectedValue={handleTimelineSelection}
            searchPlaceholder="Search Timelines"
            width="w-full md:w-44"
          />
        </div>

        {displayDate && <p className="text-[#303F58] text-sm font-bold mt-3">{displayDate}</p>}

        {filteredActivities.length > 0 ? (
          filteredActivities.map((timeline: any) => (
            <div className="bg-[#F5F9FC] p-5 rounded-lg my-4" key={timeline.id}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="mt-2 w-11 h-11 bg-[#EBEFF4] rounded-full">
                  <img className="w-6 h-6 ms-3 mt-[25%]" src={rightArrow} alt="" />
                </div>
                <div className="ms-2 flex-1">
                  <p className="text-[#4B5C79] text-sm font-bold mt-1">{timeline?.description || 'N/A'}</p>
                  <p className="text-[#4B5C79] text-xs font-medium mt-2">
                    {new Date(timeline?.createdAt).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-2 mt-1">
                  <EditIcon size={20} />
                </div>
              </div>

              <div className="ms-20 mt-1">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      timeline?.note ||
                      timeline?.taskTitle ||
                      timeline?.meetingTitle ||
                      timeline?.subject ||
                      timeline?.emailMessage ||
                      'N/A'
                    ),
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <NoRecords text="No Activities Found" parentHeight="200px" imgSize={90} textSize="md" />
        )}
      </div>

    </div>
  );
};

export default ActivityTimeline;
