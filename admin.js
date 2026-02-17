(function() {
    const STORAGE_KEY = 'shukri_products';
    const ADMIN_PASSWORD = 'iphone326355';

    // Password protection
    const userPwd = prompt("Fadlan geli password-ka maamulka:");
    if (userPwd !== ADMIN_PASSWORD) {
        alert("Password khaldan! Lagugu celin store-ka.");
        window.location.href = 'index.html';
    }

    function loadProducts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    function saveProducts(products) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    function renderAdmin(products) {
        const container = document.getElementById('mainContainer');
        const formDiv = document.getElementById('adminForm');
        if (!formDiv) return;

        formDiv.innerHTML = '';
        if (products.length === 0) {
            formDiv.innerHTML = '<p style="text-align:center; font-size:1.3rem; color:#8b6c51;">Wax alaab ah ma jirto. Ku dar cusub.</p>';
        } else {
            products.forEach(prod => {
                appendProductEditor(prod, formDiv);
            });
        }

        // Re-attach delete events
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const editor = e.target.closest('.product-editor');
                if (!editor) return;
                const id = parseInt(editor.dataset.id);
                if (confirm("Ma hubtaa inaad tirtirto alaabtan?")) {
                    let products = loadProducts();
                    products = products.filter(p => p.id !== id);
                    saveProducts(products);
                    renderAdmin(products);
                }
            });
        });

        // Attach file input change events for preview
        document.querySelectorAll('.prod-image-file').forEach(input => {
            input.addEventListener('change', function(event) {
                const file = event.target.files[0];
                const preview = this.closest('.form-group').querySelector('.image-preview');
                if (file && preview) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    function appendProductEditor(prod, parent) {
        const editor = document.createElement('div');
        editor.className = 'product-editor';
        editor.dataset.id = prod.id;
        editor.dataset.oldImage = prod.image || '';
        editor.innerHTML = `
            <button class="delete-product" title="Tirtir alaabta">🗑️ Tirtir</button>
            <div class="editor-title">📦 ${prod.name.substring(0,20)} (ID: ${prod.id})</div>
            <div class="form-group">
                <label>Magaca alaabta</label>
                <input type="text" class="prod-name" value="${prod.name.replace(/"/g, '&quot;')}">
            </div>
            <div class="form-group">
                <label>Qiimaha asalka ($)</label>
                <input type="number" step="0.01" min="0" class="prod-price" value="${prod.price}">
            </div>
            <div class="form-group">
                <label>Dheero % (0 ilaa 100)</label>
                <input type="number" min="0" max="100" step="1" class="prod-discount" value="${prod.discount}">
            </div>
            <div class="form-group">
                <label>Sawir (ka soo qaad telefoonka)</label>
                <input type="file" accept="image/*" class="prod-image-file" data-id="${prod.id}">
                <img class="image-preview" src="${prod.image || 'https://via.placeholder.com/150/f7ede4/9b7f69?text=sawir'}" id="preview-${prod.id}">
            </div>
        `;
        parent.appendChild(editor);
    }

    // Initial render
    let products = loadProducts();
    renderAdmin(products);

    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        const newId = Date.now();
        const newProduct = {
            id: newId,
            name: 'Alaab cusub',
            price: 0,
            discount: 0,
            image: ''
        };
        products.push(newProduct);
        renderAdmin(products); // re-render to include new editor
    });

    // Save button
    document.getElementById('saveAdminBtn').addEventListener('click', () => {
        const editors = document.querySelectorAll('.product-editor');
        const updatedProducts = [];
        editors.forEach(editor => {
            const id = parseInt(editor.dataset.id);
            const name = editor.querySelector('.prod-name').value.trim() || `Alaab ${id}`;
            const price = parseFloat(editor.querySelector('.prod-price').value) || 0;
            const discount = parseInt(editor.querySelector('.prod-discount').value) || 0;
            const previewImg = editor.querySelector('.image-preview');
            const fileInput = editor.querySelector('.prod-image-file');
            const oldImage = editor.dataset.oldImage || '';
            let finalImage = previewImg.src;
            if (fileInput.files.length === 0) {
                if (oldImage) finalImage = oldImage;
            }
            if (finalImage.startsWith('http') && !finalImage.startsWith('data:')) {
                finalImage = '';
            }
            updatedProducts.push({
                id: id,
                name: name,
                price: price,
                discount: discount,
                image: finalImage
            });
        });
        saveProducts(updatedProducts);
        products = updatedProducts; // update local variable
        const msgDiv = document.createElement('div');
        msgDiv.className = 'success-msg';
        msgDiv.innerText = '✅ Alaabta waa la kaydiyay!';
        document.getElementById('mainContainer').insertBefore(msgDiv, document.querySelector('.button-group').nextSibling);
        setTimeout(() => msgDiv.remove(), 3000);
    });

    // Clear all button
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (confirm("Ma hubtaa inaad tirtirto dhammaan alaabta?")) {
            saveProducts([]);
            products = [];
            renderAdmin([]);
        }
    });
})();