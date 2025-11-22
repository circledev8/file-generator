async function generateCSV(config) {
    const { columns, rows, size, sizeUnit } = config;

    window.logToUI('Starting CSV generation...');
    window.updateProgress(30, 'Generating CSV...');
    window.logToUI(`Columns: ${columns}`);

    let content = '';

    if (size) {
        // Generate CSV to reach target size
        const targetBytes = convertToBytes(size, sizeUnit);
        window.logToUI(`Target size: ${size} ${sizeUnit} (${targetBytes} bytes)`);
        content = generateCSVBySize(columns, targetBytes);
    } else if (rows) {
        // Generate CSV with specific number of rows
        window.logToUI(`Rows: ${rows}`);
        content = generateCSVByRows(columns, rows);
    } else {
        throw new Error('Either rows or size must be specified');
    }

    const blob = new Blob([content], { type: 'text/csv' });
    window.updateProgress(100, 'Complete!');
    window.logToUI(`CSV file generated: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
    setTimeout(() => window.hideProgress(), 2000);

    return blob;
}

function generateCSVByRows(columnCount, rowCount) {
    const lines = [];

    // Generate header
    const headers = [];
    for (let i = 0; i < columnCount; i++) {
        headers.push(`Column_${i + 1}`);
    }
    lines.push(headers.join(','));

    // Generate data rows
    for (let row = 0; row < rowCount; row++) {
        const rowData = [];
        for (let col = 0; col < columnCount; col++) {
            rowData.push(generateCellValue(row, col));
        }
        lines.push(rowData.join(','));
    }

    return lines.join('\n');
}

function generateCSVBySize(columnCount, targetBytes) {
    const lines = [];
    let currentSize = 0;

    // Generate header
    const headers = [];
    for (let i = 0; i < columnCount; i++) {
        headers.push(`Column_${i + 1}`);
    }
    const headerLine = headers.join(',') + '\n';
    lines.push(headerLine);
    currentSize += new Blob([headerLine]).size;

    // Generate data rows until we reach target size
    let rowNumber = 0;
    while (currentSize < targetBytes) {
        const rowData = [];
        for (let col = 0; col < columnCount; col++) {
            rowData.push(generateCellValue(rowNumber, col));
        }
        const rowLine = rowData.join(',') + '\n';
        const rowSize = new Blob([rowLine]).size;

        if (currentSize + rowSize > targetBytes) {
            // We're close enough to the target size
            break;
        }

        lines.push(rowLine);
        currentSize += rowSize;
        rowNumber++;
    }

    return lines.join('');
}

function generateCellValue(row, col) {
    const types = ['number', 'text', 'date', 'boolean'];
    const type = types[col % types.length];

    switch (type) {
        case 'number':
            return (Math.random() * 1000).toFixed(2);
        case 'text':
            const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
            return words[row % words.length];
        case 'date':
            const date = new Date(2024, 0, 1 + (row % 365));
            return date.toISOString().split('T')[0];
        case 'boolean':
            return row % 2 === 0 ? 'true' : 'false';
        default:
            return `Value_${row}_${col}`;
    }
}

function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return size * 1024;
    } else if (unit === 'MB') {
        return size * 1024 * 1024;
    }
    return size;
}
