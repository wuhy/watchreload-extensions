/**
 * @file background Page
 * @author sparklewhy@gmail.com
 */

/**
 * watchreload 按钮启用/禁用按钮信息定义
 *
 * @type {string}
 */
var enableWatchreload = {
    icon: 'img/icon19.png',
    title: 'Click to disable watchreload'
};
var disableWatchreload = {
    icon: 'img/icon19_disabled.png',
    title: 'Click to enable watchreload'
};

/**
 * 设置 `watchreload` 按钮状态
 *
 * @param {number} tabId 要注入的目标Tab的Id
 * @param {boolean=} isEnabled 是否启用，可选，默认从上次状态切换为另外一种状态
 */
function setWatchreloadBtnState(tabId, isEnabled) {
    var btnInfo = isEnabled ? enableWatchreload : disableWatchreload;

    chrome.browserAction.setIcon({
        tabId: tabId,
        path: btnInfo.icon
    });

    chrome.browserAction.setTitle({
        tabId: tabId,
        title: btnInfo.title
    });

    injectWatchreload(tabId, isEnabled);
}

/**
 * 变更当前 watchreload 当前启用状态
 *
 * @param {chrome.tabs.Tab} tab 要变更状态的Tab
 */
function toggleWatchreloadState(tab) {
    var tabId = tab.id;

    var watchreloadEnabled = Boolean(Number(localStorage[tabId]) || false);
    watchreloadEnabled = !watchreloadEnabled;

    // 存储 tab 的 watchreload 启用状态到本地
    localStorage[tabId] = watchreloadEnabled ? 1 : 0;

    // 变更 watchreload 按钮状态
    setWatchreloadBtnState(tabId, watchreloadEnabled);
}

/**
 * 注入 watchreload 客户端脚本
 *
 * @param {number} tabId 要注入的目标Tab的Id
 */
function injectWatchreload(tabId, isEnabled) {
    getWatchreloadOptions(function (options) {
        options.enabled = isEnabled;
        options.js = 'browser-reload.js';
        chrome.tabs.sendMessage(tabId, options);
    });
}

/**
 * 保存 `watchreload` 设置选项
 *
 * @param {Object} options 设置的选项值
 * @param {string} options.ip 设置的ip地址
 * @param {string} options.port 设置的端口
 * @param {function} callback 设置完成要执行的回调
 */
function saveWatchreloadOptions(options, callback) {
    chrome.storage.sync.set({
        ip: options.ip,
        port: options.port
    }, function () {
        callback && callback.apply(this, arguments);
    });
}

/**
 * 获取 `watchreload` 设置选项信息
 *
 * @param {function} callback 获取完成执行的回调
 */
function getWatchreloadOptions(callback) {

    // 默认使用 127.0.0.1:12345
    chrome.storage.sync.get({
        ip: '127.0.0.1',
        port: 12345
    }, function () {
        callback && callback.apply(this, arguments);
    });
}

/**
 * Tab移除事件处理器
 *
 * @param {number} tabId 被移除Tab的Id
 */
function tabRemove(tabId) {

    // 移除本地存储存储的 tab 的 watchreload 启用状态
    localStorage.removeItem(tabId);
}

/**
 * Tab更新事件处理器
 *
 * @param {number} tabId 更新的Tab的Id
 */
function tabUpdate(tabId) {

    // 恢复 tab 的 watchreload 的启用状态
    setWatchreloadBtnState(tabId, !!Number(localStorage[tabId]));
}

// 事件监听
chrome.browserAction.onClicked.addListener(toggleWatchreloadState);
chrome.tabs.onRemoved.addListener(tabRemove);
chrome.tabs.onUpdated.addListener(tabUpdate);