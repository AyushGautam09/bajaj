document.getElementById('submitBtn').addEventListener('click', async () => {
    const inputElement = document.getElementById('dataInput');
    const outputElement = document.getElementById('outputPre');
    const errorElement = document.getElementById('errorBox');
    
    errorElement.classList.add('hidden');
    outputElement.textContent = '';

    let parsedData;
    try {
        parsedData = JSON.parse(inputElement.value);
        if (!Array.isArray(parsedData)) {
            throw new Error("Input must be a JSON array");
        }
    } catch (err) {
        errorElement.textContent = "Invalid JSON format: " + err.message;
        errorElement.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/bfhl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: parsedData })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const responseData = await response.json();
        outputElement.textContent = JSON.stringify(responseData, null, 4);
    } catch (err) {
        errorElement.textContent = "API Call Failed: " + err.message;
        errorElement.classList.remove('hidden');
    }
});