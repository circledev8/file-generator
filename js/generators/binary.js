async function generateBinary(config) {
    const { size, sizeUnit } = config;

    window.logToUI('Starting binary file generation...');
    window.updateProgress(30, 'Generating binary data...');

    const sizeInBytes = convertToBytes(size, sizeUnit);
    window.logToUI(`Target size: ${size} ${sizeUnit} (${sizeInBytes} bytes)`);

    // Generate random binary data
    const data = new Uint8Array(sizeInBytes);

    // Fill with random bytes
    for (let i = 0; i < sizeInBytes; i++) {
        data[i] = Math.floor(Math.random() * 256);

        // Update progress periodically
        if (i % 100000 === 0 && i > 0) {
            const progress = 30 + (i / sizeInBytes) * 60;
            window.updateProgress(progress, `Generating... ${((i / sizeInBytes) * 100).toFixed(1)}%`);
        }
    }

    const blob = new Blob([data], { type: 'application/octet-stream' });

    window.updateProgress(100, 'Complete!');
    window.logToUI(`Binary file generated: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
    setTimeout(() => window.hideProgress(), 2000);

    return blob;
}

function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return Math.floor(size * 1024);
    } else if (unit === 'MB') {
        return Math.floor(size * 1024 * 1024);
    }
    return size;
}
