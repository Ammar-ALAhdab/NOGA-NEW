import { useParams } from "react-router-dom";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useState } from "react";


function NearestBranch() {
    const [nearestBranch , setNearestBranch] = useState()
    const [nearestBranchLoading , setNearestBranchLoading] = useState()
    const { ProductId } = useParams();
    const getNearestBranch = async (url) => {
        try {
            const response = await axiosPrivate.get(url);
           
            setNearestBranch(response.data);
           
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        getNearestBranch()
    } , [])
        return (
            <div className="bg-primary z-10 ">
                <section>
                    <SectionTitle text="اقرب فرع يحتوي المنتج " />
                </section>

            </div>
        );
    }

    export default NearestBranch;
