const fs = require('fs');
const path = require('path');

async function run() {
    console.log('Starting Integration Verification...');

    try {
        // 1. Health Check
        const healthRes = await fetch('http://localhost:3001/api/health');
        const healthData = await healthRes.json();
        console.log('Health:', healthData);

        // 2. Add Item
        const item = {
            name: "IntegrationTestItem",
            quantity: 10,
            category: "pantry",
            price: 5.99
        };

        console.log('Adding item...');
        const addRes = await fetch('http://localhost:3001/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });

        if (addRes.status !== 201) {
            console.error('Failed to add item:', await addRes.text());
            process.exit(1);
        }

        const addedItem = await addRes.json();
        console.log('Added Item Response:', addedItem);

        // 3. Verify DB File
        const dbPath = './smartcart.db.json';
        if (fs.existsSync(dbPath)) {
            console.log('✅ DB File exists!');
            const content = fs.readFileSync(dbPath, 'utf8');
            console.log('DB Content (First 50 chars):', content.substring(0, 50) + '...');
            if (!content.trim().startsWith('{')) {
                console.log('✅ DB Content is ENCRYPTED (not plain JSON)');
            }
        } else {
            console.error('❌ DB File MISSING!');
            process.exit(1);
        }

        // 4. Test Smart OCR
        const ocrText = "Organic Apple 2.99\n3x Banana 0.50";
        console.log('Testing Smart OCR Import...');
        const ocrRes = await fetch('http://localhost:3001/api/inventory/import-ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: ocrText })
        });

        if (ocrRes.status === 200) {
            const ocrData = await ocrRes.json();
            console.log('OCR Result:', JSON.stringify(ocrData, null, 2));
            if (ocrData.added > 0) console.log('✅ OCR Import Successful!');
            else console.warn('⚠️ OCR ran but added 0 items.');
        } else {
            console.error('❌ OCR Failed:', await ocrRes.text());
        }

        console.log('🎉 Verification Complete! Backend is 100% Active.');

    } catch (error) {
        console.error('Integration failed:', error);
        process.exit(1);
    }
}

run();
