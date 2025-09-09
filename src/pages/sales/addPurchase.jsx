import { useEffect, useRef, useState } from "react";
import Title from "../../../components/titles/Title";
import SectionTitle from "../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../api/axios";
import LoadingSpinner from "../../../components/actions/LoadingSpinner";
import NoDataError from "../../../components/actions/NoDataError";
import DataTable from "../../../components/table/DataTable";
import ButtonComponent from "../../../components/buttons/ButtonComponent";
import TablePagination from "../../../components/table/TablePagination";
import CheckInputComponent from "../../../components/inputs/CheckInputComponent";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../../../components/inputs/CameraCapture";
import TextInputComponent from "../../../components/inputs/TextInputComponent";
import SearchComponent from "../../../components/inputs/SearchComponent";
import useToast from "../../../hooks/useToast";
import Swal from "sweetalert2";


function SignInOut() {
    const [searchQuery, setSearchQuery] = useState("");
    const [customer, setCustomer] = useState()
    const [loadingCustomer, setLoadingCustomer] = useState(true)
    const [errorCustomer, setErrorCustomer] = useState(null)
    const navigate = useNavigate();
    const Toast = useToast()


    const getCustomer = async (link = "/customers") => {
        try {
            setLoadingCustomer(true);
            setErrorCustomer(false);
            setCustomer({});
            const response = await axiosPrivate.get(link);
            console.log(response.data);
            if (response.data.results[0]) {
                const { first_name, middle_name, last_name, national_number, id } =
                    response.data.results[0];
                const customer = {
                    fullName: `${first_name} ${middle_name} ${last_name}`,
                    id: id,
                    nationalNumber: national_number,
                };

                setCustomer(customer);
            } else if (response.data.results.length == 0) {
                setErrorCustomer(true);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingCustomer(false);
        }
    };

    const handleSearchClick = () => {
        getCustomer(`/customers?search=${searchQuery}`);
    };
   


    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الحضور :" />
            <section className="flex items-center justify-center flex-col  w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text="تسجيل الحضور" />
               
                        <>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                <SearchComponent
                                    onChange={setSearchQuery}
                                    value={searchQuery}
                                    onClickSearch={handleSearchClick}
                                />
                            </div>
                            {

                                !loadingCustomer ? (
                                    errorCustomer ? (

                                        <div className="flex items-center justify-center gap-4">
                                            <p className="font-bold">
                                                لا يوجد سجل للموظف المطلوب
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid lg:grid-cols-2 gap-4 w-full">
                                                <div className="flex flex-col items-end justify-end gap-4">
                                                    <TextInputComponent
                                                        label={"الرقم الوطني:"}
                                                        value={customer.nationalNumber}
                                                        disabled={true}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-end justify-start gap-4">
                                                    <TextInputComponent
                                                        label={"اسم الموظف:"}
                                                        value={customer.fullName}
                                                        disabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative w-1/2 flex justify-between items-center py-10">
                                                <ButtonComponent onClick={() => { signCustomer("check_out") }} variant={'sign_out'} textButton='تسجيل خروج' />
                                                <ButtonComponent onClick={() => signCustomer("check_in")} variant={'sign_in'} textButton='تسجيل دخول' />
                                            </div>
                                        </>
                                    )
                                ) : null
                            }
                        </>
                
                <div className="flex items-center justify-between gap-4 w-full pt-5">
                </div>
                <p></p>
            </section>
        </main>
    );
}

export default SignInOut;
