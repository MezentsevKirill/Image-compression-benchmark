document.addEventListener("DOMContentLoaded", () => {

    const state = {
        image: {
            name: "lighthouse.png",
            src: "./assets/fb907.png",
            width: 512,
            height: 512,
            format: "PNG"
        },

        codec: "AGU",
        noiseType: "AWGN",
        noiseVariance: 0.01,
        compression: 25,
        colorMode: "BGR Channels",
        metric: "Encoding Time",
        divider: 50
    };


    // =============================
    // DOM ELEMENTS
    // =============================

    // const noiseType = document.querySelector("#noise-type");
    const noiseRange = document.querySelector("#noise-variance");
    const noiseNumber = document.querySelector(
        '.parameter input[aria-label="Noise Variance value"]'
    );

    const compressionRange =
        document.querySelector("#compression");

    const compressionNumber =
        document.querySelector(
            '.parameter input[aria-label="Compression Step (QS) value"]'
        );

    const colorSwitch =
        document.querySelector(".switch");

    const thumbnails =
        document.querySelectorAll(".thumbnail");

    const uploadButton =
        document.querySelector(".upload-button");

    const dropdown =
        document.querySelector("#codec-dropdown");

    const dropdownTrigger =
        document.querySelector("#codec-trigger");

    const dropdownLabel =
        document.querySelector(".selected-algorithm-label");

    const runButton =
        document.querySelector(".run-button");

    const comparison =
        document.querySelector(".comparison");

    const divider =
        document.querySelector(".divider");

    const dividerHandle =
        document.querySelector(".divider-handle");

    const beforeLayer =
        document.querySelector(".before-layer");

    const comparisonPosition =
        document.querySelector(
            ".comparison-meta span:last-child"
        );

    const algorithmBadge =
        document.querySelector(".algorithm-badge");

    const resultsHeading =
        document.querySelector(".results-heading");

    const resultCards =
        document.querySelectorAll(".result-card");

    const metricLine =
        document.querySelector(".metric-line");

    const selectedPoint =
        document.querySelector(".selected-point");

    const selectedPointLine =
        document.querySelector(".selected-point > line");

    const selectedPointCircle =
        document.querySelector(
            ".selected-point > circle"
        );

    const selectedPointCore =
        document.querySelector(
            ".selected-point > .selected-point-core"
        );

    const selectedPointLabel =
        document.querySelector(
            ".selected-point text"
        );

    const chartYAxisTitle =
        document.querySelector(".y-axis");

    const chartLegend =
        document.querySelector(".legend");

    const metricTabs =
        document.querySelectorAll(
            ".metric-tabs button"
        );

    const decodedImage =
        document.querySelector(
            ".decoded.comparison-image"
        );

    const originalImage =
        document.querySelector(
            ".before-layer .comparison-image"
        );

    const fileMetaName =
        document.querySelector(".file-meta strong");

    const fileMetaInfo =
        document.querySelector(".file-meta > span");


    // =============================
    // AVAILABLE IMAGES
    // =============================

    const images = [
        {
            name: "lighthouse.png",
            src: "./assets/fb907.png",
            width: 512,
            height: 512,
            format: "PNG"
        },

        {
            name: "forest-floor.png",
            src: "./assets/7795c.png",
            width: 512,
            height: 512,
            format: "PNG"
        },

        {
            name: "architecture.png",
            src: "./assets/38200.png",
            width: 512,
            height: 512,
            format: "PNG"
        }
    ];


    // =============================
    // AVAILABLE CODECS
    // =============================

    const codecs = [
        "AGU",
        "BPG",
        "HEIF",
        "AVIF",
        "JPEG"
    ];


    // =============================
    // METRIC CONFIGURATION
    // =============================

    const metricConfig = {

        "Encoding Time": {
            unit: "ms",
            min: 0,
            max: 200,
            yTitle: "Encoding Time (ms)"
        },

        "Peak RAM": {
            unit: "MB",
            min: 0,
            max: 200,
            yTitle: "Peak RAM (MB)"
        },

        "File Size": {
            unit: "KB",
            min: 0,
            max: 250,
            yTitle: "File Size (KB)"
        },

        "PSNR": {
            unit: "dB",
            min: 20,
            max: 50,
            yTitle: "PSNR (dB)"
        },

        "SSIM": {
            unit: "",
            min: 0,
            max: 1,
            yTitle: "SSIM"
        },

        "MSE": {
            unit: "",
            min: 0,
            max: 1000,
            yTitle: "MSE"
        },

        "PSNR-HVS": {
            unit: "dB",
            min: 20,
            max: 50,
            yTitle: "PSNR-HVS (dB)"
        },

        "PSNR-HVS-M": {
            unit: "dB",
            min: 20,
            max: 50,
            yTitle: "PSNR-HVS-M (dB)"
        }
    };


    // =============================
    // UTILITY FUNCTIONS
    // =============================

    function clamp(value, min, max) {
        return Math.min(
            Math.max(value, min),
            max
        );
    }


    function formatNumber(value, digits = 1) {
        return Number(value).toFixed(digits);
    }


    function updateRangeProgress(input) {

        const min = Number(input.min);
        const max = Number(input.max);
        const value = Number(input.value);

        const percent =
            ((value - min) / (max - min)) * 100;

        input.style.setProperty(
            "--range-progress",
            `${percent}%`
        );
    }


    // =============================
    // RANGE + NUMBER INPUT
    // =============================

    function syncRangeAndNumber(
        range,
        number,
        onChange
    ) {

        if (!range || !number) {
            return;
        }

        function update(value) {

            const min = Number(range.min);
            const max = Number(range.max);

            value = clamp(
                Number(value),
                min,
                max
            );

            range.value = value;
            number.value = value;

            updateRangeProgress(range);

            if (onChange) {
                onChange(value);
            }
        }


        range.addEventListener(
            "input",
            () => {
                update(range.value);
            }
        );


        number.addEventListener(
            "input",
            () => {

                if (number.value === "") {
                    return;
                }

                update(number.value);
            }
        );


        number.addEventListener(
            "change",
            () => {
                update(number.value);
            }
        );


        update(range.value);
    }


    // =============================
    // NOISE DROPDOWN
    // =============================

    syncRangeAndNumber(
        noiseRange,
        noiseNumber,
        (value) => {

            state.noiseVariance = value;

            updateComparisonMeta();
        }
    );

    const noiseTrigger = document.querySelector("#noise-trigger");
    const noiseLabel = document.querySelector(".selected-noise-label");
    const noiseDropdown = document.querySelector("#noise-dropdown");
    const noiseTypesList = ["None", "AWGN", "Poisson"];

    function createNoiseDropdown() {
        const menu = document.createElement("div");
        menu.className = "codec-menu";

        noiseTypesList.forEach((type) => {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "codec-option";
            option.innerHTML = `<span>${type}</span>`;

            option.addEventListener("click", () => {
                selectNoise(type);
                menu.classList.remove("open");
            });

            menu.appendChild(option);
        });

        noiseDropdown.appendChild(menu);

        noiseTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            menu.classList.toggle("open");
        });

        // ДОДАНО: Закриття списку шуму при кліку поза ним
        document.addEventListener("click", () => {
            menu.classList.remove("open");
        });
    }


    function selectNoise(type) {
        state.noiseType = type;
        noiseLabel.textContent = type;

        const disabled = state.noiseType === "None";
        noiseRange.disabled = disabled;
        noiseNumber.disabled = disabled;

        const noiseTreatment = document.querySelector(".noise-treatment");
        noiseTreatment.style.opacity = disabled
            ? "0"
            : String(Math.min(0.65, state.noiseVariance * 8));

        updateComparisonMeta();
    }

    // Ініціалізуємо список
    createNoiseDropdown();

    // =============================
    // COMPRESSION PARAMETER
    // =============================

    syncRangeAndNumber(
        compressionRange,
        compressionNumber,
        (value) => {

            state.compression = value;

            updateSelectedCompression();
        }
    );


    function updateSelectedCompression() {

        const qs =
            state.compression;


        algorithmBadge.childNodes[0]
            .nodeValue =
            `${state.codec} · QS ${qs} `;


        resultsHeading
            .querySelector("b")
            .textContent =
            `QS ${qs}`;


        updateDemoResults();

        updateChart();

        updateComparisonMeta();
    }


    // =============================
    // COLOR MODE
    // =============================

    colorSwitch.addEventListener(
        "click",
        () => {

            const enabled =
                colorSwitch.classList.toggle(
                    "on"
                );

            colorSwitch.setAttribute(
                "aria-checked",
                String(enabled)
            );

            state.colorMode =
                enabled
                    ? "BGR Channels"
                    : "Grayscale";


            const labels =
                colorSwitch
                    .parentElement
                    .querySelectorAll("span");


            if (labels.length >= 3) {

                labels[0].classList.toggle(
                    "active-label",
                    !enabled
                );

                labels[2].classList.toggle(
                    "active-label",
                    enabled
                );
            }


            updateComparisonMeta();
        }
    );


    // =============================
    // IMAGE SELECTION
    // =============================

    thumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.addEventListener(
                "click",
                () => {

                    if (!images[index]) {
                        return;
                    }

                    selectImage(
                        images[index],
                        index
                    );
                }
            );
        }
    );


    function selectImage(
        image,
        index = -1
    ) {

        state.image = {
            ...image
        };


        decodedImage.src =
            image.src;

        originalImage.src =
            image.src;


        fileMetaName.textContent =
            image.name;


        fileMetaInfo.innerHTML =
            `${image.format}<br>
             <b>
                ${image.width}x${image.height} px
             </b>`;


        thumbnails.forEach(
            (thumbnail, thumbnailIndex) => {

                thumbnail.classList.toggle(
                    "selected",
                    thumbnailIndex === index
                );
            }
        );


        updateComparisonMeta();
    }


    // =============================
    // CUSTOM IMAGE UPLOAD
    // =============================

    const fileInput =
        document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.hidden = true;

    document.body.appendChild(
        fileInput
    );


    uploadButton.addEventListener(
        "click",
        () => {

            fileInput.click();
        }
    );


    fileInput.addEventListener(
        "change",
        () => {

            const file =
                fileInput.files?.[0];

            if (!file) {
                return;
            }


            const objectUrl =
                URL.createObjectURL(file);


            const image =
                new Image();


            image.onload = () => {

                state.image = {

                    name: file.name,

                    src: objectUrl,

                    width:
                    image.naturalWidth,

                    height:
                    image.naturalHeight,

                    format:
                        file.type
                            .split("/")[1]
                            ?.toUpperCase()
                        || "IMAGE"
                };


                decodedImage.src =
                    objectUrl;

                originalImage.src =
                    objectUrl;


                fileMetaName.textContent =
                    file.name;


                fileMetaInfo.innerHTML =
                    `${state.image.format}<br>
                     <b>
                        ${image.naturalWidth}
                        x
                        ${image.naturalHeight}
                        px
                     </b>`;


                thumbnails.forEach(
                    (thumbnail) => {
                        thumbnail.classList.remove(
                            "selected"
                        );
                    }
                );


                updateComparisonMeta();
            };


            image.src =
                objectUrl;
        }
    );


    // =============================
    // CODEC DROPDOWN
    // =============================

    createCodecDropdown();


    function createCodecDropdown() {

        const menu =
            document.createElement(
                "div"
            );

        menu.className =
            "codec-menu";


        codecs.forEach(
            (codec) => {

                const option =
                    document.createElement(
                        "button"
                    );

                option.type = "button";

                option.className =
                    "codec-option";


                option.innerHTML = `
                    <i></i>
                    <span>${codec}</span>
                `;


                option.addEventListener(
                    "click",
                    () => {

                        selectCodec(
                            codec
                        );

                        menu.classList.remove(
                            "open"
                        );
                    }
                );


                menu.appendChild(
                    option
                );
            }
        );


        dropdown.appendChild(
            menu
        );


        dropdownTrigger.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                menu.classList.toggle(
                    "open"
                );
            }
        );


        document.addEventListener(
            "click",
            () => {

                menu.classList.remove(
                    "open"
                );
            }
        );
    }


    function selectCodec(codec) {
        state.codec = codec;

        dropdownLabel.innerHTML = `
        <i></i>
        ${codec}
    `;

        // Динамічне обмеження QS
        const maxLimit = codec === "BPG" ? 51 : 100;

        compressionRange.max = maxLimit;
        compressionNumber.max = maxLimit;

        // Оновлення тексту ліміту в UI (span під повзунком)
        const compressionLimitsInfo = document.querySelectorAll('.range-limits')[1].querySelectorAll('span');
        compressionLimitsInfo[1].textContent = maxLimit;

        // Якщо поточне значення перевищує новий ліміт, знижуємо його
        if (state.compression > maxLimit) {
            state.compression = maxLimit;
            compressionRange.value = maxLimit;
            compressionNumber.value = maxLimit;
        }

        // Обов'язково перераховуємо червону заливку (progress)
        // для нової шкали, навіть якщо значення не перевищувало ліміт
        updateRangeProgress(compressionRange);

        updateSelectedCompression();
    }


    // =============================
    // BEFORE / AFTER DIVIDER
    // =============================

    let draggingDivider = false;


    // Початок перетягування
    dividerHandle.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            draggingDivider = true;

            dividerHandle.setPointerCapture(
                event.pointerId
            );
        }
    );


    // Рух під час затиснутої кнопки
    dividerHandle.addEventListener(
        "pointermove",
        (event) => {

            if (!draggingDivider) {
                return;
            }

            event.preventDefault();

            updateDividerFromPointer(
                event.clientX
            );
        }
    );


    // Завершення перетягування
    dividerHandle.addEventListener(
        "pointerup",
        (event) => {

            draggingDivider = false;

            try {
                dividerHandle.releasePointerCapture(
                    event.pointerId
                );
            } catch (error) {
                // Pointer capture вже міг бути звільнений
            }
        }
    );


    // Якщо pointer було скасовано
    dividerHandle.addEventListener(
        "pointercancel",
        () => {

            draggingDivider = false;
        }
    );


    // Якщо курсор залишив межі вікна браузера
    dividerHandle.addEventListener(
        "lostpointercapture",
        () => {

            draggingDivider = false;
        }
    );


    // Натискання безпосередньо на зображення
    // переміщує повзунок у цю позицію,
    // але НЕ запускає режим перетягування.
    comparison.addEventListener(
        "pointerdown",
        (event) => {

            if (
                event.target === dividerHandle ||
                dividerHandle.contains(event.target)
            ) {
                return;
            }

            updateDividerFromPointer(
                event.clientX
            );
        }
    );


    function updateDividerFromPointer(clientX) {

        const rect =
            comparison.getBoundingClientRect();


        let percentage =
            (
                (clientX - rect.left)
                / rect.width
            ) * 100;


        percentage =
            clamp(
                percentage,
                0,
                100
            );


        state.divider =
            percentage;


        divider.style.left =
            `${percentage}%`;


        beforeLayer.style.clipPath =
            `inset(
            0
            ${100 - percentage}%
            0
            0
        )`;


        comparisonPosition.innerHTML = `
        <img
            src="./assets/4d921.svg"
            alt=""
        >
        Comparison position
        ${Math.round(percentage)}%
    `;
    }


    // =============================
    // METRIC TABS
    // =============================

    metricTabs.forEach(
        (tab) => {

            tab.addEventListener(
                "click",
                () => {

                    metricTabs.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                            item.setAttribute(
                                "aria-selected",
                                "false"
                            );
                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    tab.setAttribute(
                        "aria-selected",
                        "true"
                    );


                    state.metric =
                        tab.textContent.trim();


                    updateChart();
                }
            );
        }
    );


    // =============================
    // DEMO DATA
    // =============================

    /*
     * IMPORTANT:
     *
     * These functions are temporary.
     * They imitate benchmark results.
     *
     * Later they will be completely
     * replaced by results received
     * from the Python backend.
     */

    function getDemoValue(
        codec,
        parameter,
        metric
    ) {

        const codecFactor = {

            AGU: 1.00,

            BPG: 0.82,

            HEIF: 0.92,

            AVIF: 0.88,

            JPEG: 1.08

        }[codec] || 1;


        const normalized =
            parameter / 100;


        switch (metric) {

            case "Encoding Time":

                return (
                    35 +
                    normalized *
                    115 *
                    codecFactor
                );


            case "Peak RAM":

                return (
                    45 +
                    normalized *
                    55 *
                    codecFactor
                );


            case "File Size":

                return (
                    210 -
                    normalized *
                    150 *
                    codecFactor
                );


            case "PSNR":

                return (
                    27 +
                    normalized * 16
                );


            case "SSIM":

                return (
                    0.68 +
                    normalized * 0.29
                );


            case "MSE":

                return (
                    850 -
                    normalized * 760
                );


            case "PSNR-HVS":

                return (
                    26 +
                    normalized * 17
                );


            case "PSNR-HVS-M":

                return (
                    25 +
                    normalized * 18
                );


            default:

                return 0;
        }
    }


    function getDemoSeries(
        codec,
        metric
    ) {

        const points = [];


        for (
            let parameter = 1;
            parameter <= 100;
            parameter++
        ) {

            points.push({

                parameter,

                value:
                    getDemoValue(
                        codec,
                        parameter,
                        metric
                    )
            });
        }


        return points;
    }


    // =============================
    // RESULT CARDS
    // =============================

    function updateDemoResults() {

        const qs =
            state.compression;


        const fileSize =
            getDemoValue(
                state.codec,
                qs,
                "File Size"
            );


        const encodingTime =
            getDemoValue(
                state.codec,
                qs,
                "Encoding Time"
            );


        const ram =
            getDemoValue(
                state.codec,
                qs,
                "Peak RAM"
            );


        const compressionRatio =
            (512 * 512 * 3)
            / (fileSize * 1024);


        if (resultCards.length >= 4) {

            resultCards[0]
                .querySelector("strong")
                .textContent =
                `${formatNumber(
                    fileSize,
                    1
                )} KB`;


            resultCards[1]
                .querySelector("strong")
                .textContent =
                `${formatNumber(
                    compressionRatio,
                    2
                )}×`;


            resultCards[2]
                .querySelector("strong")
                .textContent =
                `${formatNumber(
                    encodingTime,
                    1
                )} ms`;


            resultCards[3]
                .querySelector("strong")
                .textContent =
                `${formatNumber(
                    ram,
                    1
                )} MB`;
        }
    }


    // =============================
    // SVG CHART
    // =============================

    function updateChart() {

        const config =
            metricConfig[
                state.metric
                ];


        if (!config) {
            return;
        }


        const series =
            getDemoSeries(
                state.codec,
                state.metric
            );


        const chartLeft = 48;
        const chartRight = 900;

        const chartTop = 26;
        const chartBottom = 176;


        const width =
            chartRight - chartLeft;


        const height =
            chartBottom - chartTop;


        const points =
            series.map(
                (item) => {

                    const x =
                        chartLeft +
                        (
                            (item.parameter - 1)
                            / 99
                        ) *
                        width;


                    const normalized =
                        (
                            item.value -
                            config.min
                        )
                        /
                        (
                            config.max -
                            config.min
                        );


                    const y =
                        chartBottom -
                        clamp(
                            normalized,
                            0,
                            1
                        ) *
                        height;


                    return {
                        parameter:
                        item.parameter,

                        value:
                        item.value,

                        x,

                        y
                    };
                }
            );


        metricLine.setAttribute(
            "points",
            points
                .map(
                    (point) =>
                        `${point.x},${point.y}`
                )
                .join(" ")
        );


        const selected =
            points[
            state.compression - 1
                ];


        if (!selected) {
            return;
        }


        selectedPointLine.setAttribute(
            "x1",
            selected.x
        );

        selectedPointLine.setAttribute(
            "x2",
            selected.x
        );


        selectedPointCircle.setAttribute(
            "cx",
            selected.x
        );

        selectedPointCircle.setAttribute(
            "cy",
            selected.y
        );


        selectedPointCore.setAttribute(
            "cx",
            selected.x
        );

        selectedPointCore.setAttribute(
            "cy",
            selected.y
        );


        const labelGroup =
            selectedPoint.querySelector(
                "g"
            );


        const labelWidth = 105;


        let labelX =
            selected.x -
            labelWidth / 2;


        labelX =
            clamp(
                labelX,
                chartLeft,
                chartRight - labelWidth
            );


        let labelY =
            selected.y - 38;


        if (labelY < chartTop) {

            labelY =
                selected.y + 12;
        }


        labelGroup.setAttribute(
            "transform",
            `translate(
                ${labelX}
                ${labelY}
            )`
        );


        labelGroup
            .querySelector("rect")
            .setAttribute(
                "width",
                labelWidth
            );


        selectedPointLabel.setAttribute(
            "x",
            labelWidth / 2
        );


        selectedPointLabel.textContent =
            `QS ${state.compression} · ${
                formatMetricValue(
                    selected.value,
                    config
                )
            }`;


        chartYAxisTitle.textContent =
            config.yTitle;


        chartLegend.lastChild.textContent =
            ` ${state.codec}`;
    }


    function formatMetricValue(
        value,
        config
    ) {

        if (config.unit === "") {

            if (config.max <= 1) {

                return Number(
                    value
                ).toFixed(3);
            }


            return Number(
                value
            ).toFixed(1);
        }


        return `${Number(
            value
        ).toFixed(1)} ${config.unit}`;
    }


    // =============================
    // RUN BENCHMARK
    // =============================

    runButton.addEventListener(
        "click",
        () => {

            runDemoBenchmark();
        }
    );


    function runDemoBenchmark() {

        const originalText =
            runButton.innerHTML;


        runButton.disabled =
            true;


        runButton.innerHTML = `
            <span class="spinner"></span>
            Processing...
        `;


        setTimeout(
            () => {

                updateSelectedCompression();


                runButton.disabled =
                    false;


                runButton.innerHTML =
                    originalText;

            },
            1200
        );
    }


    // =============================
    // META INFORMATION
    // =============================

    function updateComparisonMeta() {

        const noiseText =
            state.noiseType === "None"
                ? "None"
                : `${state.noiseType} σ² = ${Number(
                    state.noiseVariance
                ).toFixed(4)}`;


        const width =
            state.image.width;


        const height =
            state.image.height;


        document.querySelector(
            ".comparison-meta > span:first-child"
        ).textContent =
            `${state.image.name} · ` +
            `${width}×${height} px · ` +
            `${state.colorMode} · ` +
            `${noiseText} · ` +
            `${state.codec}`;
    }


    // =============================
    // INITIALIZATION
    // =============================

    updateDividerFromPointer(
        comparison.getBoundingClientRect().left +
        comparison.getBoundingClientRect().width *
        0.5
    );


    updateSelectedCompression();


    // =============================
    // DEBUG
    // =============================

    /*
     * During development you can type:
     *
     * window.compressionApp.state
     *
     * in browser console and see
     * the current application state.
     */

    window.compressionApp = {

        state,

        selectCodec,

        selectImage,

        updateChart,

        updateDemoResults
    };
});