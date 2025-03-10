import React, { useState, useRef, useEffect } from "react";
import ChevronDown from "../../assets/icons/ChevronDown";
import SearchBar from "../ui/SearchBar";
import PlusCircle from "../../assets/icons/PlusCircle";
import NoRecords from "../ui/NoRecords";

interface SelectProps {
  required?: boolean;
  label?: string;
  options: { value: any; label: string }[];
  error?: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  addButtonLabel?: string;
  addButtonFunction?: (...params: any[]) => void;
  totalParams?: number;
  paramsPosition?: number;
  from?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder,
  required,
  readOnly,
  value,
  onChange,
  addButtonLabel,
  addButtonFunction,
  totalParams,
  paramsPosition,
  from
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const getTextFromJSX = (label: React.ReactNode): string => {
    if (typeof label === "string") return label; // If it's a string, return as is
    if (Array.isArray(label)) {
      return label.map(getTextFromJSX).join(""); // Recursively process arrays
    }
    if (React.isValidElement(label)) {
      return getTextFromJSX(label.props.children); // Process children recursively
    }
    return ""; // Return an empty string for unsupported types
  };
  
  

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) => {
        const labelText =
          typeof option.label === "string" ? option.label : getTextFromJSX(option.label);
        return labelText.toLowerCase().includes(searchValue.toLowerCase());
      })
    );
  }, [searchValue, options]);
  
  // Function to extract text from JSX elements
  
  
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        parentRef.current &&
        !parentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current && parentRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - parentRect.bottom;
      const spaceAbove = parentRect.top;
      
      setDropdownPosition(spaceBelow < dropdownRect.height && spaceAbove > spaceBelow ? "top" : "bottom");
    }
  }, [isOpen, filteredOptions]);

  const handleOptionSelect = (selectedValue: string) => {
    setIsOpen(false);
    if (onChange) onChange(selectedValue === placeholder ? "" : selectedValue);
  };

  return (
    <div className="relative w-full" ref={parentRef}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`relative ${readOnly ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        onClick={() => !readOnly && setIsOpen((prev) => !prev)}
      >
        <div
  className={`block w-full h-9 ${from=="ticket" ?'pt-1':'pt-2'} bg-white border text-sm px-2 pr-8 items-center rounded-md leading-tight 
              ${error ? "border-red-500" : "border-gray-300"}`}
>
  {value !== undefined
    ? options.find((option) => option.value === value)?.label || placeholder
    : placeholder || "Select an option"}
</div>
        <div className="absolute inset-y-0 right-0 flex items-center px-2">
          <ChevronDown color="gray" />
        </div>
      </div>
      <div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg 
                      ${dropdownPosition === "top" ? "bottom-[70%]" : "top-full mt-1"}`}
        >
          <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
          
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
  {filteredOptions.length > 0 ? (
    <>
      {placeholder && searchValue === "" && (
        <div
          onClick={() => handleOptionSelect(placeholder)}
          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 font-semibold text-gray-500"
        >
          {placeholder}
        </div>
      )}

      {filteredOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => handleOptionSelect(option.value)}
          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
        >
          {option.label}
        </div>
      ))}
    </>
  ) : (
    <div className="py-3">
      <NoRecords textSize="xs" imgSize={50} />
    </div>
  )}
</div>


          {addButtonLabel && (
              <div
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
            
                if (addButtonFunction && totalParams && paramsPosition !== undefined) {
                  const params = Array(totalParams-1).fill(false); // Create an array filled with `false`
                  params[paramsPosition-1] = true; // Set the specified position to `true`
                  addButtonFunction(...params); // Call the function with the dynamic parameters
                }
              }}
              className="mt-1 m-1">
                <button className="bg-darkGreen text-[#820000] rounded-lg py-3 px-4 flex items-center text-sm font-bold border-slate-400 border gap-2 w-full hover:bg-lightRed">
                  <PlusCircle color="#820000" size={18}/>
                  <p>{addButtonLabel}</p>
                </button>
              </div>
            )}
        </div>
      )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;
