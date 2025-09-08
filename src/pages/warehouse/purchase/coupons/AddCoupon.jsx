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
import TextInputComponent from "../../../../components/inputs/TextInputComponent";
import NumberInputComponent from "../../../../components/inputs/NumberInputComponent";
import DateInputComponent from "../../../../components/inputs/DateInputComponent";
import DropDownComponent from "../../../../components/inputs/DropDownComponent";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const DISCOUNT_TYPES = [
    { id: "percentage", title: "نسبة مئوية" },
    { id: "fixed", title: "مبلغ ثابت" },
];

function AddCoupon() {
    const [coupon, setCoupon] = useState(
        {
            "code": "",
            "start_date": "",
            "end_date": "",
            "amount": 0,
            "discount_type": "",
            "min_price": 0,
            "max_price": 0,
            "quantity": 0
        }
    )
    const [couponError, setCouponError] = useState([])
    const [lodingCoupons, setLodingCoupons] = useState(true)
    const [getCouponsError, setGetCouponsError] = useState(null)
    const navigate = useNavigate();
    const addCoupon = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية اضافة كوبون",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .post(`/sales/coupons`, coupon)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الاضافة بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/coupons`, { replace: true })
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في الاضافة",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }

    const addCoupons = async (link = "/sales/coupons") => {
        try {
            setLodingCoupons(true);
            setGetCouponsError(null);
            const response = await axiosPrivate.post(link);
            setCoupons(response.data);
        } catch (error) {
            setCouponError(error);
        } finally {
            setLodingCoupons(false);

        }
    };
    const handleDiscountTypeSelect = (e) => {
        const { value } = e;
        setCoupon(prev => ({
            ...prev,
            discount_type: value
        }));
    };
    const handleAmount = (e) => {
        const { value } = e;
        setCoupon(prev => ({
            ...prev,
            amount: value
        }));
    };
    const handleQuantity = (e) => {
        const { value } = e;
        setCoupon(prev => ({
            ...prev,
            quantity: value
        }));
    };
    const handleMinPrice = (e) => {
        const { value } = e;
        setCoupon(prev => ({
            ...prev,
            min_price: value
        }));
    };
    const handleMaxPrice = (e) => {
        const { value } = e;
        setCoupon(prev => ({
            ...prev,
            max_price: value
        }));
    };
    const handleClickAddCoupons = () => {
        navigate(`addCoupon`)
    }

    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الكوبونات :" />
            <section className="flex items-end justify-center flex-col  w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <div className="flex  items-start justify-center gap-4">
                    <div className="flex items-start justify-center py-5">
                        <TextInputComponent
                            label={"كود الحسم"}
                            onChange={text => setCoupon(prev => ({
                                ...prev,
                                code: text
                            }))}
                        />
                    </div>
                    <div className="flex items-start justify-center py-5">
                        <DropDownComponent
                            data={DISCOUNT_TYPES}
                            label={"نوع الحسم"}
                            ButtonText={"نوع الحسم"}
                            id={"destination"}
                            dataValue="id"
                            dataTitle="title"
                            onSelectEvent={handleDiscountTypeSelect}
                        />
                    </div>
                </div>
                <div className="flex flex-col  items-start justify-center gap-4">
                    <div className="flex  items-start justify-center gap-4 ">
                        <div className="flex items-start justify-center py-5">
                            <NumberInputComponent
                                label={"كمية الحسم:"}
                                id={"quantity"}
                                value={coupon.amount}
                                onChange={handleAmount}
                                min={1}
                            />
                        </div>
                        <div className="flex items-start justify-center py-5">
                            <NumberInputComponent
                                label={"عدد الكوبونات:"}
                                id={"quantity"}
                                value={coupon.quantity}
                                onChange={handleQuantity}
                                min={1}
                            />
                        </div>
                    </div>
                    <div className="flex items-start justify-center gap-4">
                        <div className="flex items-start justify-center py-5 ">
                            <NumberInputComponent
                                label={"اكبر سعر فاتورة:"}
                                id={"max_price"}
                                value={coupon.max_price}
                                onChange={handleMaxPrice}
                                min={1}
                            />

                        </div>
                        <div className="flex items-start justify-center py-5">
                            <NumberInputComponent
                                label={"اقل سعر فاتورة:"}
                                id={"min_price"}
                                value={coupon.min_price}
                                onChange={handleMinPrice}
                                min={1}
                            />

                        </div>
                    </div>
                </div>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <DateInputComponent
                        onChange={date => {
                            setCoupon(prev => ({
                                ...prev,
                                start_date: date
                            }))
                        }}
                        value={dayjs(coupon.end_date, "YYYY-MM-DD")} />
                    <p className="relative text-end w-[250px]">:تاريخ البداية</p>
                </div>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <DateInputComponent
                        onChange={date => {
                            setCoupon(prev => ({
                                ...prev,
                                end_date: date
                            }))
                        }}
                        value={dayjs(coupon.end_date, "YYYY-MM-DD")} />
                    <p className="relative text-end w-[250px]">:تاريخ النهاية</p>
                </div>

                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"create"} onClick={() => { addCoupon() }} />
                    {/* <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} /> */}
                </div>
            </section>
        </main>
    );
}

export default AddCoupon;
