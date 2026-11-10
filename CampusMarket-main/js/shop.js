
// ======================================
// CAMPUSMARKET - SHOP
// SUPABASE DATABASE INTEGRATION
// ======================================


// SELECT THE SHOP ELEMENTS

const shopSearch = document.getElementById("shopSearch");

const filterButtons = document.querySelectorAll(".filter-btn");

const freeFilter = document.getElementById("freeFilter");

const shopProductsContainer = document.getElementById("shopProducts");

const productCount = document.getElementById("productCount");

const noShopResults = document.getElementById("noShopResults");


// STORE THE SELECTED CATEGORY

let selectedCategory = "All";


// ======================================
// LOAD PRODUCTS FROM SUPABASE
// ======================================

async function loadStudentProducts() {

    try {

        // CLEAR EXISTING DYNAMIC PRODUCTS

        shopProductsContainer.innerHTML = "";

        // FETCH PRODUCTS FROM DATABASE

        const { data: products, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {

            throw error;

        }


        // DISPLAY EACH PRODUCT

        products.forEach(function(product) {

            // CREATE PRODUCT COLUMN

            const productColumn = document.createElement("div");

            productColumn.className =
                "col-12 col-sm-6 col-lg-4 shop-product";

            productColumn.dataset.category = product.category;

            productColumn.dataset.free =
                product.is_free ? "true" : "false";


            // CREATE PRODUCT CARD

            const productCard = document.createElement("div");

            productCard.className = "product-card";


            // PRODUCT IMAGE

            const productImage = document.createElement("img");

            productImage.src = product.image_url;

            productImage.alt = product.title;


            // PRODUCT INFORMATION

            const productInfo = document.createElement("div");

            productInfo.className = "product-info";


            // CATEGORY

            const category = document.createElement("span");

            category.className = "product-category";

            category.textContent = product.category;


            // PRODUCT TITLE

            const title = document.createElement("h5");

            title.textContent = product.title;


            // PRODUCT PRICE

            const price = document.createElement("p");

            price.className = "product-price";

            price.textContent = product.is_free
                ? "FREE / DONATE"
                : "GH₵ " + Number(product.price).toFixed(2);


            // VIEW DETAILS LINK

            const detailsLink = document.createElement("a");

            detailsLink.href =
                "product.html?id=" + encodeURIComponent(product.id);

            detailsLink.className = "product-link";

            detailsLink.textContent = "View Details";


            // PUT EVERYTHING TOGETHER

            productInfo.appendChild(category);

            productInfo.appendChild(title);

            productInfo.appendChild(price);

            productInfo.appendChild(detailsLink);

            productCard.appendChild(productImage);

            productCard.appendChild(productInfo);

            productColumn.appendChild(productCard);

            shopProductsContainer.appendChild(productColumn);

        });


        // APPLY FILTERS AFTER LOADING

        filterProducts();

        console.log("Products retrieved from Supabase:", products);


    } catch (error) {

        console.error("Product loading error:", error);

        shopProductsContainer.innerHTML =
            "<p>Unable to load products. Please try again.</p>";

    }

}


// ======================================
// FILTER PRODUCTS
// ======================================

function filterProducts() {

    const searchTerm = shopSearch.value.toLowerCase().trim();

    const shopProducts =
        document.querySelectorAll(".shop-product");

    let visibleProducts = 0;


    shopProducts.forEach(function(product) {

        const category = product.dataset.category;

        const name =
            product.querySelector("h5").textContent.toLowerCase();

        const isFree = product.dataset.free === "true";


        const matchesCategory =
            selectedCategory === "All" ||
            category === selectedCategory;


        const matchesSearch =
            name.includes(searchTerm) ||
            category.toLowerCase().includes(searchTerm);


        const matchesFree =
            !freeFilter.checked || isFree;


        if (matchesCategory && matchesSearch && matchesFree) {

            product.style.display = "";

            visibleProducts++;

        } else {

            product.style.display = "none";

        }

    });


    productCount.textContent = visibleProducts + " products";

    noShopResults.style.display =
        visibleProducts === 0 ? "block" : "none";

}


// ======================================
// CATEGORY BUTTONS
// ======================================

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        filterButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        filterProducts();

    });

});


// ======================================
// SEARCH INPUT
// ======================================

shopSearch.addEventListener("input", filterProducts);


// ======================================
// FREE ITEM FILTER
// ======================================

freeFilter.addEventListener("change", filterProducts);


// ======================================
// CHECK CATEGORY IN URL
// ======================================

const urlParameters =
    new URLSearchParams(window.location.search);

const requestedCategory =
    urlParameters.get("category");

if (requestedCategory) {

    const matchingButton = Array.from(filterButtons).find(function(button) {

        return button.dataset.category.toLowerCase() ===
            requestedCategory.toLowerCase();

    });

    if (matchingButton) {

        matchingButton.click();

    }

}


// ======================================
// START THE SHOP
// ======================================

loadStudentProducts();
