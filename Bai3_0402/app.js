/**
 * Dashboard Quản lý Sản phẩm - Bai3_0402
 * API: https://api.escuelajs.co/api/v1/products
 */

const API_PRODUCTS = 'https://api.escuelajs.co/api/v1/products';

/** Danh sách sản phẩm gốc từ API (dùng cho tìm kiếm, phân trang, sắp xếp) */
let allProducts = [];

/** Phân trang: trang hiện tại (1-based), số item mỗi trang */
let currentPage = 1;
let pageSize = 10;

/** Sắp xếp: cột đang chọn ('title' | 'price'), hướng 'asc' | 'desc' */
let sortBy = '';
let sortDir = 'asc';

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
 * Lấy danh sách đang áp dụng filter (tìm kiếm)
 */
function getFilteredProducts() {
    var keyword = document.getElementById('searchTitle');
    var k = keyword ? keyword.value : '';
    return filterProductsByTitle(allProducts, k);
}

/**
 * Sắp xếp mảng sản phẩm theo sortBy và sortDir (không thay đổi mảng gốc)
 */
function sortProducts(products, by, dir) {
    if (!by || !products || products.length === 0) return products.slice();
    var arr = products.slice();
    var isAsc = dir === 'asc';
    if (by === 'title') {
        arr.sort(function (a, b) {
            var x = (a.title != null) ? String(a.title) : '';
            var y = (b.title != null) ? String(b.title) : '';
            return isAsc ? x.localeCompare(y) : y.localeCompare(x);
        });
    } else if (by === 'price') {
        arr.sort(function (a, b) {
            var x = Number(a.price);
            var y = Number(b.price);
            if (isNaN(x)) x = 0;
            if (isNaN(y)) y = 0;
            return isAsc ? x - y : y - x;
        });
    }
    return arr;
}

/**
 * Lấy danh sách đã filter + sắp xếp (dùng cho phân trang và export)
 */
function getDisplayProducts() {
    var filtered = getFilteredProducts();
    return sortProducts(filtered, sortBy, sortDir);
}

/**
 * Cập nhật icon sắp xếp trên header
 */
function updateSortIcons() {
    var titleIcon = document.getElementById('sortTitleIcon');
    var priceIcon = document.getElementById('sortPriceIcon');
    if (titleIcon) titleIcon.textContent = sortBy === 'title' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
    if (priceIcon) priceIcon.textContent = sortBy === 'price' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
}

/**
 * Áp dụng phân trang + filter + sắp xếp và cập nhật bảng
 */
function applyPagination() {
    var display = getDisplayProducts();
    var total = display.length;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    var start = (currentPage - 1) * pageSize;
    var pageProducts = display.slice(start, start + pageSize);

    renderProductTable(pageProducts);
    updateSortIcons();

    var pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.textContent = 'Trang ' + currentPage + ' / ' + totalPages;

    var btnPrev = document.getElementById('btnPrev');
    var btnNext = document.getElementById('btnNext');
    if (btnPrev) {
        btnPrev.disabled = currentPage <= 1;
        btnPrev.closest('.page-item').classList.toggle('disabled', currentPage <= 1);
    }
    if (btnNext) {
        btnNext.disabled = currentPage >= totalPages;
        btnNext.closest('.page-item').classList.toggle('disabled', currentPage >= totalPages);
    }
}

/**
 * Áp dụng tìm kiếm (reset về trang 1) và cập nhật bảng
 */
function applySearch() {
    currentPage = 1;
    applyPagination();
}

/**
 * Khởi tạo: load dữ liệu, hiển thị, gắn sự kiện tìm kiếm và phân trang
 */
async function init() {
    allProducts = await fetchProducts();

    var searchInput = document.getElementById('searchTitle');
    if (searchInput) searchInput.addEventListener('input', applySearch);

    var pageSizeSelect = document.getElementById('pageSize');
    if (pageSizeSelect) {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        pageSizeSelect.addEventListener('change', function () {
            pageSize = parseInt(this.value, 10) || 10;
            currentPage = 1;
            applyPagination();
        });
    }

    var btnPrev = document.getElementById('btnPrev');
    var btnNext = document.getElementById('btnNext');
    if (btnPrev) btnPrev.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            applyPagination();
        }
    });
    if (btnNext) btnNext.addEventListener('click', function () {
        var display = getDisplayProducts();
        var totalPages = Math.max(1, Math.ceil(display.length / pageSize));
        if (currentPage < totalPages) {
            currentPage++;
            applyPagination();
        }
    });

    var sortTitle = document.getElementById('sortTitle');
    var sortPrice = document.getElementById('sortPrice');
    if (sortTitle) sortTitle.addEventListener('click', function () {
        if (sortBy === 'title') sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortBy = 'title'; sortDir = 'asc'; }
        currentPage = 1;
        applyPagination();
    });
    if (sortPrice) sortPrice.addEventListener('click', function () {
        if (sortBy === 'price') sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortBy = 'price'; sortDir = 'asc'; }
        currentPage = 1;
        applyPagination();
    });

    applyPagination();
}

init();
