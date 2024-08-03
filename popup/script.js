// 当DOM加载完成时执行回调函数
document.addEventListener('DOMContentLoaded', function() {
    // 获取开关元素
    const switchElement = document.getElementById('switch');
    // 获取复选框1元素
    const checkbox1 = document.getElementById('checkbox1');
    // 获取复选框2元素
    const checkbox2 = document.getElementById('checkbox2');

    // 获取当前活动选项卡的URL
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            const urlStr = tabs[0].url;
            console.log('获取到的 URL: ', urlStr);

            // 检查URL是否以"http"开头
            if (urlStr && urlStr.startsWith('http')) {
                try {
                    // 解析URL获取域名
                    const url = new URL(urlStr);
                    const domain = url.hostname;
                    console.log('解析出的域名: ', domain);

                    // 从存储中获取当前域名的设置
                    chrome.storage.sync.get([domain], function(result) {
                        if (result[domain]) {
                            const settings = result[domain];
                            // 将获取到的设置应用到开关和复选框元素上
                            switchElement.checked = settings.switch;
                            checkbox1.checked = settings.checkbox1;
                            checkbox2.checked = settings.checkbox2;
                            console.log('获取到的设置: ', settings);
                        } else {
                            console.log('没有找到相关设置，使用默认值');
                        }
                    });

                    // 保存当前域名的设置
                    function saveSettings() {
                        const settings = {
                            switch: switchElement.checked,
                            checkbox1: checkbox1.checked,
                            checkbox2: checkbox2.checked
                        };
                        const obj = {};
                        obj[domain] = settings;
                        // 将设置保存到存储中
                        chrome.storage.sync.set(obj, function() {
                            console.log('保存设置: ', settings);
                        });
                    }

                    // 监听开关元素的状态变更事件
                    switchElement.addEventListener('change', function() {
                        console.log('Switch 状态变更: ', switchElement.checked);
                        // 保存设置
                        saveSettings();
                    });
                    // 监听复选框1元素的状态变更事件
                    checkbox1.addEventListener('change', function() {
                        console.log('Checkbox1 状态变更: ', checkbox1.checked);
                        // 保存设置
                        saveSettings();
                    });
                    // 监听复选框2元素的状态变更事件
                    checkbox2.addEventListener('change', function() {
                        console.log('Checkbox2 状态变更: ', checkbox2.checked);
                        // 保存设置
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

// 打开选项页面的函数
function openOptionsPage () {
    // 创建新的选项卡并打开选项页面
    chrome.tabs.create({ url: chrome.runtime.getURL("options/options.html") });
}

// 当DOM加载完成时执行回调函数
document.addEventListener('DOMContentLoaded', function() {
    // 获取打开选项页面按钮元素
    var button = document.getElementById('openOptions');
    // 监听按钮的点击事件
    button.addEventListener('click', function() {
        // 调用打开选项页面的函数
        openOptionsPage();
    });
});
