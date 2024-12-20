let locationArr = document.location.pathname.split("/")

let loc = locationArr.at(-1)

if (loc === "index.html") {
    let homeBtn = document.getElementById("home")
    homeBtn.classList.add("active")
} else if (loc === "constructor.html") {
    let searchBtn = document.getElementById("search")
    searchBtn.classList.add("active")
} else if (loc === "addToCart.html") {
    let addToCartBtn = document.getElementById("shopping-bag");
    addToCartBtn.classList.add("active")
}
else if (loc === "review.html") {
    let reviewBtn = document.getElementById("reviews");
    reviewBtn.classList.add("active")
}