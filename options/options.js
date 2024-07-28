document.addEventListener('DOMContentLoaded', function() {
    const paramsTable = document.getElementById('paramsTable');
    const newParamInput = document.getElementById('newParam');
    const newParamTypeSelect = document.getElementById('newParamType');
    const addButton = document.getElementById('addButton');
    const saveButton = document.getElementById('saveButton');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importInput = document.getElementById('importInput');
    const presetSelect = document.getElementById('presetSelect');

    let params = [];
    let presetParams = {};

    // 读取 maps.json 文件
    fetch(chrome.runtime.getURL('rules/maps.json'))
        .then(response => response.json())
        .then(data => {
            data.forEach(preset => {
                presetParams[preset.name] = preset.loc;
                const option = document.createElement('option');
                option.value = preset.name;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });

            // 加载已保存的参数或默认参数
            chrome.storage.sync.get('trackingParams', function(storageData) {
                const defaultPreset = data.find(preset => preset.name === "默认");
                const defaultPresetLoc = defaultPreset ? defaultPreset.loc : null;
                if (storageData.trackingParams && storageData.trackingParams.length > 0) {
                    params = storageData.trackingParams;
                    renderTable(params);
                } else if (defaultPresetLoc) {
                    loadPresetParams(defaultPresetLoc);
                }
            });
        })
        .catch(error => console.error('Error loading maps.json:', error));

    function loadPresetParams(presetLoc) {
        fetch(chrome.runtime.getURL(presetLoc))
            .then(response => response.json())
            .then(data => {
                params = data;
                renderTable(params);
            })
            .catch(error => console.error(`Error loading ${presetLoc}:`, error));
    }

    function renderTable(params) {
        paramsTable.innerHTML = '';
        params.forEach((paramObj, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border px-4 py-2">
                    <input type="text" value="${paramObj.param}" class="param-input w-full p-1 border border-gray-300 rounded-md" data-index="${index}">
                </td>
                <td class="border px-4 py-2">
                    <select class="param-type w-full p-1 border border-gray-300 rounded-md" data-index="${index}">
                        <option value="string" ${paramObj.type === "string" ? "selected" : ""}>字符串</option>
                        <option value="regex" ${paramObj.type === "regex" ? "selected" : ""}>正则表达式</option>
                        <option value="wildcard" ${paramObj.type === "wildcard" ? "selected" : ""}>通配符</option>
                    </select>
                </td>
                <td class="border px-4 py-2 text-center">
                    <button class="delete-button bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700" data-index="${index}">删除</button>
                </td>
            `;
            paramsTable.appendChild(row);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                params.splice(index, 1);
                renderTable(params);
            });
        });

        document.querySelectorAll('.param-input').forEach(input => {
            input.addEventListener('input', function() {
                const index = parseInt(this.getAttribute('data-index'));
                params[index].param = this.value;
            });
        });

        document.querySelectorAll('.param-type').forEach(select => {
            select.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                params[index].type = this.value;
            });
        });
    }

    presetSelect.addEventListener('change', function() {
        const selectedPreset = this.value;
        const presetLoc = presetParams[selectedPreset];
        loadPresetParams(presetLoc);
    });

    addButton.addEventListener('click', function() {
        const newParam = newParamInput.value.trim();
        const newParamType = newParamTypeSelect.value;
        if (newParam) {
            params.push({ param: newParam, type: newParamType });
            newParamInput.value = '';
            renderTable(params);
        }
    });

    saveButton.addEventListener('click', function() {
        const params = Array.from(document.querySelectorAll('.param-input')).map((input, index) => {
            return { param: input.value.trim(), type: document.querySelectorAll('.param-type')[index].value };
        }).filter(paramObj => paramObj.param);
        chrome.storage.sync.set({ trackingParams: params }, function() {
            console.log('追踪参数已保存:', params);
            alert('追踪参数保存成功!');
        });
    });

    exportButton.addEventListener('click', function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(params));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "trackingParams.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importButton.addEventListener('click', function() {
        importInput.click();
    });

    importInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedParams = JSON.parse(e.target.result);
                    if (Array.isArray(importedParams)) {
                        params = importedParams;
                        renderTable(params);
                        chrome.storage.sync.set({ trackingParams: params }, function() {
                            console.log('导入的追踪参数已保存:', params);
                            alert('追踪参数导入成功!');
                        });
                    } else {
                        alert('导入的文件格式不正确。');
                    }
                } catch (error) {
                    alert('导入过程中出现错误：' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });
});
