async function generateText(config) {
    const { rows, size, sizeUnit } = config;

    window.logToUI('Starting text file generation...');
    window.updateProgress(30, 'Generating text...');

    let content = '';

    if (size) {
        // Generate text to reach target size
        const targetBytes = convertToBytes(size, sizeUnit);
        window.logToUI(`Target size: ${size} ${sizeUnit} (${targetBytes} bytes)`);
        content = generateTextBySize(targetBytes);
    } else if (rows) {
        // Generate text with specific number of rows
        window.logToUI(`Generating ${rows} rows`);
        content = generateTextByRows(rows);
    } else {
        throw new Error('Either rows or size must be specified');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    window.updateProgress(100, 'Complete!');
    window.logToUI(`Text file generated: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
    setTimeout(() => window.hideProgress(), 2000);

    return blob;
}

function generateTextByRows(rowCount) {
    const lines = [];
    const sampleTexts = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
        'Nulla pariatur sed ut perspiciatis unde omnis iste natus error.',
        'Sit voluptatem accusantium doloremque laudantium totam rem aperiam.',
        'Eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
        'Beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem.',
        'Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur.'
    ];

    for (let i = 0; i < rowCount; i++) {
        const text = sampleTexts[i % sampleTexts.length];
        lines.push(`${i + 1}. ${text}`);
    }

    return lines.join('\n');
}

function generateTextBySize(targetBytes) {
    const lines = [];
    let currentSize = 0;
    let lineNumber = 1;

    const sampleTexts = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
        'Nulla pariatur sed ut perspiciatis unde omnis iste natus error.',
        'Sit voluptatem accusantium doloremque laudantium totam rem aperiam.',
        'Eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
        'Beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem.',
        'Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur.'
    ];

    while (currentSize < targetBytes) {
        const text = sampleTexts[(lineNumber - 1) % sampleTexts.length];
        const line = `${lineNumber}. ${text}\n`;
        const lineSize = new Blob([line]).size;

        if (currentSize + lineSize > targetBytes) {
            // Add partial line to exactly match target size
            const remaining = targetBytes - currentSize;
            const partialLine = line.substring(0, remaining);
            lines.push(partialLine);
            currentSize += remaining;
        } else {
            lines.push(line);
            currentSize += lineSize;
            lineNumber++;
        }
    }

    return lines.join('');
}

function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return size * 1024;
    } else if (unit === 'MB') {
        return size * 1024 * 1024;
    }
    return size;
}
