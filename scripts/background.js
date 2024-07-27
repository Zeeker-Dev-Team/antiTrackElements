// background.js

// 规则 ID
const RULE_ID = 1;

// 初始化时加载已保存的设置并应用规则
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (result) => {
    applyDefaultRule(); // 默认启用规则
    for (let domain in result) {
      const settings = result[domain];
      if (settings && !settings.switch && !settings.checkbox1) {
        removeRuleForDomain(); // 如果 `switch` 和 `checkbox1` 均未选中，则移除规则
      }
    }
  });
  console.log('Anti Track Elements extension installed.');
});

// 动态添加默认规则
function applyDefaultRule() {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              removeParams: [
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_term",
                "utm_content",
                "utm_*"
              ]
            }
          }
        }
      },
      condition: {
        urlFilter: '*://*/*',
        resourceTypes: ["main_frame"]
      }
    }],
    removeRuleIds: [RULE_ID]
  }, () => {
    console.log('Applied default rule');
  });
}

// 动态移除规则
function removeRuleForDomain() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID]
  }, () => {
    console.log('Removed rule');
  });
}

// 监听存储变化并更新规则
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    for (let domain in changes) {
      const settings = changes[domain].newValue;
      if (settings && !settings.switch && !settings.checkbox1) {
        removeRuleForDomain(); // 如果 `switch` 和 `checkbox1` 均未选中，则移除规则
      } else {
        applyDefaultRule(); // 否则启用默认规则
      }
    }
  }
});
