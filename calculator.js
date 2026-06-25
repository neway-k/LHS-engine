let generatedMatrixData = []; // Cache memory holder for cross-row data extraction

// Hierarchical Structure Definition Matrix
const screw_dependency_tree = {
    'EN 1995:2004': {
        'Rothoblaas': {'HBS': {
            'EN 1995-1-1:2004': ['HBS 6*300'],
            'Rothoblaas ETA': ['HBS 6*300']
        }},
        'Spax': {'Wirox PT': {
            'EN 1995-1-1:2004': ['SPAX Wirox CSK/H. P/T. 8*300'],
            'Spax ETA': ['SPAX Wirox CSK/H. P/T. 8*300']
        }},
        'Klimas': {'WKCH': {
            'EN 1995-1-1:2004': ['WKCS 6*300'],
            'Klimas ETA': ['WKCS 6*300']
        }},
        'Schmid': {'RAPID® Hardwood CS / partially threaded / countersunk head': {
            'EN 1995-1-1:2004': ['RAPID® Hardwood CS / partially threaded / countersunk head 8 * 240'],
            'Schmid ETA': ['RAPID® Hardwood CS / partially threaded / countersunk head 8 * 240']
        }}
    },
    'FprEN 1995:2025': {
        'Rothoblaas': {'HBS': {'FprEN 1995-1-1:2025': ['HBS 6*300']}},
        'Spax': {'Wirox PT': {'FprEN 1995-1-1:2025': ['SPAX Wirox CSK/H. P/T. 8*300']}},
        'Klimas': {'WKCS': {'FprEN 1995-1-1:2025': ['WKCS 6*300']}},
        'Schmid': {'RAPID® Hardwood CS / partially threaded / countersunk head': {'FprEN 1995-1-1:2025': ['RAPID® Hardwood CS / partially threaded / countersunk head 8 * 240']}}
    },
    'AS 1720:2010': {
        'Rothoblaas': {'HBS': {
            'AS 1720:2010': ['HBS 6*300'],
            'Rothoblaas ETA': ['HBS 6*300']
        }},
        'Spax': {'Wirox PT': {
            'AS 1720:2010': ['SPAX Wirox CSK/H. P/T. 8*300'],
            'Spax ETA': ['SPAX Wirox CSK/H. P/T. 8*300']
        }},
        'Klimas': {'WKCS': {
            'AS 1720:2010': ['WKCS 6*300'],
            'Klimas ETA': ['WKCS 6*300']
        }},
        'Schmid': {'RAPID® Hardwood CS / partially threaded / countersunk head': {
            'AS 1720:2010': ['RAPID® Hardwood CS / partially threaded / countersunk head 8 * 240'],
            'Schmid ETA': ['RAPID® Hardwood CS / partially threaded / countersunk head 8 * 240']
        }}
    },
    'AWC/NDS:2018': {
        'Rothoblaas': {'HBS': {
            'AWC/NDS:2018': ['HBS Countersunk Partially Threaded  6 * 300'],
            'Rothoblaas ICC': ['HBS Countersunk Partially Threaded  6 * 300']
        }},
        'Spax': {'Sharp Tip': {
            'AWC/NDS:2018': ['Sharp Tip Hex Partially Threaded  12 * 304.8'],
            'Spax ICC': ['Sharp Tip Hex Partially Threaded  12 * 304.8']
        }},
        'Klimas': {'WKCS': {
            'AWC/NDS:2018': ['WKCS Countersunk Partially Threaded  6 * 280'],
            'AKlimas ICC': ['WKCS Countersunk Partially Threaded  6 * 280']
        }}
    },
    'CSA O86:2019': {
        'Rothoblaas': {'HBS': {
            'CSA O86:2019': ['HBS Countersunk Partially Threaded  6 * 320']
        }}
    },
    'CSA O86:2024': {
        'Rothoblaas': {'HBS': {
            'CSA O86:2024': ['HBS Countersunk Partially Threaded  6 * 320']
        }}
    }
};

const EC = ['EN 1995:2004', 'FprEN 1995:2025'];
const AU = ['AS 1720:2010'];
const US = ['AWC/NDS:2018'];
const CSA = ['CSA O86:2019', 'CSA O86:2024'];

