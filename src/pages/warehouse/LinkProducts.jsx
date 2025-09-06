import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useGoToBack from "../../hooks/useGoToBack";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import Swal from "sweetalert2";
import SearchComponent from "../../components/inputs/SearchComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";
import DataTable from "../../components/table/DataTable";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";

function LinkProducts() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();

  // State management
  const [mainProduct, setMainProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [rowSelectionID, setRowSelectionID] = useState([]);

  // Fetch main product details
  const fetchMainProduct = async () => {
    try {
      const response = await axiosPrivate.get(`/products/${productId}`);
      setMainProduct(response.data);
    } catch (error) {
      console.error("Error fetching main product:", error);
      setError("Failed to fetch main product details");
    }
  };

  // Fetch all products for linking
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get("/products/");
      const products = response.data.results || [];

      // Filter out the current main product from the list
      const filteredProducts = products.filter(
        (product) => product.id !== parseInt(productId)
      );
      setAllProducts(filteredProducts);
      setFilteredProducts(filteredProducts);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(
          filteredProducts.map((product) => product.category.category)
        ),
      ];
      setCategories(uniqueCategories.map((cat) => ({ id: cat, title: cat })));
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  // Add selected products to linked products
  const addSelectedProducts = () => {
    const productsToAdd = allProducts.filter(
      (product) =>
        rowSelectionID.includes(product.id) &&
        !selectedProducts.some((selected) => selected.id === product.id)
    );

    const formattedProducts = productsToAdd.map((product) => ({
      id: product.id,
      profilePhoto:
        product.category.category.toLowerCase() === "phone" ? phone : accessor,
      productName: product.product_name,
      category: product.category.category,
      linkedProducts: product.linked_products || [],
    }));

    setSelectedProducts((prev) => [...prev, ...formattedProducts]);
    setRowSelectionID([]);
  };

  // Remove product from selected list
  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  };

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    filterProducts(searchValue, selectedCategory);
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterProducts(searchTerm, category);
  };

  // Filter products based on search and category
  const filterProducts = (search, category) => {
    let filtered = allProducts;

    if (search) {
      filtered = filtered.filter((product) =>
        product.product_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(
        (product) => product.category.category === category
      );
    }

    setFilteredProducts(filtered);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى اختيار منتجات للربط",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const linkedProductIds = selectedProducts.map((product) => product.id);

    const linkData = {
      product_name: mainProduct.product_name,
      category: mainProduct.category.id,
      linked_products: linkedProductIds,
    };

    Swal.fire({
      title: "هل أنت متأكد من ربط المنتجات؟",
      text: `سيتم ربط ${selectedProducts.length} منتج(ات) مع ${mainProduct.product_name}`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .post("/products/", linkData)
          .then(() => {
            Swal.fire({
              title: "تم ربط المنتجات بنجاح",
              icon: "success",
            });
            navigate("/warehouseAdmin/mainProducts");
          })
          .catch((error) => {
            console.error("Error linking products:", error);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ في ربط المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  // Table columns for available products
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
            src={
              params.row.category.category.toLowerCase() === "phone"
                ? phone
                : accessor
            }
            alt="product"
            width={60}
            height={60}
            className="rounded-[50%] border-2 border-primary"
          />
        </div>
      ),
    },
    {
      field: "product_name",
      headerName: "اسم المنتج",
      width: 200,
    },
    {
      field: "category",
      headerName: "النوع",
      width: 150,
      renderCell: (params) => params.row.category.category,
    },
    {
      field: "variants",
      headerName: "عدد النسخ",
      width: 100,
      renderCell: (params) => params.row.variants?.length || 0,
    },
  ];

  useEffect(() => {
    fetchMainProduct();
    fetchAllProducts();
  }, [productId]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full">
        <LoadingSpinner />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full">
        <NoDataError error={error} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`ربط منتجات مع ${mainProduct?.product_name || "المنتج"}`} />

      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        {/* Main Product Info */}
        <div className="w-full">
          <SectionTitle text="المنتج الرئيسي:" />
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={
                mainProduct?.category.category.toLowerCase() === "phone"
                  ? phone
                  : accessor
              }
              alt="main product"
              width={80}
              height={80}
              className="rounded-[50%] border-2 border-primary"
            />
            <div>
              <h3 className="text-xl font-bold text-primary">
                {mainProduct?.product_name}
              </h3>
              <p className="text-gray-600">
                النوع: {mainProduct?.category.category}
              </p>
              <p className="text-gray-600">
                عدد النسخ: {mainProduct?.variants?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="w-full flex flex-col gap-4">
          <SectionTitle text="اختيار المنتجات للربط:" />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchComponent
                placeholder="البحث عن منتج..."
                onSearch={handleSearch}
              />
            </div>
            <div className="w-48">
              <FilterDropDown
                data={categories}
                label="تصفية حسب النوع"
                ButtonText="جميع الأنواع"
                id="category"
                dataValue="id"
                dataTitle="title"
                onSelectEvent={(e) => handleCategoryFilter(e.value)}
              />
            </div>
          </div>
        </div>

        {/* Available Products Table */}
        <div className="w-full">
          <DataTable
            rows={filteredProducts}
            columns={columns}
            onRowSelectionModelChange={handleSelectProduct}
            rowSelectionModel={rowSelectionID}
            hideSelectRows={false}
          />

          <div className="flex justify-center mt-4">
            <ButtonComponent
              textButton="إضافة المنتجات المختارة"
              variant="add"
              onClick={addSelectedProducts}
              disabled={rowSelectionID.length === 0}
            />
          </div>
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="w-full">
            <SectionTitle text="المنتجات المختارة للربط:" />
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.profilePhoto}
                        alt="product"
                        width={50}
                        height={50}
                        className="rounded-[50%] border-2 border-primary"
                      />
                      <div>
                        <h4 className="font-semibold text-primary">
                          {product.productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedProduct(product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="إزالة المنتج"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 w-full mt-8">
          <ButtonComponent variant="back" onClick={handleClickBack} />
          <ButtonComponent
            textButton="ربط المنتجات"
            variant="procedure"
            onClick={handleSubmit}
            disabled={selectedProducts.length === 0}
          />
        </div>
      </section>
    </main>
  );
}

export default LinkProducts;
