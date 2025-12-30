const os = require('os');

function getNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const ips = {
        localhost: 'localhost',
        lan: [],
        wsl: []
    };

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                    ips.lan.push(iface.address);
                } else if (iface.address.startsWith('172.')) {
                    ips.wsl.push(iface.address);
                }
            }
        }
    }

    return ips;
}

module.exports = { getNetworkIPs };
