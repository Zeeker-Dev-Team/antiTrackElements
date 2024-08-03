document.addEventListener('DOMContentLoaded', function() {
    const paramsTable = document.getElementById('paramsTable'); // 获取参数表格元素
    const newParamInput = document.getElementById('newParam'); // 获取新参数输入框元素
    const newParamTypeSelect = document.getElementById('newParamType'); // 获取新参数类型选择框元素
    const addButton = document.getElementById('addButton'); // 获取添加按钮元素
    const saveButton = document.getElementById('saveButton'); // 获取保存按钮元素
    const exportButton = document.getElementById('exportButton'); // 获取导出按钮元素
    const importButton = document.getElementById('importButton'); // 获取导入按钮元素
    const importInput = document.getElementById('importInput'); // 获取导入输入框元素
    const presetSelect = document.getElementById('presetSelect'); // 获取预设选择框元素

    let params = []; // 存储参数数组
    let presetParams = {}; // 存储预设参数

    // 读取 maps.json 文件
    fetch(chrome.runtime.getURL('rules/maps.json')) // 使用fetch函数获取maps.json文件
        .then(response => response.json()) // 将响应转换为JSON格式
        .then(data => {
            data.forEach(preset => {
                presetParams[preset.name] = preset.loc; // 将预设参数的名称和位置存储到presetParams对象中
                const option = document.createElement('option'); // 创建option元素
                option.value = preset.name; // 设置option的值为预设参数的名称
                option.textContent = preset.name; // 设置option的文本内容为预设参数的名称
                presetSelect.appendChild(option); // 将option元素添加到预设选择框中
            });

            // 加载已保存的参数或默认参数
            chrome.storage.sync.get('trackingParams', function(storageData) { // 从存储中获取trackingParams参数
                const defaultPreset = data.find(preset => preset.name === "默认"); // 查找名称为"默认"的预设参数
                const defaultPresetLoc = defaultPreset ? defaultPreset.loc : null; // 获取默认预设参数的位置
                if (storageData.trackingParams && storageData.trackingParams.length > 0) {
                    params = storageData.trackingParams; // 如果存储中存在trackingParams参数，则将其赋值给params数组
                    renderTable(params); // 渲染参数表格
                } else if (defaultPresetLoc) {
                    loadPresetParams(defaultPresetLoc); // 加载默认预设参数
                }
            });
        })
        .catch(error => console.error('Error loading maps.json:', error)); // 捕获加载maps.json文件时的错误

    function loadPresetParams(presetLoc) {
        fetch(chrome.runtime.getURL(presetLoc)) // 使用fetch函数获取预设参数文件
            .then(response => response.json()) // 将响应转换为JSON格式
            .then(data => {
                params = data; // 将预设参数赋值给params数组
                renderTable(params); // 渲染参数表格
            })
            .catch(error => console.error(`Error loading ${presetLoc}:`, error)); // 捕获加载预设参数文件时的错误
    }

    function renderTable(params) {
        paramsTable.innerHTML = ''; // 清空参数表格内容
        params.forEach((paramObj, index) => {
            const row = document.createElement('tr'); // 创建表格行元素
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
            `; // 设置表格行的HTML内容
            paramsTable.appendChild(row); // 将表格行添加到参数表格中
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index')); // 获取要删除的参数的索引
                params.splice(index, 1); // 从params数组中删除指定索引的参数
                renderTable(params); // 重新渲染参数表格
            });
        });

        document.querySelectorAll('.param-input').forEach(input => {
            input.addEventListener('input', function() {
                const index = parseInt(this.getAttribute('data-index')); // 获取参数输入框的索引
                params[index].param = this.value; // 更新params数组中对应索引的参数值
            });
        });

        document.querySelectorAll('.param-type').forEach(select => {
            select.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index')); // 获取参数类型选择框的索引
                params[index].type = this.value; // 更新params数组中对应索引的参数类型
            });
        });
    }

    presetSelect.addEventListener('change', function() {
        const selectedPreset = this.value; // 获取选择的预设参数名称
        const presetLoc = presetParams[selectedPreset]; // 获取选择的预设参数的位置
        loadPresetParams(presetLoc); // 加载选择的预设参数
    });

    addButton.addEventListener('click', function() {
        const newParam = newParamInput.value.trim(); // 获取新参数的值
        const newParamType = newParamTypeSelect.value; // 获取新参数的类型
        if (newParam) {
            params.push({ param: newParam, type: newParamType }); // 将新参数添加到params数组中
            newParamInput.value = ''; // 清空新参数输入框
            renderTable(params); // 渲染参数表格
        }
    });

    saveButton.addEventListener('click', function() {
        const params = Array.from(document.querySelectorAll('.param-input')).map((input, index) => {
            return { param: input.value.trim(), type: document.querySelectorAll('.param-type')[index].value };
        }).filter(paramObj => paramObj.param); // 获取参数表格中的参数值和类型，并过滤掉空参数
        chrome.storage.sync.set({ trackingParams: params }, function() { // 将参数保存到存储中
            console.log('追踪参数已保存:', params);
            alert('追踪参数保存成功!');
        });
    });

    exportButton.addEventListener('click', function() {
        // 添加参数导出逻辑
        
    });
});
