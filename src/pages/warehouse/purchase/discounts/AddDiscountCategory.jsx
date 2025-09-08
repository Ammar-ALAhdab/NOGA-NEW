import { useEffect, useState } from "react";
import MainProductsTable from "../../../../components/table/MainProductsTable";
import ButtonComponent from "../../../../components/buttons/ButtonComponent";
import { axiosPrivate } from "../../../../api/axios";
import DropDownComponent from "../../../../components/inputs/DropDownComponent";
import LoadingSpinner from "../../../../components/actions/LoadingSpinner";


function AddDiscountCategory({ back, setDiscount }) {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categoriesError, setGetCategoriesError] = useState([])
    const [loadingCategoryOptions, setLoadingCategoryOptions] = useState(false)
    const [categoryOptionsError, setGetCategoryOptionsError] = useState([])
    const [categoryOptions, setCategoryOptions] = useState([])

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedCategoryOptios, setSelectedCategoryOptions] = useState([])
    const [rowSelectionID, setRowSelectionID] = useState([]);
    const [options, setOptions] = useState([])
    const handleSelectProduct = (newRowSelectionModel) => {
        setRowSelectionID(newRowSelectionModel);
    };

    const formatCategories = (categories) => {
        return categories.map(category => ({
            ...category,
            title: category.category
        }))
    }

    const getCategories = async (link = "products/categories") => {
        try {
            setLoadingCategories(true);
            setGetCategoriesError(null);
            const response = await axiosPrivate.get(link);
            console.log(response);
            setCategories(prev => [...prev, ...formatCategories(response.data.results)]);
            if (response.data.next) {
                getCategories(response.data.next);
            }
        } catch (error) {
            console.log(error);
            setGetCategoriesError(error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const getCategoryOptoins = async (link = `products/categories/${selectedCategory}/options`) => {
        try {
            setLoadingCategoryOptions(true);
            setGetCategoryOptionsError(null);
            const response = await axiosPrivate.get(link);
            console.log(response);
            setCategoryOptions(response.data);
        } catch (error) {
            console.log(error);
            setGetCategoryOptionsError(error);
        } finally {
            setLoadingCategoryOptions(false);
        }
    };
    useEffect(() => {
        if (selectedCategory) {
            // const allOptions = selectedCategory.variants.flatMap(variant => variant.options);
            // const uniqueOptions = allOptions.filter((option, index, self) =>
            //     index === self.findIndex(o =>
            //         o?.attribute === option?.attribute && o?.option === option?.option && o?.unit === option?.unit
            //     )
            // );
            // setOptions(uniqueOptions)

        }
    }
        , [selectedCategory])

    useEffect(() => {
        if (selectedCategory) {
            getCategoryOptoins()
        }
    }, [selectedCategory])
    console.log(categories);
    console.log(selectedCategory);
    console.log(categoryOptions);
    useEffect(() => {
        getCategories()
    }, [])
    const handleCategorySelect = (e) => {
        const { value } = e;
        setSelectedCategory(value);
    };
    useEffect(() => {
        if (categoryOptions) {

            const uniqueOptions = categoryOptions.filter((option, index, self) =>
                index === self.findIndex(o =>
                    o?.attribute === option?.attribute && o?.option === option?.option && o?.unit === option?.unit
                )
            );
            setOptions(uniqueOptions)

        }
    }
        , [categoryOptions])
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8  w-1/2  max-h-[90vh] overflow-y-auto">
                {/* {
                    !selectedCategory &&
                    <MainProductsTable
                        handleSelectProduct={handleSelectProduct}
                        rowSelectionID={rowSelectionID}
                        columns={columns}
                        link="/products"
                    />
                } */}
                <div className="flex items-start justify-center p-5">

                    <DropDownComponent
                        data={categories}
                        label={"التصنيف:"}
                        ButtonText={"التصنيف"}
                        id={"destination"}
                        dataValue="id"
                        dataTitle="title"
                        onSelectEvent={handleCategorySelect}
                    />


                </div>
                {
                    selectedCategory &&
                    <div className="relative w-full flex flex-col justify-start items-center pb-5">
                        <p className="relative pb-5"> اختر الخصائص المرادة</p>

                        <div className="relative w-2/3 flex flex-wrap justify-center items-center gap-1 ">
                            {
                                loadingCategoryOptions ?
                                    <LoadingSpinner />
                                    :

                                    options.length > 0 ?

                                        options.map(option =>
                                            <p className="relative text-sm  rounded-full border border-2 border-[#3457D5] p-1 cursor-pointer"
                                                style={selectedCategoryOptios?.filter(o => o.id == option.id).length > 0 ?
                                                    { background: '#3457D5', color: "#ffffff" } :
                                                    { background: '#ffffff', color: "#3457D5", fontWeight: 'bold' }}
                                                onClick={() => {
                                                    if (selectedCategoryOptios?.find(o => o.id == option.id)) {
                                                        setSelectedCategoryOptions(prev => prev.filter(o => o.id != option.id))

                                                    } else {
                                                        setSelectedCategoryOptions(prev => [...prev, option])

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
                    if (selectedCategoryOptios.length > 0) {
                        setSelectedCategoryOptions([])
                    }
                    else if (selectedCategory) {
                        setSelectedCategory(null)

                    }
                    else {
                        back()
                    }
                }} />
                <ButtonComponent onClick={() => {
                    if (selectedCategory) {
                        const TheCategory = categories.filter(c => c.id ==selectedCategory)[0]
                        setDiscount(prev => ({
                            ...prev,
                            discount_categories: [...prev.discount_categories, {
                                "id": selectedCategory,
                                "category": TheCategory.category,
                                "has_options": selectedCategoryOptios.length > 0,
                                "options": selectedCategoryOptios
                            }]

                        }))
                        back()
                    }
                }} />

            </div>

        </div>
    )
}


export default AddDiscountCategory;
