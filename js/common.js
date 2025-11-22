// Common utilities for all pages

// Logging and progress utilities
window.logToUI = function(message) {
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer) return;

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

    if (!progressContainer || !progressBar || !progressText) return;

    progressContainer.classList.remove('hidden');
    progressBar.value = percent;
    progressText.textContent = text || `${Math.round(percent)}%`;
};

window.hideProgress = function() {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;

    progressContainer.classList.add('hidden');
    document.getElementById('progress-bar').value = 0;
    document.getElementById('progress-text').textContent = '0%';
};

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

// Initialize common elements
document.addEventListener('DOMContentLoaded', () => {
    // Clear logs button
    document.getElementById('clear-logs')?.addEventListener('click', () => {
        const logsContainer = document.getElementById('logs-container');
        logsContainer.innerHTML = '<div class="text-base-content/70">No logs yet...</div>';
    });
});
