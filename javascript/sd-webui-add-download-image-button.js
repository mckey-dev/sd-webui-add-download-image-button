// ================================================================================
// モーダル内の画像URLを取得する関数
// @returns {string|null} 画像URL、取得できない場合はnull
// ================================================================================
function _getModalImageUrl() {
    var modalImage = gradioApp().getElementById("modalImage");
    if (modalImage && modalImage.src) {
        return modalImage.src;
    }
    return null;
}

// ================================================================================
// ギャラリーの選択画像URLを取得する関数
// @param {string} tabname - タブ名（"txt2img" or "img2img"）
// @returns {string|null} 画像URL、取得できない場合はnull
// ================================================================================
function _getGalleryImageUrl(tabname) {
    var containerId = tabname ? tabname + "_gallery_container" : null;
    if (containerId && typeof gallery_container_buttons === "function" && typeof selected_gallery_index_id === "function") {
        var buttons = gallery_container_buttons(containerId);
        var index = selected_gallery_index_id(containerId);
        if (index < 0 && buttons.length > 0) {
            index = 0;  // 未選択時は最新（先頭）の画像
        }
        if (index >= 0 && index < buttons.length) {
            var img = buttons[index].querySelector ? buttons[index].querySelector("img") : buttons[index].children[0];
            if (img && img.src) {
                return img.src;
            }
        }
    }
    // フォールバック: 従来の selected_gallery_button（tabnameが指定されている場合のみ）
    if (tabname && typeof selected_gallery_button === "function") {
        var selectedBtn = selected_gallery_button();
        if (selectedBtn) {
            var img = selectedBtn.querySelector ? selectedBtn.querySelector("img") : (selectedBtn.children && selectedBtn.children[0]);
            if (img && img.src) {
                return img.src;
            }
        }
    }
    return null;
}

// ================================================================================
// 画像をダウンロードする関数
// @param {string} [source] - "modal" の場合はモーダル画像、"txt2img"/"img2img" の場合はギャラリー選択画像
// @returns {void}
// ================================================================================
function _downloadImage(source) {
    try {
        var imgSrc = null;
        if (source === "modal") {
            imgSrc = _getModalImageUrl();
        } else if (source === "txt2img" || source === "img2img") {
            imgSrc = _getGalleryImageUrl(source);
        }
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
// ライトボックス（lightboxModal）が開いているか（表示中か）を返す
// @returns {boolean}
// ================================================================================
function _isLightboxOpenForDownload() {
    var lb = gradioApp().getElementById("lightboxModal");
    return lb && lb.style.display !== "none";
}

// ================================================================================
// 現在表示中の txt2img / img2img タブを返す（ギャラリー画像のダウンロード元判定）
// @returns {string|null} "txt2img" または "img2img"、どちらでもない場合は null
// ================================================================================
function _getActiveGalleryTabForDownload() {
    var tabTxt2Img = gradioApp().getElementById("tab_txt2img");
    var tabImg2Img = gradioApp().getElementById("tab_img2img");
    if (tabTxt2Img && tabTxt2Img.style.display != "none") {
        return "txt2img";
    }
    if (tabImg2Img && tabImg2Img.style.display != "none") {
        return "img2img";
    }
    return null;
}

// ================================================================================
// テキスト入力系の要素にフォーカスがあるか（ショートカット抑止用）
// @param {EventTarget|null} target - keydown 等の event.target
// @returns {boolean}
// ================================================================================
function _isTypingInField(target) {
    if (!target || !target.tagName) {
        return false;
    }
    var tag = target.tagName.toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return true;
    }
    return !!target.isContentEditable;
}

// Shift+S 用 keydown リスナーの二重登録を防ぐフラグ
var _downloadImageHotkeyBound = false;

// ================================================================================
// Shift+S で現在の画像をダウンロードする（モーダル優先、閉じているときはギャラリー選択に追随）
// @param {KeyboardEvent} event - キーダウンイベント（capture フェーズで渡す想定）
// @returns {void}
// ================================================================================
function _onDownloadImageHotkey(event) {
    if (!event.shiftKey || event.key.toLowerCase() !== "s") {
        return;
    }
    if (event.repeat) {
        return;
    }
    if (_isTypingInField(event.target)) {
        return;
    }

    var source = null;
    if (_isLightboxOpenForDownload()) {
        source = "modal";
    } else {
        source = _getActiveGalleryTabForDownload();
    }
    if (!source) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    _downloadImage(source);
}

// ================================================================================
// モーダル内の画像ダウンロードイベントを処理する関数
// @param {Event} event - クリックイベント
// @returns {void}
// ================================================================================
function _modalDownloadImage(event) {
    _downloadImage("modal");
    event.stopPropagation();
}

// ================================================================================
// ギャラリーボタン行にダウンロードボタンを追加する関数
// @returns {void}
// ================================================================================
function _addGalleryDownloadButtons() {
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
            _downloadImage(tabname);  // tabname は "txt2img" または "img2img" → ギャラリー画像を取得
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
function _addDownloadButton() {
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
    modalDownload.addEventListener("click", _modalDownloadImage, true);
    modalDownload.title = "Download Image";

    // modalSaveの後にダウンロードボタンを挿入
    modalSave.parentNode.insertBefore(modalDownload, modalSave.nextSibling);
}

// ================================================================================
// UI 読み込み完了時（onUiLoaded コールバック）: ダウンロード UI の挿入と Shift+S 登録
// @returns {void}
// ================================================================================
onUiLoaded(function () {
    console.log("sd-webui-add-download-image-button onUiLoaded called");
    _addDownloadButton();
    _addGalleryDownloadButtons();
    if (!_downloadImageHotkeyBound) {
        _downloadImageHotkeyBound = true;
        document.addEventListener("keydown", _onDownloadImageHotkey, true);
    }
});

// ================================================================================
