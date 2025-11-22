// Tab switching logic
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    initConditionalFields();
    initLogViewer();
});

function initTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('tab-active'));
            tab.classList.add('tab-active');

            // Show corresponding content
            tabContents.forEach(content => {
                if (content.id === `tab-${targetTab}`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

function initForms() {
    // IMAGE form
    document.getElementById('form-image').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            format: formData.get('format'),
            width: parseInt(formData.get('width')),
            height: parseInt(formData.get('height')),
            size: formData.get('size') ? parseFloat(formData.get('size')) : null,
            sizeUnit: formData.get('sizeUnit')
        };

        try {
            const blob = await generateImage(config);
            logToUI('Downloading file...');
            downloadFile(blob, `image.${config.format}`);
            logToUI('✓ Download complete!');
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('Image generation failed: ' + error.message);
            hideProgress();
        }
    });

    // TXT form
    document.getElementById('form-txt').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            rows: parseInt(formData.get('rows')) || null,
            size: formData.get('size') ? parseFloat(formData.get('size')) : null,
            sizeUnit: formData.get('sizeUnit')
        };

        try {
            const blob = await generateText(config);
            logToUI('Downloading file...');
            downloadFile(blob, 'file.txt');
            logToUI('✓ Download complete!');
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('Text generation failed: ' + error.message);
            hideProgress();
        }
    });

    // CSV form
    document.getElementById('form-csv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            columns: parseInt(formData.get('columns')),
            rows: parseInt(formData.get('rows')) || null,
            size: formData.get('size') ? parseFloat(formData.get('size')) : null,
            sizeUnit: formData.get('sizeUnit')
        };

        try {
            const blob = await generateCSV(config);
            logToUI('Downloading file...');
            downloadFile(blob, 'data.csv');
            logToUI('✓ Download complete!');
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('CSV generation failed: ' + error.message);
            hideProgress();
        }
    });

    // PDF form
    document.getElementById('form-pdf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            pageFormat: formData.get('pageFormat'),
            pages: parseInt(formData.get('pages')) || null,
            size: formData.get('size') ? parseFloat(formData.get('size')) : null,
            sizeUnit: formData.get('sizeUnit')
        };

        try {
            const blob = await generatePDF(config);
            logToUI('Downloading file...');
            downloadFile(blob, 'document.pdf');
            logToUI('✓ Download complete!');
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('PDF generation failed: ' + error.message);
            hideProgress();
        }
    });

    // BIN form
    document.getElementById('form-bin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            size: parseFloat(formData.get('size')),
            sizeUnit: formData.get('sizeUnit')
        };

        try {
            const blob = await generateBinary(config);
            logToUI('Downloading file...');
            downloadFile(blob, 'file.bin');
            logToUI('✓ Download complete!');
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('Binary generation failed: ' + error.message);
            hideProgress();
        }
    });

    // ZIP form
    document.getElementById('form-zip').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const config = {
            size: parseFloat(formData.get('size')),
            sizeUnit: formData.get('sizeUnit'),
            sizeType: formData.get('sizeType'),
            hiddenFiles: formData.get('hiddenFiles') === 'on',
            longFilenames: formData.get('longFilenames') === 'on',
            depth: parseInt(formData.get('depth'))
        };

        try {
            // Disable button and show loading
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Generating...';

            const blob = await generateZIP(config);

            logToUI('Downloading file...');
            downloadFile(blob, 'archive.zip');
            logToUI('✓ Download complete!');

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } catch (error) {
            logToUI(`❌ Error: ${error.message}`);
            showError('ZIP generation failed: ' + error.message);
            hideProgress();
            // Re-enable button
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate & Download';
        }
    });
}