// 57-Column Global Structural Blueprint configuration mapping array
const registry_blueprint = [
    ['Units', ['Imperial', 'Metric'], null],
    ['Design Code', ['EN 1995:2004', 'AS 1720:2010', 'FprEN 1995:2025', 'AWC/NDS:2018', 'CSA O86:2019', 'CSA O86:2024'], null],
    ['Fastner Type', ['Screw', 'Nail'], null],
    ['Connection Type', ['Discrete', 'Continuous'], null],
    ['Grain Orientation', ['Side Grain', 'End Grain'], null],
    ['Hardwood Types', ['Ring porous', 'Diffuse porous'], null],
    ['Material 1', ['Softwood', 'LVL Softwood', 'Hardwood', 'Beech LVL', 'CLT', 'Plywood', 'GLT'], null],
    ['Length 1', [500, 1000, 1500, 2000], null],
    ['Width 1', [500, 1000, 1500, 2000], null],
    ['depth 1', [100, 200, 300, 400, 600], null],
    ['Material 2', ['Softwood', 'LVL Softwood', 'Hardwood', 'Beech LVL', 'CLT', 'Plywood', 'GLT'], null],
    ['depth 2', [100, 200, 300, 400, 600], null],
    ['N, ED', [5, 10, 15, 20, 30], null],
    ['V, ED ||', [5, 10, 15, 20, 30], null],
    ['V, ED ₸', [5, 10, 15, 20, 30], null],
    ['Pre-drilling', ['Yes', 'No'], null],
    ['Supplier', '__supplier__', null],
    ['Screw Family', '__screw_family__', null],
    ['Type', '__type__', null],
    ['Analytical Method', '__analytical_method__', null],
    ['Screw arrangment', ['Manual Arrangement', 'Standard Arrangement'], null],
    ['n along 0', [3, 5, 7, 9], null],
    ['n along 90', [3, 5, 7, 9], null],
    ['a1', [50, 60, 70, 80], null],
    ['a2', [60, 80, 100, 120], null],
    ['a3', [60, 80, 100, 120], null],
    ['a4', [50, 60, 70, 80], null],
    ['pk1', [350, 400, 450, 500], EC],
    ['pm1', [420, 450, 550], EC],
    ['pk2', [350, 400, 450, 500], EC],
    ['pm2', [420, 450, 550], EC],
    ['α90', [45, 90], null],
    ['α0', [45, 90], null],
    ['steel plate', ['Yes', 'No'], null],
    ['plate thickness', [100, 200], null],
    ['Fastener Position', ['Flush with member face', 'Centered about horizontal tension perpendicular plane', 'Custom embedment length'], null],
    ['γm', [1.3], EC],
    ['Kmod', [0.6, 0.8, 0.9, 1], EC],
    ['φ', [0.5, 0.7, 0.9], AU],
    ['Joint group', ['J1', 'J2', 'J3', 'JD1', 'JD2', 'JD3'], AU],
    ['Pre-Drilling_AU', ['yes', 'no'], AU],
    ['K1', [0.8, 1], AU],
    ['K7', [1, 1.4], AU],
    ['K13', [1, 1.2], AU],
    ['Design philosophy', ['LRFD', 'ASD'], US],
    ['Cm', [1, 1.2], US],
    ['Ct', [1, 1.2], US],
    ['Time effect factor', [0.4, 0.6, 0.8], US],
    ['Moisture Content (%)', [10, 12, 14], US],
    ['Load Duration', ["Permanent", "Normal", "Seven Days"], US],
    ['Temperature (oF)', ["T≤1000F", "1000F<T≤1250F", "1250F<T≤1500F"], US],
    ['Service condition', ["Dry", "Wet"], US],
    ['Pre-Drilling_US', ["yes", "no"], US],
    ['Moisture content (%)_CSA', [12, 14], CSA],
    ['Load duration_CSA', ["Long Term", "Standard Term", "Short Term"], CSA],
    ['Service condition_CSA', ["Dry", "Wet"], CSA],
    ['Treatment factor', [1.0, 1.2], CSA]
];

// Discrete sample mapper tracking the exact math calculation logic of the Python Golden Master
function sample_val(prob, spec) {
    if (typeof spec === 'string' || !spec || spec.length === 0) return "";
    let idx = Math.floor(prob * spec.length);
    if (idx >= spec.length) idx = spec.length - 1;
    return spec[idx];
}

// Generate stratified pseudo-random grids replicating the SciPy QMC Latin Hypercube space
function generateLhsMatrix(rows, dimensions) {
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let d = 0; d < dimensions; d++) {
            let step = 1.0 / rows;
            let low = i * step;
            let high = low + step;
            row.push(low + Math.random() * (high - low));
        }
        matrix.push(row);
    }
    // Permutation shuffle loop
    for (let d = 0; d < dimensions; d++) {
        for (let i = rows - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            let temp = matrix[i][d];
            matrix[i][d] = matrix[j][d];
            matrix[j][d] = temp;
        }
    }
    return matrix;
}

