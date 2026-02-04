/**
 * Dashboard Quản lý Sản phẩm - Bai3_0402
 * API: https://api.escuelajs.co/api/v1/products
 */

const API_PRODUCTS = 'https://api.escuelajs.co/api/v1/products';

/** Danh sách sản phẩm gốc từ API (dùng cho tìm kiếm, sau này phân trang/sắp xếp) */
let allProducts = [];

/**
 * Lấy danh sách sản phẩm từ API
 */
async function fetchProducts() {
    try {
        const response = await fetch(API_PRODUCTS);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu từ API');
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi fetch products:', error);
        return [];
    }
}

/**
 * Hiển thị danh sách sản phẩm vào bảng (Bootstrap table)
 * Các cột: id, title, price, category.name, images (1 ảnh đại diện)
 */
function renderProductTable(products) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    disposeRowTooltips(tbody);

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có dữ liệu.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(function (product) {
        const categoryName = product.category ? product.category.name : '-';
        const imageUrl = getFirstImageUrl(product);

        const imgSrc = imageUrl ? String(imageUrl).replace(/"/g, '&quot;') : '';
        const imgTag = imgSrc
            ? `<img src="${imgSrc}" alt="${escapeHtml(product.title || 'Product')}" class="img-thumbnail" style="max-width: 60px; max-height: 60px; object-fit: cover;" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling && (this.nextElementSibling.style.display='inline');">
                   <span class="text-muted small" style="display: none;">Lỗi tải ảnh</span>`
            : '<span class="text-muted">-</span>';

        const description = product.description ? String(product.description).trim() : 'Không có mô tả';

        return `
            <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="false" title="${escapeAttr(description)}">
                <td>${product.id}</td>
                <td>${escapeHtml(product.title)}</td>
                <td>${product.price}</td>
                <td>${escapeHtml(categoryName)}</td>
                <td>${imgTag}</td>
            </tr>
        `;
    }).join('');

    initRowTooltips();
}

/** Hủy tooltip cũ trước khi render lại */
function disposeRowTooltips(tbody) {
    if (!tbody) return;
    tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        const instance = bootstrap.Tooltip.getInstance(el);
        if (instance) instance.dispose();
    });
}

/** Khởi tạo Bootstrap Tooltip cho các dòng bảng (hiển thị description khi hover) */
function initRowTooltips() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        new bootstrap.Tooltip(el);
    });
}

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** Escape cho thuộc tính HTML (title, data-*) để tránh vỡ attribute */
function escapeAttr(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Lấy URL ảnh đại diện (ảnh đầu tiên) từ product, an toàn với mảng/chuỗi */
function getFirstImageUrl(product) {
    const images = product.images;
    if (!images) return '';
    if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        return typeof first === 'string' ? first : '';
    }
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' ? parsed[0] : '';
        } catch (_) {
            return images;
        }
    }
    return '';
}

/**
 * Lọc sản phẩm theo title (real-time, không phân biệt hoa thường)
 */
function filterProductsByTitle(products, keyword) {
    if (!keyword || !String(keyword).trim()) return products;
    const k = String(keyword).trim().toLowerCase();
    return products.filter(function (p) {
        const title = p.title ? String(p.title).toLowerCase() : '';
        return title.indexOf(k) !== -1;
    });
}

/**
 * Áp dụng tìm kiếm và cập nhật bảng (gọi khi user nhập liệu)
 */
function applySearch() {
    const keyword = document.getElementById('searchTitle').value;
    const filtered = filterProductsByTitle(allProducts, keyword);
    renderProductTable(filtered);
}

/**
 * Khởi tạo: load dữ liệu, hiển thị, gắn sự kiện tìm kiếm
 */
async function init() {
    allProducts = await fetchProducts();
    renderProductTable(allProducts);

    var searchInput = document.getElementById('searchTitle');
    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
    }
}

init();
