// ================================================================================
// ダウンロード用の画像URLを取得する関数（モーダルまたはギャラリーの選択画像から）
// @returns {string|null} 画像URL、取得できない場合はnull
// ================================================================================
function getImageUrlForDownload() {
    var modalImage = gradioApp().getElementById("modalImage");
    if (modalImage && modalImage.src) {
        return modalImage.src;
    }
    if (typeof selected_gallery_button === "function") {
        var selectedBtn = selected_gallery_button();
        if (selectedBtn && selectedBtn.children && selectedBtn.children.length > 0) {
            var img = selectedBtn.children[0];
            if (img && img.src) {
                return img.src;
            }
        }
    }
    return null;
}

// ================================================================================
// 画像をダウンロードする関数（モーダルまたはギャラリーの選択画像）
// @returns {void}
// ================================================================================
function downloadImage() {
    try {
        var imgSrc = getImageUrlForDownload();
        if (!imgSrc) {
            console.warn("No image available for download");
            return;
        }

        // 画像のURLからファイル名を取得
        let filename = "image.png";
        try {
            const url = new URL(imgSrc);
            filename = url.pathname.split("/").pop() || filename;
        } catch (e) {
            console.warn("Failed to parse image URL:", e);
        }

        // 画像をダウンロードするためのリンクを作成
        const link = document.createElement("a");
        link.href = imgSrc;
        link.download = filename;

        // リンクをクリックしてダウンロードを開始
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Failed to download image:", e);
    }
}

// ================================================================================
// モーダル内の画像ダウンロードイベントを処理する関数
// @param {Event} event - クリックイベント
// @returns {void}
// ================================================================================
function modalDownloadImage(event) {
    downloadImage();
    event.stopPropagation();
}

// ================================================================================
// ギャラリーボタン行にダウンロードボタンを追加する関数
// @returns {void}
// ================================================================================
function addGalleryDownloadButtons() {
    ["txt2img", "img2img"].forEach(function (tabname) {
        var container = gradioApp().getElementById("image_buttons_" + tabname);
        if (!container || gradioApp().getElementById("gallery_download_" + tabname)) {
            return;
        }

        var formWrap = document.createElement("div");
        formWrap.className = "form";

        var downloadBtn = document.createElement("button");
        downloadBtn.type = "button";
        downloadBtn.id = "gallery_download_" + tabname;
        downloadBtn.className = "gradio-button tool";
        downloadBtn.innerHTML = "&#x2B73;";  // ⭳ ダウンロードアイコン（モーダルと統一）
        downloadBtn.title = "Download Image";
        downloadBtn.addEventListener("click", function (event) {
            downloadImage();
            event.stopPropagation();
        });

        formWrap.appendChild(downloadBtn);
        container.appendChild(formWrap);
    });
}

// ================================================================================
// モーダルにダウンロードボタンを追加する関数
// @returns {void}
// ================================================================================
function addDownloadButton() {
    // modal_save要素を先に取得
    const modalSave = gradioApp().getElementById("modal_save");
    console.log("modalSave element:", modalSave);
    
    if (!modalSave) {
        console.error("Warning: Do Not Found ElementById=modal_save");
        return;
    }

    // modal_saveの親要素をmodalControlsとして使用
    const modalControls = modalSave.parentNode;
    console.log("modalControls element:", modalControls);
    
    if (!modalControls) {
        console.error("Warning: Do Not Found modalControls parent");
        return;
    }

    // 既にダウンロードボタンが存在する場合は追加しない
    if (gradioApp().getElementById("modal_download")) {
        console.log("Download button already exists");
        return;
    }

    // ダウンロードボタンを作成
    const modalDownload = document.createElement("span");
    modalDownload.className = "modalDownload cursor";
    modalDownload.id = "modal_download";
    modalDownload.innerHTML = "&#x2B73;";
    modalDownload.addEventListener("click", modalDownloadImage, true);
    modalDownload.title = "Download Image";

    // modalSaveの後にダウンロードボタンを挿入
    modalSave.parentNode.insertBefore(modalDownload, modalSave.nextSibling);
}

// ================================================================================
// UIの読み込み完了時に実行される関数
// @returns {void}
// ================================================================================
onUiLoaded(function () {
    console.log("sd-webui-add-download-image-button onUiLoaded called");
    addDownloadButton();
    addGalleryDownloadButtons();
});

// ================================================================================
