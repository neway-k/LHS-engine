let lhsChartInstance = null;

const structuralSystemDB = {
    suppliers: {
        Rothoblaas: ["VGS Fully Threaded", "HBS Washer Head", "X-RADIUS Connector"],
        SFS: ["WR T-Drive", "WB Threaded Rod", "TwinC Fastener"]
    },
    // Baseline characterization limits mapped per Code Framework
    codeBaseMap: {
        "EC5":     { "VGS Fully Threaded": 5.2, "HBS Washer Head": 4.1, "X-RADIUS Connector": 18.5, "WR T-Drive": 5.5, "WB Threaded Rod": 6.8, "TwinC Fastener": 7.2 },
        "NDS":     { "VGS Fully Threaded": 3.4, "HBS Washer Head": 2.8, "X-RADIUS Connector": 12.1, "WR T-Drive": 3.8, "WB Threaded Rod": 4.5, "TwinC Fastener": 4.9 },
        "CSA":     { "VGS Fully Threaded": 4.1, "HBS Washer Head": 3.3, "X-RADIUS Connector": 14.6, "WR T-Drive": 4.4, "WB Threaded Rod": 5.4, "TwinC Fastener": 5.8 },
        "AS1720":  { "VGS Fully Threaded": 3.9, "HBS Washer Head": 3.1, "X-RADIUS Connector": 13.9, "WR T-Drive": 4.2, "WB Threaded Rod": 5.1, "TwinC Fastener": 5.5 },
        "AZS":     { "VGS Fully Threaded": 4.8, "HBS Washer Head": 3.9, "X-RADIUS Connector": 17.0, "WR T-Drive": 5.1, "WB Threaded Rod": 6.2, "TwinC Fastener": 6.6 }
    },
    // Unique partial factors, phi-factors, or modification behaviors native to each regional spec
    codeFactors: {
        "EC5":    { label: "k_mod / gamma_M", calculationModifier: (base) => (base * 0.90) / 1.30 }, // Medium term loading / Glulam safety factor
        "NDS":    { label: "phi * K_F * lambda", calculationModifier: (base) => base * 0.65 * 3.32 * 0.80 }, // LRFD Shear layout parameters
        "CSA":    { label: "phi * K_D (Limit States)", calculationModifier: (base) => base * 0.70 * 0.80 }, 
        "AS1720": { label: "phi * k_1 (Structural Timber)", calculationModifier: (base) => base * 0.70 * 0.85 },
        "AZS":    { label: "m_n / gamma_m (KMK Rulebook)", calculationModifier: (base) => (base * 0.85) / 1.15 }
    }
};

function updateProductFamily() {
    const supplier = document.getElementById('supplier').value;
    const productDropdown = document.getElementById('productFamily');
    productDropdown.innerHTML = "";
    
    structuralSystemDB.suppliers[supplier].forEach(product => {
        let op = document.createElement('option');
        op.value = product; op.textContent = product;
        productDropdown.appendChild(op);
    });
}

function generateLHSMatrix(N, baseDesignValue) {
    let dataset = [];
    let intervalStep = 1.0 / N;

    for (let i = 0; i < N; i++) {
        let bottomLimit = i * intervalStep;
        let topLimit = bottomLimit + intervalStep;
        
        // Stratify probability using Latin Hypercube grid slice allocation
        let stratifiedProbability = bottomLimit + Math.random() * (topLimit - bottomLimit);
        
        // Wood Density variance proxy model based on 5th percentile distribution shifts (-12% to +12% density flux)
        let structuralFluxFactor = 0.88 + (stratifiedProbability * 0.24);
        
        dataset.push(Number((baseDesignValue * structuralFluxFactor).toFixed(2)));
    }

    // Permutation step to decouple sequence ordering
    for (let i = dataset.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
    }
    return dataset;
}

function runStructuralLHS() {
    const N = parseInt(document.getElementById('sampleCount').value);
    const code = document.getElementById('designCode').value;
    const material = document.getElementById('materialType').value;
    const product = document.getElementById('productFamily').value;

    // 1. Get raw base capacity for selection
    const rawValue = structuralSystemDB.codeBaseMap[code][product];
    
    // 2. Apply explicit design code mechanics/reductions
    const codeAdjustedNominalValue = structuralSystemDB.codeFactors[code].calculationModifier(rawValue);

    // 3. Process the Latin Hypercube samples
    const lhsSamples = generateLHSMatrix(N, codeAdjustedNominalValue);

    // 4. Calculate statistical design metrics
    const minCap = Math.min(...lhsSamples);
    const maxCap = Math.max(...lhsSamples);
    const averageCap = (lhsSamples.reduce((sum, current) => sum + current, 0) / N).toFixed(2);
    const factorEquationLabel = structuralSystemDB.codeFactors[code].label;

    // 5. Output formal structural summary
    document.getElementById('outputSummary').innerText = 
        `JURISDICTION TARGET: ${code} (${factorEquationLabel} formulation applied)\n` +
        `MATERIAL PROFILE: ${material} | DESIGN BASE: ${codeAdjustedNominalValue.toFixed(2)} kN\n` +
        `-----------------------------------------------------------------\n` +
        `LHS Sample Average Design Capacity : ${averageCap} kN\n` +
        `5th Percentile Lower Limit (Governing Design Value) : ${minCap} kN\n` +
        `Upper Bound Structural Capacity Limit : ${maxCap} kN`;

    document.getElementById('resultContainer').classList.remove('hidden');
    buildCodeChart(lhsSamples, codeAdjustedNominalValue);
}

function buildCodeChart(samples, nominalValue) {
    const ctx = document.getElementById('myLhsChart').getContext('2d');
    
    let lowSpan = 0, nominalSpan = 0, highSpan = 0;
    samples.forEach(s => {
        if (s < nominalValue * 0.95) lowSpan++;
        else if (s > nominalValue * 1.05) highSpan++;
        else nominalSpan++;
    });

    if (lhsChartInstance) lhsChartInstance.destroy();

    lhsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Deficient Bound (<95%)', 'Nominal Design Region', 'Overstrength Bound (>105%)'],
            datasets: [{
                label: 'Permuted Connection Load Profiles (kN)',
                data: [lowSpan, nominalSpan, highSpan],
                backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(52, 211, 153, 0.5)', 'rgba(96, 165, 250, 0.5)'],
                borderColor: ['rgb(239, 68, 68)', 'rgb(52, 211, 153)', 'rgb(96, 165, 250)'],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8', precision: 0 }, grid: { color: '#334155' }, beginAtZero: true }
            }
        }
    });
}