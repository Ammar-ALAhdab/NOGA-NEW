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
import AddDiscountProduct from "./AddDiscountProduct";
import AddDiscountCategory from "./AddDiscountCategory";

const DISCOUNT_TYPES = [
    { id: "percentage", title: "نسبة مئوية" },
    { id: "fixed", title: "مبلغ ثابت" },
];

function AddDiscount() {
    const [showAddDiscountProduct, setShowDiscountProduct] = useState(false)
    const [showAddDiscountCategory, setShowDiscountCategory] = useState(false)

    const [discount, setDiscount] = useState(
        {
            "start_date": "",
            "end_date": "",
            "amount": 0,
            "discount_type": "",
            "has_products":false,
            "has_categories":false,
            "for_every_product": false,
            "for_every_product_exept": false,
            "discount_products": [],
            "discount_categories": []

        }
    )



    const navigate = useNavigate();

    const discount_products_columns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "product_name",
            headerName: "المنتج",
            width: 200
        },
        {
            field: "options",
            headerName: "الخصائص",
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="relative h-full flex flex-wrap justify-center items-center gap-1">
                        {
                            params.row.options.map(option =>
                                <p className="relative text-sm  rounded-full border border-1 px-1 bg-[#3457D5] text-white">
                                    {option.attribute + " : " + option.option + option.unit}
                                </p>
                            )
                        }

                    </div>
                )
            }
        },
        {
            headerName: "خيارات",
            width: 200,
            renderCell: (params) => {
                return (
                    <div className="relative h-full flex justify-center items-center gap-4">
                        <ButtonComponent small variant={"delete"} onClick={() => {
                            setDiscount(prev => ({
                                ...prev,
                                discount_products: prev.discount_products.filter(p => p.id != params.row.id)
                            }))
                        }} />
                    </div>
                )
            }
        },
    ]
    const discount_categories_columns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "category",
            headerName: "الصنف",
            width: 200
        },
        {
            field: "options",
            headerName: "الخصائص",
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="relative h-full flex flex-wrap justify-center items-center gap-1">
                        {
                            params.row.options.map(option =>
                                <p className="relative text-sm  rounded-full border border-1 px-1 bg-[#3457D5] text-white">
                                    {option.attribute + " : " + option.option + option.unit}
                                </p>
                            )
                        }

                    </div>
                )
            }
        },
        {
            headerName: "خيارات",
            width: 200,
            renderCell: (params) => {
                return (
                    <div className="relative h-full flex justify-center items-center gap-4">
                        <ButtonComponent small variant={"delete"} onClick={() => {
                            setDiscount(prev => ({
                                ...prev,
                                discount_categories: prev.discount_categories.filter(p => p.id != params.row.id)
                            }))
                        }} />
                    </div>
                )
            }
        },
    ]
    const addDiscount = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية اضافة كوبون",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            const discountReq =
            {
                "start_date": discount.start_date,
                "end_date": discount.end_date,
                "amount": discount.amount,
                "discount_type": discount.discount_type,
                "has_products": discount.discount_products.length > 0,
                "has_categories": discount.discount_categories.length > 0,
                "for_every_product": discount.for_every_product,
                "for_every_product_exept": discount.for_every_product_exept,
                "discount_products":
                    discount.discount_products.map(dp =>
                    (
                        {
                            "product": dp.id,
                            "has_options": dp.options.length > 0,
                            "options": dp.options.map(o => o.id)
                        }
                    )),
                "discount_categories": discount.discount_categories.map(dc =>
                (
                    {
                        "category": dc.id,
                        "has_options": dc.options.length > 0,
                        "options": dc.options.map(o => o.id)
                    }
                ))

            }
            console.log(discount);
            console.log(discountReq);
            if (result.isConfirmed) {
                axiosPrivate
                    .post(`/sales/discounts`, discountReq)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الاضافة بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/discounts`, { replace: true })
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


    const handleDiscountTypeSelect = (e) => {
        const { value } = e;
        setDiscount(prev => ({
            ...prev,
            discount_type: value
        }));
    };
    const handleAmount = (e) => {
        const { value } = e;
        setDiscount(prev => ({
            ...prev,
            amount: value
        }));
    };
console.log(discount.for_every_product_exept);

    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الخصومات :" />
            <section className="flex items-end justify-center flex-col  w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <div className="flex  items-start justify-center gap-4">
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
                                value={discount.amount}
                                onChange={handleAmount}
                                min={1}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <DateInputComponent
                        onChange={date => {
                            setDiscount(prev => ({
                                ...prev,
                                start_date: date
                            }))
                        }}
                        value={dayjs(discount.end_date, "YYYY-MM-DD")} />
                    <p className="relative text-end w-[250px]">:تاريخ البداية</p>
                </div>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <DateInputComponent
                        onChange={date => {
                            setDiscount(prev => ({
                                ...prev,
                                end_date: date
                            }))
                        }}
                        value={dayjs(discount.end_date, "YYYY-MM-DD")} />
                    <p className="relative text-end w-[250px]">:تاريخ النهاية</p>
                </div>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <CheckInputComponent value={discount.for_every_product} onChange={value => setDiscount(prev => ({...prev , for_every_product : value}))}/>
                    <p className="relative text-end w-[250px]"> : خصم على كل المنتجات</p>
                </div>
                {
                    !discount.for_every_product &&
                    <>
                <div className="flex items-start justify-end py-5">
                    {/* <p className="relative text-center">{vecation.end_date}</p> */}
                    <CheckInputComponent value={discount.for_every_product_exept} onChange={value => setDiscount(prev => ({...prev , for_every_product_exept : value}))}/>
                    <p className="relative text-end w-[250px]"> : خصم على كل المنتجات ما عدا المنتجات التالية</p>
                </div>
                <ButtonComponent variant={"create"} textButton="اضافة منتج" onClick={() => { setShowDiscountProduct(true) }} />
                <div className="relative w-full flex justify-center items-center py-5">

                    <DataTable columns={discount_products_columns} rows={discount.discount_products} />
                </div>
                <ButtonComponent variant={"create"} textButton="اضافة صنف" onClick={() => { setShowDiscountCategory(true) }} />
                <div className="relative w-full flex justify-center items-center py-5">

                    <DataTable columns={discount_categories_columns} rows={discount.discount_categories} />
                </div>
                    </>
                }
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"create"} onClick={() => { addDiscount() }} />
                    {/* <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} /> */}
                </div>
            </section>
            {
                showAddDiscountProduct &&
                <AddDiscountProduct back={() => setShowDiscountProduct(false)} setDiscount={setDiscount} />
            }
            {
                showAddDiscountCategory &&
                <AddDiscountCategory back={() => setShowDiscountCategory(false)} setDiscount={setDiscount} />
            }
        </main>
    );
}

export default AddDiscount;
