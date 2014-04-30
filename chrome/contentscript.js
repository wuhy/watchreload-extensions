/**
 * @file 注入的内容脚本
 * @author sparklewhy@gmail.com
 */
var watchreload = {

    /**
     * 获取要注入的脚本的 URL
     *
     * @param {Object} options 要注入的脚本的选项
     * @return {string}
     */
    getInjectScriptUrl: function (options) {
        return 'http://' + options.ip + ':' + options.port + '/' + options.js;
    },

    /**
     * 根据给定的脚本 url ，查找脚本DOM元素
     *
     * @param {string} scriptUrl 脚本url
     * @return {HTMLElement}
     */
    findScriptElement: function (scriptUrl) {
        var scriptElems = document.getElementsByTagName('script');
        for (var i = 0, len = scriptElems.length; i < len; i++) {
            var elem = scriptElems[i];
            if (elem.src === scriptUrl) {
                return elem;
            }
        }
    },

    /**
     * 启用 `watchreload`
     *
     * @param {Object} options 选项信息
     */
    enable: function (options) {
        var injectScriptUrl = watchreload.getInjectScriptUrl(options);

        // 如果已经注入过了，则无需重复注入
        if (watchreload.findScriptElement(injectScriptUrl)) {
            return;
        }

        // 注入脚本
        var script = document.createElement('script');
        script.src = injectScriptUrl;
        document.body.appendChild(script);
    },

    /**
     * 禁用 `watchreload`
     *
     * @param {Object} options 选项信息
     */
    disable: function (options) {
        var injectScriptUrl = watchreload.getInjectScriptUrl(options);
        var scriptElem = watchreload.findScriptElement(injectScriptUrl);

        // 存在注入的脚本，直接重新刷新页面
        if (scriptElem) {
            window.document.location.reload();
        }
    }
};

// 监听扩展传递进来的消息
chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.enabled) {
        watchreload.enable(msg);
    }
    else {
        watchreload.disable(msg);
    }
});