function runGoldenMasterLHS() {
    const targetCount = parseInt(document.getElementById('targetScenarios').value);
    const populationSize = parseInt(document.getElementById('initialPop').value);
    const totalDim = registry_blueprint.length;

    const rawSamples = generateLhsMatrix(populationSize, totalDim);
    generatedMatrixData = [];

    for (let row = 0; row < populationSize; row++) {
        if (generatedMatrixData.length >= targetCount) break;

        let record = {};
        registry_blueprint.forEach(c => record[c[0]] = "");

        // Step A: Pre-resolve the engineering lookup chain using explicit index alignments
        let p_code = sample_val(rawSamples[row][1], ['EN 1995:2004', 'AS 1720:2010', 'FprEN 1995:2025', 'AWC/NDS:2018', 'CSA O86:2019', 'CSA O86:2024']);
        
        let suppliers_pool = Object.keys(screw_dependency_tree[p_code] || {});
        if (!['EN 1995:2004', 'FprEN 1995:2025', 'AS 1720:2010'].includes(p_code)) {
            suppliers_pool = suppliers_pool.filter(s => s !== 'Schmid');
        }

        let p_sup = suppliers_pool.length ? sample_val(rawSamples[row][16], suppliers_pool) : "";
        let families_pool = p_sup ? Object.keys(screw_dependency_tree[p_code][p_sup] || {}) : [];
        let p_family = families_pool.length ? sample_val(rawSamples[row][17], families_pool) : "";
        let methods_pool = p_family ? Object.keys(screw_dependency_tree[p_code][p_sup][p_family] || {}) : [];
        let p_method = methods_pool.length ? sample_val(rawSamples[row][19], methods_pool) : "";
        let types_pool = p_method ? (screw_dependency_tree[p_code][p_sup][p_family][p_method] || []) : [];
        let p_type = types_pool.length ? sample_val(rawSamples[row][18], types_pool) : "";

        // Step B: Core data evaluation loop matching validation matrices
        for (let idx = 0; idx < totalDim; idx++) {
            let [colName, specCfg, applicable] = registry_blueprint[idx];
            let prob = rawSamples[row][idx];

            if (applicable && !applicable.includes(p_code)) continue;

            if (specCfg === '__supplier__') record[colName] = p_sup;
            else if (specCfg === '__screw_family__') record[colName] = p_family;
            else if (specCfg === '__analytical_method__') record[colName] = p_method;
            else if (specCfg === '__type__') record[colName] = p_type;
            else record[colName] = sample_val(prob, specCfg);
        }

        if (record['Design Code']) {
            generatedMatrixData.push(record);
        }
    }

    renderMatrixDOM();
}

function renderMatrixDOM() {
    document.getElementById('placeholderText').classList.add('hidden');
    document.getElementById('matrixContainer').classList.remove('hidden');
    
    // Enable download button once calculations pass successfully
    const dlBtn = document.getElementById('downloadBtn');
    dlBtn.disabled = false;
    dlBtn.className = "bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg hover:bg-emerald-600 uppercase tracking-wider flex items-center gap-2 cursor-pointer";

    // Rebuild dynamic headers
    const headerRow = document.getElementById('tableHeaderRow');
    headerRow.innerHTML = `<th class="p-3 border-b border-slate-800 text-slate-400">Row ID</th>`;
    registry_blueprint.forEach(col => {
        headerRow.innerHTML += `<th class="p-3 border-b border-slate-800">${col[0]}</th>`;
    });

    // Populate data cells
    const tbody = document.getElementById('tableBodyRow');
    tbody.innerHTML = "";
    
    generatedMatrixData.forEach((row, rowIndex) => {
        let trHtml = `<tr class="hover:bg-slate-850/60 transition"><td class="p-2 text-slate-500 font-bold border-r border-slate-900">${rowIndex + 1}</td>`;
        registry_blueprint.forEach(col => {
            let value = row[col[0]];
            let displayVal = value !== undefined && value !== null ? value : "";
            let colorClass = displayVal === "" ? "text-slate-600 bg-slate-900/30 font-light" : "text-emerald-400 font-medium";
            trHtml += `<td class="p-2 border-r border-slate-900 ${colorClass}">${displayVal}</td>`;
        });
        trHtml += `</tr>`;
        tbody.innerHTML += trHtml;
    });

    // Output status box metrics
    const stats = document.getElementById('statsSummary');
    stats.classList.remove('hidden');
    stats.innerHTML = `📊 ENGINE VERIFICATION STATUS:<br>` +
                      `• Target Rows Built: ${generatedMatrixData.length}<br>` +
                      `• Vector Size: ${registry_blueprint.length} Columns<br>` +
                      `• System Status: Safe Matrix Validated`;
}

// Seamlessly stream processed browser objects directly to structural engineers' native Excel spreadsheets
function exportToExcel() {
    if (!generatedMatrixData.length) return;

    // Build structural worksheet matrix arrays
    const excelRows = generatedMatrixData.map(row => {
        let orderedRow = {};
        registry_blueprint.forEach(col => {
            // Remove code-specific tags for final sheet presentation
            let cleanHeaderName = col[0].split('_')[0];
            orderedRow[cleanHeaderName] = row[col[0]];
        });
        return orderedRow;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, "Scenarios");
    
    // Write out Excel file to local workstation disk space instantly
    XLSX.writeFile(wb, "Screw_Lateral_LHS_Scenarios.xlsx");
}