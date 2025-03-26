import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalenderDays from "../../assets/icons/CalenderDays";
import ChevronDown from "../../assets/icons/ChevronDown";
import ChevronRight from "../../assets/icons/ChevronRight";
import ClipboardPenLine from "../../assets/icons/ClipboardPenLine";
import EmailIcon from "../../assets/icons/EmailIcon";
import PencilLine from "../../assets/icons/PencilLine";
import Video from "../../assets/icons/Video";
import MailsForm from "../../modules/Customers/Lead/ViewModals/MailsForm";
import MeetingForm from "../../modules/Customers/Lead/ViewModals/MeetingForm";
import NotesForm from "../../modules/Customers/Lead/ViewModals/NotesForm";
import TasksForm from "../../modules/Customers/Lead/ViewModals/TasksForm";
import Button from "../ui/Button";
import Modal from "./Modal";

type Props = {
  onClose: () => void;
  data?: any;
  leadData?: any;
  fetchActivity: () => void;
};

// Activity type colors
const ACTIVITY_COLORS: any = {
  Meeting: "bg-blue-200",
  Task: "bg-green-200",
  Note: "bg-yellow-200",
  Mail: "bg-purple-200",
};

const Calender = ({ onClose, data, leadData, fetchActivity }: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState({
    email: false,
    note: false,
    meeting: false,
    task: false,
  });

  const [editId, setEditId] = useState<string>("");
  const [mailActivity, setMailActivity] = useState<any>(null);
  const handleModalToggle = (
    email = false,
    note = false,
    meeting = false,
    task = false
  ) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      email,
      note,
      meeting,
      task,
    }));
    fetchActivity();
  };

  const dropdownOptions = [
    {
      label: "Email",
      icon: <EmailIcon size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(true, false, false, false),
    },
    {
      label: "Note",
      icon: <PencilLine size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, true, false, false),
    },
    {
      label: "Meeting",
      icon: <Video size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, false, true, false),
    },
    {
      label: "Task",
      icon: <CalenderDays size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, false, false, true),
    },
    {
      label: "Proposal",
      icon: <ClipboardPenLine size={14} color="#4B5C79" />,
      onClick: () => console.log("Proposal selected"),
    },
  ];

  // Helper function to get week range
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(
      date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
    ); // Start on Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  // Generate days for the week
  const generateWeekDays = (date: Date) => {
    const { start } = getWeekRange(date);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowDatePicker(false);
    }
  };

  const toggleDatePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDatePicker((prev) => !prev);
  };

  // Close handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get current week days
  const weekDays = generateWeekDays(selectedDate);

  // Format date as YYYY-MM-DD for comparison
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Get activities for a specific day and hour
  const getActivitiesForDayAndHour = (day: Date, hour: number) => {
    if (!data || !Array.isArray(data)) return [];

    const dayStr = formatDate(day);

    return data.filter((activity) => {
      // Use dueDate for tasks/meetings, createdAt for others
      const activityDate = activity.dueDate || activity.createdAt;
      if (!activityDate) return false;

      const activityDay = new Date(activityDate).toISOString().split("T")[0];
      if (activityDay !== dayStr) return false;

      // Get time for the activity
      let activityHour;
      if (activity.activityType === "Meeting" && activity.timeFrom) {
        activityHour = parseInt(activity.timeFrom.split(":")[0]);
      } else if (activity.activityType === "Task" && activity.time) {
        activityHour = parseInt(activity.time.split(":")[0]);
      } else {
        // For notes and mails, use createdAt time
        const createdAt = new Date(activity.createdAt);
        activityHour = createdAt.getHours();
      }

      return activityHour === hour;
    });
  };

  // Inside your component
  const timeColumnRef = useRef<HTMLDivElement>(null);
  const calendarContentRef = useRef<HTMLDivElement>(null);

  // Scroll synchronization effect
  useEffect(() => {
    const timeColumn = timeColumnRef.current;
    const calendarContent = calendarContentRef.current;

    const handleTimeScroll = () => {
      if (calendarContent && timeColumn) {
        calendarContent.scrollTop = timeColumn.scrollTop;
      }
    };

    const handleCalendarScroll = () => {
      if (timeColumn && calendarContent) {
        timeColumn.scrollTop = calendarContent.scrollTop;
      }
    };

    if (timeColumn) {
      timeColumn.addEventListener("scroll", handleTimeScroll);
    }
    if (calendarContent) {
      calendarContent.addEventListener("scroll", handleCalendarScroll);
    }

    return () => {
      if (timeColumn) {
        timeColumn.removeEventListener("scroll", handleTimeScroll);
      }
      if (calendarContent) {
        calendarContent.removeEventListener("scroll", handleCalendarScroll);
      }
    };
  }, []);

  return (
    <>
      <div className="flex p-3 justify-between items-center ">
        <h1 className="font-medium text-xl">Calendar</h1>
        <div className="justify-end">
          <button
            type="button"
            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900 me-auto"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>

      <div className="flex p-2 my-1 justify-between">
        <div
          onClick={toggleDatePicker}
          className="flex items-center relative cursor-pointer gap-2"
        >
          <div style={{ transform: "rotate(180deg)" }}>
            <ChevronRight color="black" size={15} />
          </div>
          <h1>
            {selectedDate.toLocaleString("default", { month: "long" })}{" "}
            {selectedDate.getFullYear()}
          </h1>
          <div>
            <ChevronRight color="black" size={15} />
          </div>
          {showDatePicker && (
            <div
              ref={datePickerRef}
              className="absolute z-50 mt-[20rem] bg-white p-2 border rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                calendarStartDay={1} // Start week on Monday
                showWeekNumbers={false} // Disable week numbers column
                onClickOutside={() => {}}
                dayClassName={(date) => {
                  const { start, end } = getWeekRange(selectedDate);
                  const isInSelectedWeek = date >= start && date <= end;
                  return isInSelectedWeek ? "bg-blue-100" : "";
                }}
                renderDayContents={(day, date) => {
                  const isToday = isSameDay(date, new Date());
                  return (
                    <span
                      className={`inline-block w-6 h-6 leading-6 text-center rounded-full
            ${isToday ? "bg-blue-500 text-white" : ""}`}
                    >
                      {day}
                    </span>
                  );
                }}
              />
            </div>
          )}
        </div>

        <div className="relative flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="">+</span> New Activity
            <ChevronDown size={20} color="#FEFDF9" />
          </Button>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-12 bg-white border rounded-lg shadow-lg w-40 z-50"
            >
              {dropdownOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-2 text-sm cursor-pointer border-[#DFDFDF] border-b hover:bg-gray-100"
                  onClick={() => {
                    setEditId('')
                    option.onClick();
                    setDropdownOpen(false);
                  }}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12">
        {/* Time Column */}
        <div className="col-span-1">
          <div className="bg-[#F3E6E6] py-1 sticky top-0 z-10">
            <div>
              <p className="ms-4 mt-3 font-semibold text-base">IST</p>
            </div>
            <div className="mt-3 ms-2">
              <hr />
            </div>
          </div>
          <div
            ref={timeColumnRef}
            className="bg-[#FFFAFA] h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const hour12 = i % 12 || 12;
              const ampm = i < 12 ? "AM" : "PM";

              return (
                <div key={i} className="h-16 flex items-center">
                  <p className="ms-4 font-medium text-sm">
                    {`${hour12}:00 ${ampm}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="col-span-11">
          <div className="bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white overflow-hidden">
              {/* Sticky Header */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-[#F3E6E6] py-1 sticky top-0 z-10">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className="text-center py-3 font-semibold text-gray-600"
                  >
                    {day.toLocaleString("default", { weekday: "short" })}{" "}
                    {day.getDate()}
                  </div>
                ))}
              </div>

              {/* Scrollable Content */}
              <div
                ref={calendarContentRef}
                className="h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar"
              >
                {Array.from({ length: 24 }).map((_, hourIndex) => {
                  return (
                    <div key={hourIndex} className="grid grid-cols-7">
                      {weekDays.map((day, dayIndex) => {
                        const activities = getActivitiesForDayAndHour(
                          day,
                          hourIndex
                        );

                        // Sort activities by time - FIXED VERSION
                        const sortedActivities = [...activities].sort(
                          (a, b) => {
                            // Get time for activity A
                            const getTimeValue = (activity: any) => {
                              if (activity.timeFrom) return activity.timeFrom;
                              if (activity.time) return activity.time;
                              return new Date(activity.createdAt).toISOString();
                            };

                            const timeA = getTimeValue(a);
                            const timeB = getTimeValue(b);

                            // Compare as strings
                            return String(timeA).localeCompare(String(timeB));
                          }
                        );

                        return (
                          <div
                            key={dayIndex}
                            className="h-16 border-r border-b border-gray-200 relative"
                          >
                            {sortedActivities.map((activity, activityIndex) => {
                              const bgColor =
                                ACTIVITY_COLORS[activity.activityType] ||
                                "bg-gray-200";
                              let timeText = "";
                              const activityTypeDisplay =
                                activity.activityType || "Activity";
                              const activityTitle =
                                activity.meetingTitle ||
                                activity.taskTitle ||
                                activity.emailSubject ||
                                (activity.note ? "Note" : "Activity");

                              // Time formatting logic
                              if (activity.activityType === "Meeting") {
                                const formatTime = (time24: string) => {
                                  if (!time24) return "";
                                  const [hours, minutes] = time24.split(":");
                                  const hour = parseInt(hours) % 12 || 12;
                                  const ampm =
                                    parseInt(hours) < 12 ? "AM" : "PM";
                                  return `${hour}:${minutes} ${ampm}`;
                                };
                                timeText = `${formatTime(
                                  activity.timeFrom
                                )} - ${formatTime(activity.timeTo)}`;
                              } else if (activity.time) {
                                const [hours, minutes] =
                                  activity.time.split(":");
                                const hour = parseInt(hours) % 12 || 12;
                                const ampm = parseInt(hours) < 12 ? "AM" : "PM";
                                timeText = `${hour}:${minutes} ${ampm}`;
                              } else {
                                const createdAt = new Date(activity.createdAt);
                                timeText = createdAt.toLocaleTimeString([], {
                                  hour: "numeric", // Removes leading zero
                                  minute: "2-digit",
                                  hour12: true, // Ensures 12-hour format
                                });
                              }

                              return (
                                <div
                                  onClick={() => {
                                    switch (activity.activityType) {
                                      case "Meeting":
                                        handleModalToggle(
                                          false,
                                          false,
                                          true,
                                          false
                                        );
                                        setEditId(activity._id);
                                        break;
                                      case "Task":
                                        handleModalToggle(
                                          false,
                                          false,
                                          false,
                                          true
                                        );
                                        setEditId(activity._id);
                                        break;
                                      case "Note":
                                        handleModalToggle(
                                          false,
                                          true,
                                          false,
                                          false
                                        );
                                        setEditId(activity._id);
                                        break;
                                      case "Mail":
                                        handleModalToggle(
                                          true,
                                          false,
                                          false,
                                          false
                                        );
                                        setMailActivity(activity);
                                        break;
                                      default:
                                        handleModalToggle(); // Close all modals if no match
                                    }
                                  }}
                                  key={`${dayIndex}-${activityIndex}`}
                                  className={`absolute left-1 right-1 ${bgColor} p-1 rounded text-xs shadow-sm border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity `}
                                  style={{
                                    top: `${4 + activityIndex * 26}px`,
                                    height: "88%",
                                    zIndex: activityIndex + 1,
                                  }}
                                >
                                  <h2 className="font-semibold text-[10px] text-gray-500 mr-1 min-w-[40px] truncate">
                                    {activityTypeDisplay}
                                  </h2>
                                  <h3 className="font-medium truncate flex-1 text-[11px]">
                                    {activityTitle}
                                  </h3>
                                  <h4 className="text-[10px] ml-1 whitespace-nowrap">
                                    {timeText}
                                  </h4>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        className="w-[45%] max-sm:w-[90%] max-md:w-[70%]"
        open={isModalOpen.email}
        onClose={() => handleModalToggle()}
      >
        <MailsForm
          activity={mailActivity}
          leadData={leadData}
          onClose={() => handleModalToggle()}
        />
      </Modal>

      <Modal
        className="w-[45%] max-sm:w-[90%] max-md:w-[70%] max-sm:h-[600px] sm:h-[500px] md:h-[500px] max-sm:overflow-auto"
        open={isModalOpen.meeting}
        onClose={() => handleModalToggle()}
      >
        <MeetingForm editId={editId} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal
        className="w-[45%] max-sm:w-[90%] max-md:w-[70%]"
        open={isModalOpen.note}
        onClose={() => handleModalToggle()}
      >
        <NotesForm editId={editId} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal
        className="w-[45%] max-sm:w-[90%] max-md:w-[70%]"
        open={isModalOpen.task}
        onClose={() => handleModalToggle()}
      >
        <TasksForm editId={editId} onClose={() => handleModalToggle()} />
      </Modal>
    </>
  );
};

export default Calender;
