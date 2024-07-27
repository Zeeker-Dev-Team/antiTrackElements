document.addEventListener('DOMContentLoaded', function() {
    const switchElement = document.getElementById('switch');
    const checkbox1 = document.getElementById('checkbox1');
    const checkbox2 = document.getElementById('checkbox2');

    // 获取当前域名
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            const urlStr = tabs[0].url;
            console.log('获取到的 URL: ', urlStr);

            if (urlStr && urlStr.startsWith('http')) {
                try {
                    const url = new URL(urlStr);
                    const domain = url.hostname;
                    console.log('解析出的域名: ', domain);

                    // 从存储中获取当前域名的状态
                    chrome.storage.sync.get([domain], function(result) {
                        if (result[domain]) {
                            const settings = result[domain];
                            switchElement.checked = settings.switch;
                            checkbox1.checked = settings.checkbox1;
                            checkbox2.checked = settings.checkbox2;
                            console.log('获取到的设置: ', settings);
                        } else {
                            console.log('没有找到相关设置，使用默认值');
                        }
                    });

                    // 保存当前域名的状态
                    function saveSettings() {
                        const settings = {
                            switch: switchElement.checked,
                            checkbox1: checkbox1.checked,
                            checkbox2: checkbox2.checked
                        };
                        const obj = {};
                        obj[domain] = settings;
                        chrome.storage.sync.set(obj, function() {
                            console.log('保存设置: ', settings);
                        });
                    }

                    switchElement.addEventListener('change', function() {
                        console.log('Switch 状态变更: ', switchElement.checked);
                        saveSettings();
                    });
                    checkbox1.addEventListener('change', function() {
                        console.log('Checkbox1 状态变更: ', checkbox1.checked);
                        saveSettings();
                    });
                    checkbox2.addEventListener('change', function() {
                        console.log('Checkbox2 状态变更: ', checkbox2.checked);
                        saveSettings();
                    });

                } catch (e) {
                    console.error('获取域名时发生错误: ', e);
                }
            } else {
                console.error('无效的 URL: ', urlStr);
            }
        } else {
            console.error('没有找到活动的选项卡');
        }
    });
});
