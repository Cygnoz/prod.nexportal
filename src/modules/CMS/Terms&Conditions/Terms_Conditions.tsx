import { useState } from "react";
import SearchBar from "../../../components/ui/SearchBar";
import AddTerms from "./AddTermsModal";
import Button from "../../../components/ui/Button";

type Props = {}

function Terms_Conditions({ }: Props) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-[#303F58] text-xl font-bold"> Terms & Conditions</h1>
                <AddTerms />
            </div>
            <div className="bg-white p-3 my-3">
                <div className="flex gap-20">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />

                </div>
                <div className="p-5">
                    <h1 className="text-[#303F58] bg-[#F6F6F6] p-2 text-md font-semibold">Terms</h1>
                    <div className="flex justify-between p-3">
                        <p>Term 1</p>
                        <div className='flex items-center justify-center gap-2'>

                            <Button variant="tertiary"
                                className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                                Edit
                            </Button>
                            <Button variant="tertiary"
                                className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>



        </div>

    )
}

export default Terms_Conditions