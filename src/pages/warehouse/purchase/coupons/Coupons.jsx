import { useEffect, useState } from "react";
import Title from "../../../../components/titles/Title";
import SectionTitle from "../../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../../api/axios";
import LoadingSpinner from "../../../../components/actions/LoadingSpinner";
import NoDataError from "../../../../components/actions/NoDataError";
import DataTable from "../../../../components/table/DataTable";
import ButtonComponent from "../../../../components/buttons/ButtonComponent";
import TablePagination from "../../../../components/table/TablePagination";
import CheckInputComponent from "../../../../components/inputs/CheckInputComponent";
import { useNavigate } from "react-router-dom";


function Coupons() {
    const [coupons, setCoupons] = useState([])
    const [lodingCoupons, setLodingCoupons] = useState(true)
    const [getCouponsError, setGetCouponsError] = useState(null)
    const navigate = useNavigate();
    console.log(coupons);
    
    const CouponsColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "code",
            headerName: "كود الكوبون",
            flex: 1,
        },
        {
            field: "discount_type",
            headerName: "نوع الحسم",
            flex: 1,
        },
        {
            field: "amount",
            headerName: "كمية الحسم",
            flex: 1,
        },
        {
            field: "start_date",
            headerName: "تاريخ البداية",
            flex: 1,
        },
        {
            field: "end_date",
            headerName: "تاريخ النهاية",
            flex: 1,
        },
        {
            field: "min_price",
            headerName: "اقل سعر فاتورة",
            flex: 1,
        },
        {
            field: "max_price",
            headerName: "اكبر سعر فاتورة",
            flex: 1,
        },
        {
            field: "quantity",
            headerName: "الكمية",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "تاريخ الانشاء",
            flex: 1,
        },  
        {
            field: "",
            headerName: "عرض التفاصيل",
            width: 150,
            sortable: false,
            renderCell: (params) => {
                return (
                    <ButtonComponent
                        variant={"show"}
                        small={true}
                        onClick={() => { navigate(`${params.row.id}`) }}
                    />
                );
            },
        },
    ];

    const getCoupons = async (link = "/sales/coupons") => {
        try {
            setLodingCoupons(true);
            setGetCouponsError(null);
            const response = await axiosPrivate.get(link);
            setCoupons(response.data);
        } catch (error) {
            setGetCouponsError(error);
        } finally {
            setLodingCoupons(false);

        }
    };
    const handleClickAddCoupons = () => {
        navigate(`addCoupon`)
    }
    useEffect(() => {
        getCoupons()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الكوبونات :" />
            <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
                <ButtonComponent variant={"add"} onClick={handleClickAddCoupons} />
            </div>
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text=" قائمة الكوبونات" />
                {lodingCoupons ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getCouponsError ? (
                    <NoDataError error={getCouponsError} />
                ) : (
                    <DataTable columns={CouponsColumns} rows={coupons} />
                    // <p>test</p>
                )}

            </section>
        </main>
    );
}

export default Coupons;
