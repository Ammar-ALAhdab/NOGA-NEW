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
import { useNavigate, useParams } from "react-router-dom";
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

function Coupon() {
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
    const { couponId } = useParams()
    const [couponError, setCouponError] = useState(null)
    const [loadingCoupon, setLodingCoupon] = useState(true)
    const [getCouponError, setGetCouponError] = useState(null)
    const navigate = useNavigate();
    const editCoupon = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية تعديل الكوبون",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .put(`/sales/coupons/${couponId}`, coupon)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية التعديل بنجاح",
                            icon: "success",
                        });
                        navigate(-1)
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في التعديل",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }
    const deleteCoupon = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية حذف الكوبون",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .delete(`/sales/coupons/${couponId}`)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الحذف بنجاح",
                            icon: "success",
                        });
                        navigate(-1)
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في الحذف",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }

    const getCoupon = async (link = `/sales/coupons/${couponId}`) => {
        try {
            setLodingCoupon(true);
            setGetCouponError(null);
            const response = await axiosPrivate.get(link);
            console.log(response);
            
            setCoupon(response.data);
        } catch (error) {
            console.log(error);
            
            setCouponError(error);
        } finally {
            setLodingCoupon(false);

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
    useEffect(() => {
        getCoupon()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الكوبونات :" />
            <section className="flex items-end justify-center flex-col  w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {
                    loadingCoupon ?
                        <LoadingSpinner />
                        :
                        couponError ?
                            <>
                            </>
                            :

                            <>
                                <div className="flex  items-start justify-center gap-4">
                                    <div className="flex items-start justify-center py-5">
                                        <TextInputComponent
                                            label={"كود الحسم"}
                                            value={coupon.code}
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
                                            ButtonText={"الفرع"}
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
                                    <ButtonComponent variant={"delete"} onClick={() => { deleteCoupon() }} />
                                    <ButtonComponent variant={"edit"} onClick={() => { editCoupon() }} />
                                </div>
                            </>
                }
            </section>
        </main>
    );
}

export default Coupon;
