async function generateZIP(config) {
    window.logToUI('Starting ZIP generation...');
    window.updateProgress(10, 'Initializing...');

    const { size, sizeUnit, sizeType, hiddenFiles, longFilenames, depth } = config;

    const targetBytes = convertToBytes(size, sizeUnit);
    const targetSizeStr = sizeUnit === 'MB' ? `${size} MB` : `${size} KB`;
    window.logToUI(`Target size: ${targetSizeStr} (${targetBytes} bytes)`);
    window.logToUI(`Mode: ${sizeType === 'before' ? 'Before compression' : 'After compression'}`);

    // Create JSZip instance
    const zip = new JSZip();
    window.updateProgress(20, 'Creating archive...');

    if (sizeType === 'before') {
        // Target is uncompressed size - generate exact uncompressed content
        window.logToUI('Generating uncompressed content...');
        await generateUncompressedContent(zip, depth, hiddenFiles, longFilenames, targetBytes);
    } else {
        // Target is compressed size - iteratively add content until ZIP reaches target
        window.logToUI('Generating content to match compressed size...');
        await generateCompressedContent(zip, depth, hiddenFiles, longFilenames, targetBytes);
    }

    window.updateProgress(90, 'Finalizing...');
    window.logToUI('Compressing files...');

    // Generate the ZIP file
    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    window.updateProgress(100, 'Complete!');
    window.logToUI(`ZIP file generated: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);

    setTimeout(() => window.hideProgress(), 2000);

    return blob;
}

async function generateUncompressedContent(zip, depth, includeHidden, useLongNames, targetBytes) {
    let currentSize = 0;
    let fileIndex = 0;
    let folderIndex = 0;

    // Create folder structure
    const folders = generateFolderStructure(depth, includeHidden, useLongNames, folderIndex);
    window.logToUI(`Created ${folders.length} folder(s) with depth ${depth}`);

    // Add files until we reach target uncompressed size
    while (currentSize < targetBytes) {
        const folder = folders[fileIndex % folders.length];
        const isHidden = includeHidden && Math.random() > 0.7;
        const fileName = generateFileName(fileIndex, isHidden, useLongNames);
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Calculate remaining size needed
        const remaining = targetBytes - currentSize;
        const fileSize = Math.min(remaining, 50 * 1024); // Max 50KB per file

        const content = generateFileContent(fileSize);
        zip.file(filePath, content);

        currentSize += content.length;
        fileIndex++;

        // Update progress
        const progress = 20 + (currentSize / targetBytes) * 60;
        if (fileIndex % 10 === 0) {
            window.updateProgress(progress, `Adding files... ${fileIndex} files`);
            window.logToUI(`Added ${fileIndex} files (${(currentSize / 1024).toFixed(2)} KB / ${(targetBytes / 1024).toFixed(2)} KB)`);
        }
    }
    window.logToUI(`Content generation complete. Total: ${fileIndex} files, ${(currentSize / 1024).toFixed(2)} KB`);
}

async function generateCompressedContent(zip, depth, includeHidden, useLongNames, targetBytes) {
    let currentCompressedSize = 0;
    let fileIndex = 0;
    let folderIndex = 0;

    // Create folder structure
    const folders = generateFolderStructure(depth, includeHidden, useLongNames, folderIndex);
    window.logToUI(`Created ${folders.length} folder(s) with depth ${depth}`);

    // Iteratively add files and check compressed size
    while (currentCompressedSize < targetBytes * 0.95) { // Target 95% to account for overhead
        const folder = folders[fileIndex % folders.length];
        const isHidden = includeHidden && Math.random() > 0.7;
        const fileName = generateFileName(fileIndex, isHidden, useLongNames);
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Add a reasonable chunk of data
        // Text compresses to about 30-40% of original, so add 2.5x what we need
        const remaining = targetBytes - currentCompressedSize;
        const fileSize = Math.min(remaining * 2.5, 100 * 1024); // Max 100KB per file

        const content = generateFileContent(Math.floor(fileSize));
        zip.file(filePath, content);

        // Check current compressed size every few files to avoid too many compressions
        if (fileIndex % 5 === 0 || currentCompressedSize === 0) {
            const testBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            currentCompressedSize = testBlob.size;
            const progress = 20 + (currentCompressedSize / targetBytes) * 60;
            window.updateProgress(progress, `Compressing... ${fileIndex} files`);
            window.logToUI(`Progress: ${(currentCompressedSize / 1024).toFixed(2)} KB / ${(targetBytes / 1024).toFixed(2)} KB (${fileIndex} files)`);
        }

        fileIndex++;

        // Safety check to prevent infinite loop
        if (fileIndex > 1000) {
            window.logToUI('Safety limit reached (1000 files)');
            break;
        }
    }
    window.logToUI(`Content generation complete. Total: ${fileIndex} files, compressed size: ${(currentCompressedSize / 1024).toFixed(2)} KB`);
}

function generateFolderStructure(depth, includeHidden, useLongNames, startIndex) {
    const folders = [''];

    if (depth === 1) {
        return folders;
    }

    // Create folders for each depth level
    for (let d = 1; d < depth; d++) {
        const numFolders = 2 + d; // More folders at deeper levels
        for (let i = 0; i < numFolders; i++) {
            const isHidden = includeHidden && Math.random() > 0.8;
            const folderName = generateFolderName(startIndex + i, isHidden, useLongNames);

            if (d === 1) {
                folders.push(folderName);
            } else {
                // Nest under existing folders
                const parentFolder = folders[1 + (i % (folders.length - 1))];
                folders.push(`${parentFolder}/${folderName}`);
            }
        }
    }

    return folders;
}

function generateFileName(index, isHidden, useLongNames) {
    const extensions = ['txt', 'dat', 'log', 'json', 'csv'];
    const ext = extensions[index % extensions.length];

    let baseName;

    if (useLongNames) {
        const longWords = [
            'VeryLongFileNameWithMultipleWords',
            'AnotherExtremelyLongFileName',
            'SupercalifragilisticexpialidociousDocument',
            'ThisIsAVeryVeryVeryLongFileNameIndeed',
            'UltraLongFileNameForTestingPurposes'
        ];
        baseName = longWords[index % longWords.length] + '_' + index;
    } else {
        const shortNames = ['file', 'document', 'data', 'report', 'info'];
        baseName = `${shortNames[index % shortNames.length]}_${index}`;
    }

    return isHidden ? `.${baseName}.${ext}` : `${baseName}.${ext}`;
}

function generateFolderName(index, isHidden, useLongNames) {
    let baseName;

    if (useLongNames) {
        const longFolders = [
            'VeryLongFolderNameWithMultipleWords',
            'AnotherExtremelyLongDirectoryName',
            'SuperLongFolderForOrganizingFiles',
            'ThisIsAVeryVeryLongFolderName'
        ];
        baseName = longFolders[index % longFolders.length] + '_' + index;
    } else {
        const shortFolders = ['folder', 'directory', 'files', 'data'];
        baseName = `${shortFolders[index % shortFolders.length]}_${index}`;
    }

    return isHidden ? `.${baseName}` : baseName;
}

function generateFileContent(targetSize) {
    // Generate random text content to reach exact target size
    const sampleLines = [
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

    let content = '';
    let lineIndex = 0;

    while (content.length < targetSize) {
        const line = sampleLines[lineIndex % sampleLines.length] + '\n';
        if (content.length + line.length <= targetSize) {
            content += line;
        } else {
            // Add partial line to reach exact size
            content += line.substring(0, targetSize - content.length);
            break;
        }
        lineIndex++;
    }

    return content;
}

function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return size * 1024;
    } else if (unit === 'MB') {
        return size * 1024 * 1024;
    }
    return size;
}
