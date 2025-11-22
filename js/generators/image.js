async function generateImage(config) {
    const { format, width, height, size, sizeUnit } = config;

    window.logToUI(`Starting ${format.toUpperCase()} image generation...`);
    window.updateProgress(30, 'Generating image...');
    window.logToUI(`Dimensions: ${width}x${height}`);
    if (size) {
        window.logToUI(`Target size: ${size} ${sizeUnit}`);
    }

    let blob;
    if (format === 'svg') {
        blob = generateSVG(width, height);
    } else {
        blob = await generateRasterImage(format, width, height, size, sizeUnit);
    }

    window.updateProgress(100, 'Complete!');
    window.logToUI(`Image generated: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
    setTimeout(() => window.hideProgress(), 2000);

    return blob;
}

function generateSVG(width, height) {
    // Generate a colorful SVG with random shapes
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const shapes = [];

    // Add random circles and rectangles
    for (let i = 0; i < 10; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * width;
        const y = Math.random() * height;

        if (Math.random() > 0.5) {
            const radius = 20 + Math.random() * 50;
            shapes.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="0.7"/>`);
        } else {
            const w = 30 + Math.random() * 80;
            const h = 30 + Math.random() * 80;
            shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="0.7"/>`);
        }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    ${shapes.join('\n    ')}
    <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">
        ${width} × ${height}
    </text>
</svg>`;

    return new Blob([svgContent], { type: 'image/svg+xml' });
}

async function generateRasterImage(format, width, height, targetSize, sizeUnit) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const targetBytes = targetSize ? convertToBytes(targetSize, sizeUnit) : null;
    const needsRandomization = !targetSize || targetBytes > 500 * 1024; // > 500KB

    if (!needsRandomization) {
        // For small target size, create a simple solid color image
        // Simple images compress better and we can pad to exact size

        // Generate random color
        const hue = Math.floor(Math.random() * 360); // 0-360 degrees
        const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
        const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(0, 0, width, height);

        // Add minimal text with good contrast
        ctx.fillStyle = lightness < 55 ? '#ffffff' : '#000000';

        // Adjust font size based on image dimensions
        const minDimension = Math.min(width, height);
        const fontSize = Math.max(8, Math.min(24, Math.floor(minDimension / 20)));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${width} × ${height}`, width / 2, height / 2);
    } else {
        // No target size or large target - create randomized decorative image

        // Random gradient colors
        const gradientColors = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#30cfd0', '#330867'],
            ['#a8edea', '#fed6e3'],
            ['#ff9a56', '#ff6a88'],
            ['#ffecd2', '#fcb69f'],
            ['#ff6e7f', '#bfe9ff']
        ];
        const selectedGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

        // Random gradient direction
        const gradientType = Math.random();
        let gradient;
        if (gradientType < 0.33) {
            gradient = ctx.createLinearGradient(0, 0, width, height);
        } else if (gradientType < 0.66) {
            gradient = ctx.createLinearGradient(0, height, width, 0);
        } else {
            gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        }

        gradient.addColorStop(0, selectedGradient[0]);
        gradient.addColorStop(1, selectedGradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add random shapes
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'];
        const shapeCount = 10 + Math.floor(Math.random() * 20); // 10-30 shapes

        for (let i = 0; i < shapeCount; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.globalAlpha = 0.3 + Math.random() * 0.5; // Random opacity

            const shapeType = Math.random();
            if (shapeType < 0.4) {
                // Circle
                const x = Math.random() * width;
                const y = Math.random() * height;
                const radius = 20 + Math.random() * 80;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (shapeType < 0.8) {
                // Rectangle
                const x = Math.random() * width;
                const y = Math.random() * height;
                const w = 30 + Math.random() * 150;
                const h = 30 + Math.random() * 150;
                ctx.fillRect(x, y, w, h);
            } else {
                // Triangle
                const x1 = Math.random() * width;
                const y1 = Math.random() * height;
                const x2 = x1 + (Math.random() - 0.5) * 100;
                const y2 = y1 + (Math.random() - 0.5) * 100;
                const x3 = x1 + (Math.random() - 0.5) * 100;
                const y3 = y1 + (Math.random() - 0.5) * 100;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Add text with random color and responsive size
        ctx.globalAlpha = 1;
        const textColors = ['#ffffff', '#000000', '#ffeb3b', '#ff5722'];
        ctx.fillStyle = textColors[Math.floor(Math.random() * textColors.length)];

        // Adjust font size based on image dimensions
        const minDimension = Math.min(width, height);
        const fontSize = Math.max(8, Math.min(24, Math.floor(minDimension / 20)));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${width} × ${height}`, width / 2, height / 2);
    }

    // Convert to blob
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    let quality = 0.92;

    if (targetSize && (format === 'jpeg' || format === 'jpg')) {
        // Adjust quality to approximate target size
        quality = await findOptimalQuality(canvas, mimeType, targetSize, sizeUnit);
    }

    return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
            if (targetSize && blob) {
                const targetBytes = convertToBytes(targetSize, sizeUnit);

                // Always pad to exact size
                if (blob.size < targetBytes) {
                    window.logToUI(`Generated ${blob.size} bytes, padding to ${targetBytes} bytes`);
                    resolve(padBlob(blob, targetBytes, mimeType));
                } else {
                    // Close enough - within 10%
                    window.logToUI(`Generated ${blob.size} bytes (target: ${targetBytes} bytes)`);
                    resolve(blob);
                }
            } else {
                resolve(blob);
            }
        }, mimeType, quality);
    });
}

async function findOptimalQuality(canvas, mimeType, targetSize, sizeUnit) {
    const targetBytes = convertToBytes(targetSize, sizeUnit);
    let low = 0.1, high = 1.0;
    let bestQuality = 0.92;

    // Binary search for optimal quality (only for JPEG)
    if (!mimeType.includes('jpeg')) {
        return 1.0;
    }

    for (let i = 0; i < 5; i++) {
        const quality = (low + high) / 2;
        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, mimeType, quality);
        });

        if (blob.size < targetBytes) {
            low = quality;
            bestQuality = quality;
        } else {
            high = quality;
        }
    }

    return bestQuality;
}

function padBlob(blob, targetBytes, mimeType) {
    // Add padding to reach target size
    const paddingSize = targetBytes - blob.size;

    if (paddingSize <= 0) {
        return blob;
    }

    // Create random padding data
    const padding = new Uint8Array(paddingSize);
    for (let i = 0; i < paddingSize; i++) {
        padding[i] = Math.floor(Math.random() * 256);
    }

    return new Blob([blob, padding], { type: mimeType });
}

function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return size * 1024;
    } else if (unit === 'MB') {
        return size * 1024 * 1024;
    }
    return size;
}
