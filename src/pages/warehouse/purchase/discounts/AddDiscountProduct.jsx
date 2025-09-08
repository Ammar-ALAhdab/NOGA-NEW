import { useEffect, useState } from "react";
import MainProductsTable from "../../../../components/table/MainProductsTable";
import ButtonComponent from "../../../../components/buttons/ButtonComponent";


function AddDiscountProduct({ back, setDiscount }) {
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedProductOptios, setSelectedProductOptions] = useState([])
    const [rowSelectionID, setRowSelectionID] = useState([]);
    const [options, setOptions] = useState([])
    const handleSelectProduct = (newRowSelectionModel) => {
        setRowSelectionID(newRowSelectionModel);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "profilePhoto",
            headerName: "",
            width: 60,
            sortable: false,
            renderCell: (params) => (
                <div className="flex justify-center items-center h-full">
                    <img
                        src={params.row.profilePhoto}
                        alt="profile"
                        width={60}
                        height={60}
                        className="rounded-[50%] border-2 border-primary"
                    />
                </div>
            ),
        },
        {
            field: "productName",
            headerName: "اسم المنتج",
            flex: 1
        },
        {
            field: "category",
            headerName: "النوع",
            flex: 1
        },

        {
            field: "variantsCount",
            headerName: "عدد النسخ",
            flex: 1
        },
        {
            field: "options",
            headerName: "خيارات",
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <div className="flex items-center justify-center gap-2 h-full">
                    <ButtonComponent small onClick={() => {

                        // setDiscount(prev => ({
                        //     ...prev,
                        //     discount_products: prev.discount_products.append({
                        //         "product_name": params.row.product_name,
                        //         "product": params.row.id,
                        //         "has_options": false,
                        //     })
                        // }))
                        setSelectedProduct(params.row)

                    }} />

                </div>
            ),
        },
    ];
    useEffect(() => {
        if (selectedProduct) {
            const allOptions = selectedProduct.variants.flatMap(variant => variant.options);
            const uniqueOptions = allOptions.filter((option, index, self) =>
                index === self.findIndex(o =>
                    o?.attribute === option?.attribute && o?.option === option?.option && o?.unit === option?.unit
                )
            );
            setOptions(uniqueOptions)

        }
    }
        , [selectedProduct])
    console.log(selectedProduct);
    console.log(selectedProductOptios);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8  w-1/2  max-h-[90vh] overflow-y-auto">
                {
                    !selectedProduct &&
                    <MainProductsTable
                        handleSelectProduct={handleSelectProduct}
                        rowSelectionID={rowSelectionID}
                        columns={columns}
                        link="/products"
                    />
                }
                {
                    selectedProduct &&
                    <div className="relative w-full flex flex-col justify-start items-center pb-5">
                        <p className="relative pb-5"> اختر الخصائص المرادة</p>

                        <div className="relative w-2/3 flex flex-wrap justify-center items-center gap-1 ">
                            {options.length > 0 ?

                                options.map(option =>
                                    <p className="relative text-sm  rounded-full border border-2 border-[#3457D5] p-1 cursor-pointer"
                                        style={selectedProductOptios?.filter(o => o.id == option.id).length > 0 ?
                                            { background: '#3457D5', color: "#ffffff" } :
                                            { background: '#ffffff', color: "#3457D5", fontWeight: 'bold' }}
                                        onClick={() => {
                                            if (selectedProductOptios?.find(o => o.id == option.id)) {
                                                setSelectedProductOptions(prev => prev.filter(o => o.id != option.id))

                                            } else {
                                                setSelectedProductOptions(prev => [...prev, option])

                                            }
                                        }}
                                    >
                                        {option.attribute + " : " + option.option + option.unit}
                                    </p>
                                )
                                :
                                <p> لا يوجد خصائص</p>
                            }

                        </div>
                    </div>

                }
                <ButtonComponent variant={"back"} onClick={() => {
                    if (selectedProductOptios.length > 0) {
                        setSelectedProductOptions([])
                    }
                    else if (selectedProduct) {
                        setSelectedProduct(null)

                    }
                    else {
                        back()
                    }
                }} />
                <ButtonComponent onClick={() => {
                    if(selectedProduct){
                        setDiscount(prev => ({
                            ...prev,
                            discount_products: [...prev.discount_products, {
                                "id": selectedProduct.id,
                                "product": selectedProduct.productName,
                                "has_options": selectedProductOptios.length > 0,
                                "options": selectedProductOptios
                            }]
                            
                        }))
                        back()
                    }
                }} />

            </div>

        </div>
    )
}


export default AddDiscountProduct;
