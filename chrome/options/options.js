/**
 * @file watchreload 选项设置
 * @author sparklewhy@gmail.com
 */

/**
 * 判断给定值是否是数字
 *
 * @param {string|number} value 要验证的值
 * @return {boolean}
 */
function isNumber(value) {
    value = String(value);

    if (value.length >= 2 && value.charAt(0) === '0') {
        return false;
    }

    return /^\d+$/.test(value);
}

/**
 * 验证给定的端口值的有效性
 *
 * @param {number} port 端口
 * @return {boolean}
 */
function validatePort(port) {
    return isNumber(port) && (port >= 0 && port <= 65535);
}

/**
 * 验证给定的IP地址有效性
 *
 * @param {string} ip ip地址
 * @return {boolean}
 */
function validateIP(ip) {
    ip = String(ip);
    if (ip === 'localhost') {
        return true;
    }

    var parts = ip.split('.');
    var len = parts.length;
    if (len !== 4) {
        return false;
    }

    for (var i = 0; i < len; i++) {
        var value = parts[i];
        if (!isNumber(value) || !(value >= 0 && value <= 255)) {
            return false;
        }
    }

    return true;
}

/**
 * 验证给定的ip和端口的有效性，如果无效 alert 错误消息
 *
 * @param {string} ip 要验证的ip地址
 * @param {number} port 要验证的端口
 * @return {boolean}
 */
function validateIPAndPort(ip, port) {
    var msg = '';
    if (!validateIP(ip)) {
        msg += 'IP地址值无效';
    }

    if (!validatePort(port)) {
        msg && (msg += '，');
        msg += '端口值无效'
    }

    if (msg) {
        alert(msg);
    }

    return !msg;
}

/**
 * 获取表单输入值
 *
 * @param {string} id 表单域id
 * @return {string}
 */
function getFormInputValue(id) {
    return String(document.getElementById(id).value).trim();
}

/**
 * 设置表单输入域值
 *
 * @param {string} id 表单域id
 * @param {string} value 要设置的值
 */
function setFormInputValue(id, value) {
    document.getElementById(id).value = value;
}

function generateValueGetterSetter(id) {
    return function () {
        if (arguments.length > 0) {
            setFormInputValue(id, arguments[0]);
        }
        else {
            return getFormInputValue(id);
        }
    };
}

// 初始化 ip 和 port 的 setter 和 getter
var ipValue = generateValueGetterSetter('ip');
var portValue = generateValueGetterSetter('port');

/**
 * 保存用户设置选项信息
 */
function saveOptions() {
    var ip = ipValue();
    var port = portValue();

    if (!validateIPAndPort(ip, port)) {
        return;
    }

    chrome.runtime.getBackgroundPage(function (bgPage) {
        bgPage.saveWatchreloadOptions({
            ip: ip,
            port: port
        }, function () {
            alert(chrome.runtime.lastError ? '保存失败' : '保存成功');
        });
    });
}

/**
 * 恢复用户上次设置值，若没有设置过，恢复为默认值
 */
function restoreOptions() {

    chrome.runtime.getBackgroundPage(function (bgPage) {
        bgPage.getWatchreloadOptions(function (options) {
            if (!chrome.runtime.lastError) {
                ipValue(options.ip);
                portValue(options.port);
            }
        });
    });
}

// 事件监听
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-btn').addEventListener('click', saveOptions);