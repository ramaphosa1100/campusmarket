
// GET THE SELL FORM

const sellForm = document.getElementById("sellForm");

// GET THE DONATION CHECKBOX AND PRICE INPUT

const donateItem = document.getElementById("donateItem");
const productPrice = document.getElementById("productPrice");


// ENABLE OR DISABLE PRICE INPUT

donateItem.addEventListener("change", function () {

    if (donateItem.checked) {

        productPrice.value = "";
        productPrice.disabled = true;

    } else {

        productPrice.disabled = false;

    }

});


// HANDLE FORM SUBMISSION

sellForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // GET FORM VALUES

    const title = document.getElementById("productName").value.trim();

    const category = document.getElementById("productCategory").value;

    const description = document.getElementById("productDescription").value.trim();

    const seller = document.getElementById("sellerName").value.trim();

    const phone = document.getElementById("sellerPhone").value.trim();

    const location = document.getElementById("sellerLocation").value.trim();

    const imageFile = document.getElementById("productImage").files[0];

    const isFree = donateItem.checked;

    const price = isFree ? 0 : Number(productPrice.value);


    // VALIDATE PRICE

    if (!isFree && (!productPrice.value || !Number.isFinite(price) || price < 0)) {

        alert("Please enter a valid product price.");

        return;

    }


    // VALIDATE IMAGE SIZE

    if (imageFile.size > 2 * 1024 * 1024) {

        alert("Please select an image smaller than 2MB.");

        return;

    }


    // READ THE IMAGE

    const reader = new FileReader();

    reader.onload = function () {

        const newProduct = {

            id: Date.now(),

            title: title,

            category: category,

            price: price,

            isFree: isFree,

            description: description,

            image: reader.result,

            seller: seller,

            phone: phone,

            location: location,

            createdAt: new Date().toISOString()

        };


        // GET EXISTING PRODUCTS

        const savedProducts =
            JSON.parse(localStorage.getItem("campusProducts")) || [];


        // ADD THE NEW PRODUCT

        savedProducts.push(newProduct);


        // SAVE PRODUCTS IN BROWSER STORAGE

        try {

            localStorage.setItem(
                "campusProducts",
                JSON.stringify(savedProducts)
            );

            alert("Your item has been saved successfully!");

            sellForm.reset();
            productPrice.disabled = false;

        } catch (error) {

            alert("Storage is full. Please use a smaller image or clear old test listings.");

        }

    };


    reader.onerror = function () {

        alert("Unable to read the selected image.");

    };


    reader.readAsDataURL(imageFile);

});
// ======================================
// CAMPUSMARKET - SELL PRODUCT
// SUPABASE INTEGRATION
// ======================================

// GET THE SELL FORM






// ======================================
// ENABLE OR DISABLE PRICE INPUT
// ======================================

donateItem.addEventListener("change", function () {

    if (donateItem.checked) {

        productPrice.value = "";
        productPrice.disabled = true;

    } else {

        productPrice.disabled = false;

    }

});


// ======================================
// HANDLE FORM SUBMISSION
// ======================================

sellForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // PREVENT MULTIPLE SUBMISSIONS

    const submitButton = sellForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Uploading...";


    try {

        // ======================================
        // GET LOGGED-IN STUDENT
        // ======================================

        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        const user = sessionData.session?.user;

        if (!user) {

            alert("Please log in before selling a product.");

            window.location.href = "login.html";

            return;

        }


        // ======================================
        // GET FORM VALUES
        // ======================================

        const title = document.getElementById("productName").value.trim();

        const category = document.getElementById("productCategory").value;

        const description = document.getElementById("productDescription").value.trim();

        const seller = document.getElementById("sellerName").value.trim();

        const phone = document.getElementById("sellerPhone").value.trim();

        const location = document.getElementById("sellerLocation").value.trim();

        const imageFile = document.getElementById("productImage").files[0];

        const isFree = donateItem.checked;

        const price = isFree ? 0 : Number(productPrice.value);


        // ======================================
        // VALIDATE PRICE
        // ======================================

        if (!isFree && (
            productPrice.value === "" ||
            !Number.isFinite(price) ||
            price < 0
        )) {

            throw new Error("Please enter a valid product price.");

        }


        // ======================================
        // VALIDATE IMAGE
        // ======================================

        if (!imageFile) {

            throw new Error("Please select a product image.");

        }

        if (imageFile.size > 2 * 1024 * 1024) {

            throw new Error("Please select an image smaller than 2MB.");

        }

        if (!imageFile.type.startsWith("image/")) {

            throw new Error("Please select a valid image file.");

        }


        // ======================================
        // UPLOAD IMAGE TO SUPABASE STORAGE
        // ======================================

        const fileExtension = imageFile.name.split(".").pop();

        const fileName =
            `${crypto.randomUUID()}.${fileExtension}`;

        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("product-images")
            .upload(filePath, imageFile, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {

            throw uploadError;

        }


        // ======================================
        // GET PUBLIC IMAGE URL
        // ======================================

        const { data: imageData } = supabaseClient.storage
            .from("product-images")
            .getPublicUrl(filePath);

        const imageUrl = imageData.publicUrl;


        // ======================================
        // SAVE PRODUCT IN SUPABASE DATABASE
        // ======================================

        const { data: productData, error: databaseError } =
            await supabaseClient
                .from("products")
                .insert({

                    seller_id: user.id,

                    title: title,

                    category: category,

                    price: price,

                    is_free: isFree,

                    description: description,

                    image_url: imageUrl,

                    seller_name: seller,

                    seller_phone: phone,

                    seller_location: location

                })
                .select()
                .single();


        if (databaseError) {

            throw databaseError;

        }


        // ======================================
        // SUCCESS
        // ======================================

        console.log("Product uploaded successfully:", productData);

        alert("Your product has been uploaded successfully!");

        sellForm.reset();

        productPrice.disabled = false;


    } catch (error) {

        console.error("Product upload error:", error);

        alert("Upload failed: " + error.message);


    } finally {

        // RESTORE SUBMIT BUTTON

        submitButton.disabled = false;
        submitButton.textContent = "Submit Product";

    }

});

