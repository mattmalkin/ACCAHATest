// app.js

function toggleReference() {
    const ref = document.getElementById('referenceTables');
    ref.classList.toggle('hidden');
}

const hdSelect = document.getElementById('heartDisease');
const testContainer = document.getElementById('priorTestingContainer');
const testSelect = document.getElementById('priorTesting');

// Dynamically populate the "Prior Testing" dropdown based on the "Heart Disease" selection
hdSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    testSelect.innerHTML = ''; 
    
    if (val === 'none') {
        testSelect.innerHTML = `<option value="no_test">No Prior Testing</option>`;
        testContainer.style.opacity = '0.4';
        testSelect.disabled = true;
    } else if (val === 'ischemic') {
        testSelect.innerHTML = `
            <option value="no_test">No Prior Testing</option>
            <option value="echo_normal">TTE: No Wall Motion Abnormalities</option>
            <option value="stress_normal">Normal ECG/Imaging Stress Testing</option>
            <option value="stress_abnormal_low">Abnormal Stress: Low Risk</option>
            <option value="stress_abnormal_mod">Abnormal Stress: Mod/Severe Risk</option>
        `;
        testContainer.style.opacity = '1';
        testSelect.disabled = false;
    } else if (val === 'vhd_hf') {
        testSelect.innerHTML = `
            <option value="no_test">No Prior Testing</option>
            <option value="echo_normal">TTE: Normal/Mild</option>
            <option value="echo_mod_vhd">TTE: Moderate VHD</option>
            <option value="echo_sev_vhd">TTE: Severe VHD</option>
            <option value="echo_mod_dys">TTE: Moderate Dysfunction</option>
            <option value="echo_sev_dys">TTE: Severe Dysfunction</option>
            <option value="stress_normal">Normal Stress Testing</option>
        `;
        testContainer.style.opacity = '1';
        testSelect.disabled = false;
    }
});

// Initialize UI State
hdSelect.dispatchEvent(new Event('change'));

function getBadge(score) {
    if (score === null) return `<span class="px-2 py-1 rounded text-xs font-bold badge-na">-</span>`;
    if (score >= 7) return `<span class="px-2 py-1 rounded text-xs font-bold badge-appropriate">${score} (A)</span>`;
    if (score >= 4) return `<span class="px-2 py-1 rounded text-xs font-bold badge-may-be">${score} (M)</span>`;
    return `<span class="px-2 py-1 rounded text-xs font-bold badge-rarely">${score} (R)</span>`;
}

function calculateRisk() {
    let hd = document.getElementById('heartDisease').value;
    let test = document.getElementById('priorTesting').value;
    let rawSymptoms = document.querySelector('input[name="symptoms"]:checked').value;
    let rawMets = document.querySelector('input[name="mets"]:checked').value;
    let surgRiskIndex = parseInt(document.getElementById('surgicalRisk').value);

    // Per the algorithm headers: presence of symptoms OR <4 METs triggers the symptomatic logic
    let combinedCondition = (rawSymptoms === "yes" || rawMets === "lt4") ? "lt4" : "ge4";
    
    // Build the data lookup key
    let key = `${hd}_${test}_${combinedCondition}`;
    
    const resultsContainer = document.getElementById('resultsTable');
    resultsContainer.innerHTML = '';

    // db and modalities are accessed globally from data.js
    if (db[key] && db[key][surgRiskIndex]) {
        const scores = db[key][surgRiskIndex];
        modalities.forEach((modality, index) => {
            const score = scores[index];
            const badge = getBadge(score);
            
            let bgStyle = score === null ? "bg-gray-50 opacity-60" : "bg-white";
            
            resultsContainer.innerHTML += `
                <div class="flex justify-between items-center ${bgStyle} p-3 rounded shadow-sm border border-gray-100">
                    <span class="text-sm font-medium text-gray-700">${modality}</span>
                    ${badge}
                </div>
            `;
        });
    } else {
        resultsContainer.innerHTML = `
            <div class="col-span-2 bg-red-50 border-l-4 border-red-500 p-4">
                <p class="text-sm text-red-700">Unable to resolve the requested clinical pathway mapping. Please verify inputs.</p>
            </div>`;
    }
}