function initConditionalFields() {
    // IMAGE: Disable size input for SVG
    const imageFormat = document.querySelector('#form-image select[name="format"]');
    const imageSizeContainer = document.getElementById('image-size-container');

    imageFormat.addEventListener('change', (e) => {
        const isSVG = e.target.value === 'svg';
        const sizeInput = imageSizeContainer.querySelector('input[name="size"]');
        const sizeUnit = imageSizeContainer.querySelector('select[name="sizeUnit"]');

        if (isSVG) {
            sizeInput.disabled = true;
            sizeUnit.disabled = true;
            sizeInput.value = '';
        } else {
            sizeInput.disabled = false;
            sizeUnit.disabled = false;
        }
    });

    // TXT: Disable rows if size is specified
    const txtSizeInput = document.querySelector('#form-txt input[name="size"]');
    const txtRowsInput = document.querySelector('#form-txt input[name="rows"]');

    txtSizeInput.addEventListener('input', (e) => {
        if (e.target.value) {
            txtRowsInput.disabled = true;
            txtRowsInput.value = '';
        } else {
            txtRowsInput.disabled = false;
            txtRowsInput.value = 10;
        }
    });

    txtRowsInput.addEventListener('input', (e) => {
        if (e.target.value) {
            txtSizeInput.disabled = true;
            txtSizeInput.value = '';
        } else {
            txtSizeInput.disabled = false;
        }
    });

    // CSV: Disable rows if size is specified
    const csvSizeInput = document.querySelector('#form-csv input[name="size"]');
    const csvRowsInput = document.querySelector('#form-csv input[name="rows"]');

    csvSizeInput.addEventListener('input', (e) => {
        if (e.target.value) {
            csvRowsInput.disabled = true;
            csvRowsInput.value = '';
        } else {
            csvRowsInput.disabled = false;
            csvRowsInput.value = 10;
        }
    });

    csvRowsInput.addEventListener('input', (e) => {
        if (e.target.value) {
            csvSizeInput.disabled = true;
            csvSizeInput.value = '';
        } else {
            csvSizeInput.disabled = false;
        }
    });

    // PDF: Disable pages if size is specified
    const pdfSizeInput = document.querySelector('#form-pdf input[name="size"]');
    const pdfPagesInput = document.querySelector('#form-pdf input[name="pages"]');

    pdfSizeInput.addEventListener('input', (e) => {
        if (e.target.value) {
            pdfPagesInput.disabled = true;
            pdfPagesInput.value = '';
        } else {
            pdfPagesInput.disabled = false;
            pdfPagesInput.value = 1;
        }
    });

    pdfPagesInput.addEventListener('input', (e) => {
        if (e.target.value) {
            pdfSizeInput.disabled = true;
            pdfSizeInput.value = '';
        } else {
            pdfSizeInput.disabled = false;
        }
    });
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showError(message) {
    alert(message);
}

// Logging and progress utilities
window.logToUI = function(message) {
    const logsContainer = document.getElementById('logs-container');
    const timestamp = new Date().toLocaleTimeString();

    // Clear "No logs yet" message
    if (logsContainer.innerHTML.includes('No logs yet')) {
        logsContainer.innerHTML = '';
    }

    const logEntry = document.createElement('div');
    logEntry.className = 'mb-1';
    logEntry.innerHTML = `<span class="text-primary">[${timestamp}]</span> ${message}`;
    logsContainer.appendChild(logEntry);

    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Also log to console
    console.log(message);
};

window.updateProgress = function(percent, text = null) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    progressContainer.classList.remove('hidden');
    progressBar.value = percent;
    progressText.textContent = text || `${Math.round(percent)}%`;
};

window.hideProgress = function() {
    const progressContainer = document.getElementById('progress-container');
    progressContainer.classList.add('hidden');
    document.getElementById('progress-bar').value = 0;
    document.getElementById('progress-text').textContent = '0%';
};

// Initialize log viewer
function initLogViewer() {
    document.getElementById('clear-logs')?.addEventListener('click', () => {
        const logsContainer = document.getElementById('logs-container');
        logsContainer.innerHTML = '<div class="text-base-content/70">No logs yet...</div>';
    });
}
