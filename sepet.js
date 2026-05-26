document.addEventListener('DOMContentLoaded', () => {
    const sideCart = document.getElementById('sideCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const sideCartBody = document.querySelector('.side-cart-body');
    const sideCartTotal = document.querySelector('.cart-total strong');
    
    // Tarayıcının eski bozuk hafızası varsa onu ZORLA sildirir
    let eskiHafiza = localStorage.getItem('makingOfCart');
    if (eskiHafiza && !eskiHafiza.startsWith('[')) {
        localStorage.removeItem('makingOfCart');
    }

    // Listeyi Başlat (Artık tek bir obje değil, alt alta eklenecek bir liste)
    let sepetHafizasi = JSON.parse(localStorage.getItem('makingOfCart')) || [];

    // Fiyatları Kusursuz Toplama Matematiği
    function hesaplaToplam() {
        let toplam = 0;
        sepetHafizasi.forEach(urun => {
            let temizFiyat = urun.price.replace(/[^0-9,]/g, '').replace(',', '.');
            toplam += parseFloat(temizFiyat || 0);
        });
        return toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
    }

    // Arayüzü Çizen Fonksiyon
    function sepetiGuncelle() {
        if (!sideCartBody) return;

        if (sepetHafizasi.length === 0) {
            sideCartBody.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #555; text-align: center; gap: 15px; margin-top: 50px;">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 600; color: #fff;">Sepetiniz şu an boş.</span>
                </div>
            `;
            if (sideCartTotal) sideCartTotal.textContent = "0,00 TL";
        } else {
            let htmlIcerik = '';
            // Sepetteki ürünleri alt alta diziyoruz
            sepetHafizasi.forEach((urun, index) => {
                htmlIcerik += `
                    <div class="cart-item" style="position: relative; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; margin-bottom: 15px;">
                        <img src="${urun.img}" alt="${urun.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h4 style="margin-right: 20px;">${urun.name}</h4>
                            <span class="cart-item-size">${urun.size}</span>
                            <span class="cart-item-price">${urun.price}</span>
                        </div>
                        <button class="remove-item-btn" data-index="${index}" style="position: absolute; right: 0; top: 0; background: none; border: none; color: #666; cursor: pointer; font-size: 16px; transition: color 0.2s;">✕</button>
                    </div>
                `;
            });
            sideCartBody.innerHTML = htmlIcerik;
            if (sideCartTotal) sideCartTotal.textContent = hesaplaToplam();

            // SİLME BUTONUNA BEYİN EKLEME
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    let silinecekSira = this.getAttribute('data-index');
                    sepetHafizasi.splice(silinecekSira, 1); 
                    localStorage.setItem('makingOfCart', JSON.stringify(sepetHafizasi)); 
                    sepetiGuncelle(); 
                });
            });
        }
    }

    sepetiGuncelle();

    // Üst Menüdeki Çantaya Tıklanınca Açılması
    const headerCartBtns = document.querySelectorAll('.cart-container, .icon-bag');
    headerCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sepetiGuncelle();
            if (sideCart) sideCart.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('active');
        });
    });

    // Beden Seçme Mantığı
    const sizeButtons = document.querySelectorAll('.size-options span:not(.disabled)');
    sizeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sizeGroup = this.closest('.size-options');
            sizeGroup.querySelectorAll('span').forEach(span => span.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // SEPETE EKLE BUTONUNA TIKLAYINCA LİSTEYE EKLEME (.push)
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImg = productCard.querySelector('.product-img').getAttribute('src');
            
            const activeSizeSpan = productCard.querySelector('.size-options span.active');
            let selectedSize = activeSizeSpan ? activeSizeSpan.textContent : (productCard.querySelector('.size-options span') ? productCard.querySelector('.size-options span').textContent : 'Tek Ebat');

            // KRİTİK NOKTA: Ürünü hafıza listesinin en altına ekliyoruz
            sepetHafizasi.push({
                name: productName,
                price: productPrice,
                img: productImg,
                size: selectedSize
            });

            localStorage.setItem('makingOfCart', JSON.stringify(sepetHafizasi));
            sepetiGuncelle();

            if (sideCart) sideCart.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('active');
        });
    });

    // Sepeti Kapatma İşlemleri
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            sideCart.classList.remove('open');
            cartOverlay.classList.remove('active');
        });
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            sideCart.classList.remove('open');
            cartOverlay.classList.remove('active');
        });
    }
});