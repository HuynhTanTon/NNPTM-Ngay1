//câu 1  khai báo constructor Product
function Product(id, name, price, quantity, category, isAvailable) {
    this.id = id;                 
    this.name = name;             
    this.price = price;           
    this.quantity = quantity;     
    this.category = category;     
    this.isAvailable = isAvailable; 
}

//câu 2 khởi tạo mảng products
let products = [
    new Product(1, "iPhone 15 Pro", 35000000, 5, "Phone", true),
    new Product(2, "Samsung Galaxy S24", 28000000, 3, "Phone", true),
    new Product(3, "MacBook Air M2", 32000000, 0, "Laptop", true),
    new Product(4, "AirPods Pro", 6500000, 10, "Accessories", true),
    new Product(5, "Apple Watch", 12000000, 4, "Accessories", false),
    new Product(6, "Dell XPS 13", 30000000, 2, "Laptop", true)
]

// câu 3 tạo mảng mới chỉ chứa name và price 
let nameAndPrice = products.map(p => ({
    name: p.name,     
    price: p.price   
}));
console.log("Câu 3:", nameAndPrice);

//câu 4 Lọc sản phẩm còn hàng trong kho
let inStockProducts = products.filter(p => p.quantity > 0);
console.log("Câu 4:", inStockProducts);

//câu 5 iểm tra có ít nhất 1 sản phẩm
let hasExpensiveProduct = products.some(p => p.price > 30000000);
console.log("Câu 5:", hasExpensiveProduct);

//câu 6 Kiểm tra tất cả sản phẩm 
let accessoriesAvailable = products
    .filter(p => p.category === "Accessories")
    .every(p => p.isAvailable === true);

console.log("Câu 6:", accessoriesAvailable);

//câu 7 Tính tổng giá trị kho hàng
let totalInventoryValue = products.reduce(
    (total, p) => total + p.price * p.quantity,
    0
);
console.log("Câu 7:", totalInventoryValue);

//câu 8  Duyệt mảng bằng for...of
console.log("Câu 8:");
for (let p of products) {
    let status = p.isAvailable ? "Đang bán" : "Ngừng bán";
    console.log(`${p.name} - ${p.category} - ${status}`);
}

// câu 9 Dùng for...in
console.log("Câu 9:");
let sampleProduct = products[0]; // lấy 1 sản phẩm bất kỳ
for (let key in sampleProduct) {
    console.log(key + ":", sampleProduct[key]);
}

// câu 10 Lấy danh sách tên sản phẩm
let sellingAndInStockNames = products
    .filter(p => p.isAvailable === true && p.quantity > 0)
    .map(p => p.name);

console.log("Câu 10:", sellingAndInStockNames);