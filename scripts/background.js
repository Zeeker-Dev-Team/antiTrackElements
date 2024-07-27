const RULE_ID = 1;

// 应用默认规则
function applyDefaultRule(trackingParams) {
  const removeQueryParamList = trackingParams.map(paramObj => paramObj.param);

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              removeParams: removeQueryParamList
            }
          }
        }
      },
      condition: {
        urlFilter: '|http*',
        resourceTypes: ["main_frame", "sub_frame"]
      }
    }],
    removeRuleIds: [RULE_ID]
  }, () => {
    console.log('Default tracking parameters removal rule applied.');
  });
}

// 删除特定域名的规则
function removeRuleForDomain() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID]
  }, () => {
    console.log('Tracking parameters removal rule removed for this domain.');
  });
}

// 初始应用默认规则
chrome.storage.sync.get(['trackingParams'], (result) => {
  const trackingParams = result.trackingParams || [];
  applyDefaultRule(trackingParams);
});

// 添加监听器，以便在存储更改时更新规则
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    chrome.storage.sync.get(['trackingParams'], (result) => {
      const trackingParams = result.trackingParams || [];
      applyDefaultRule(trackingParams);
    });
  }
});
