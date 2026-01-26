"use strict";

module.exports.onStart = function () {
    console.log('Service started');
    const express = require('express');
    const fetch = require('node-fetch');
    const adbhost = require('adbhost');
    const { readConfig, writeConfig } = require('./utils/configuration.js');
    const { fetchLatestRelease } = require('./utils/GitHubAPI.js')
    const { createSamsungCertificate, resignPackage } = require('./utils/SamsungCertificateCreation.js');
    const { existsSync } = require('fs');
    const { join, dirname } = require('path');
    const { parsePackage, installPackage } = require('./utils/PackageInstallation.js');
    const { Connection, Events } = require('./utils/wsCommunication.js');
    const AccessInfoHTMLPage = require('./utils/HTMLPage.js');
    const PushFile = require('./utils/FilePusher.js');

    const WebSocket = require('ws');
    let adbClient;
    let wsClient = null;
    let isTizen7OrHigher = false;

    const app = express();

    // Enable static file serving for frontend
    console.log('Open up http://localhost:8091 to access the Moonlight Tizen Installer.');
    const uiPath = process.env.UI_PATH
        || (existsSync(`${process.platform === 'win32' ? 'C:\\' : '/'}snapshot/client/ui/dist`)
            ? `${process.platform === 'win32' ? 'C:\\' : '/'}snapshot/client/ui/dist`
            : join(__dirname, '../../ui/dist'));
    app.use(express.static(uiPath));

    const wsServer = new WebSocket.Server({ server: app.listen(8091) });

    function createAdbConnection(ip) {
        return new Promise((resolve, reject) => {
            try {
                if (adbClient) {
                    if (adbClient._stream) {
                        adbClient._stream.removeAllListeners('connect');
                        adbClient._stream.removeAllListeners('error');
                        adbClient._stream.removeAllListeners('close');
                    }
                }

                adbClient = adbhost.createConnection({ host: ip || '127.0.0.1', port: 26101 });
                let hasConnected = false;
                const waitTimeout = setTimeout(() => {
                    if (hasConnected) resolve(adbClient)
                }, 1000);

                adbClient._stream.on('connect', () => {
                    hasConnected = true;
                });

                adbClient._stream.on('error', (e) => {
                    adbClient = null;
                    hasConnected = false;
                    clearTimeout(waitTimeout);
                    if (e.code === 'ECONNREFUSED') {
                        reject(new Error('installerDesktop.sdbConnectionRefused'));
                    } else if (e.code === 'ECONNRESET') {
                        reject(new Error('installerDesktop.sdbConnectionReset'));
                    } else {
                        reject(new Error('ADB connection error: ' + e));
                    }
                });

                adbClient._stream.on('close', () => {
                    adbClient = null;
                    clearTimeout(waitTimeout);
                    reject(new Error('ADB connection closed.'));
                });
            } catch (e) {
                reject(new Error('ADB connection error: ' + e));
            }
        });
    }

    wsServer.on('connection', (ws) => {
        const wsConn = new Connection(ws);
        wsClient = wsConn;
        ws.on('message', (message) => {
            let msg;
            try {
                msg = JSON.parse(message)
            } catch (e) {
                return wsConn.send(wsConn.Event(Events.Error, `Invalid JSON: ${message}`));
            }

            const { type, payload } = msg;

            switch (type) {
                case Events.InstallPackage: {
                    if (isTizen7OrHigher) {
                        // Check if we have author and distributor certificates
                        const config = readConfig();
                        if (!config.authorCert || !config.distributorCert || !config.password) {
                            return wsConn.send(wsConn.Event(Events.InstallPackage, { response: 2 }));
                        }
                    }

                    function parseAndInstall(buffer) {
                        parsePackage(buffer)
                            .then(pkg => {
                                wsConn.send(wsConn.Event(Events.InstallationStatus, 'installStatus.installing'));
                                PushFile(adbClient, `/home/owner/share/tmp/sdk_tools/package.${pkg.isWgt ? 'wgt' : 'tpk'}`, buffer, () => {
                                    installPackage(`/home/owner/share/tmp/sdk_tools/package.${pkg.isWgt ? 'wgt' : 'tpk'}`, pkg.packageId, adbClient)
                                        .then(result => {
                                            wsConn.send(wsConn.Event(Events.InstallationStatus, 'installStatus.installed'));
                                            wsConn.send(wsConn.Event(Events.InstallPackage, { response: 0, result }));
                                        });
                                });
                            })
                            .catch(err => {
                                wsConn.send(wsConn.Event(Events.Error, `Error parsing package: ${err.message}`));
                                console.error(err);
                            });
                    }

                    if (payload.url.split('/').length === 2) {
                        // GitHub repository
                        wsConn.send(wsConn.Event(Events.InstallationStatus, 'installStatus.fetching'));
                        fetchLatestRelease(payload.url)
                            .then(release => {
                                const asset = release.assets.find(a => a.name.endsWith('.wgt') || a.name.endsWith('.tpk'));
                                fetch(asset.browser_download_url)
                                    .then(res => res.buffer())
                                    .then(buffer => {
                                        if (isTizen7OrHigher) {
                                            wsConn.send(wsConn.Event(Events.InstallationStatus, 'installStatus.resigning'));
                                            const config = readConfig();
                                            const certificates = {
                                                authorCert: Buffer.from(config.authorCert, 'base64').toString('binary'),
                                                distributorCert: Buffer.from(config.distributorCert, 'base64').toString('binary'),
                                                password: config.password
                                            };

                                            resignPackage(certificates, buffer)
                                                .then(resignedBuffer => {
                                                    wsConn.send(wsConn.Event(Events.InstallationStatus, 'installStatus.parsing'));
                                                    parseAndInstall(resignedBuffer);
                                                })
                                                .catch(err => {
                                                    wsConn.send(wsConn.Event(Events.Error, `Error resigning package: ${err.message}`));
                                                });
                                        } else parseAndInstall(buffer);
                                    })
                                    .catch(err => {
                                        wsConn.send(wsConn.Event(Events.Error, `Error fetching release asset: ${err.message}`));
                                    });
                            }).catch(err => {
                                wsConn.send(wsConn.Event(Events.Error, `Error fetching GitHub release: ${err.message}`));
                            });
                    }

                    break;
                }

                case Events.DeleteConfiguration: {
                    const config = readConfig();
                    config.authorCert = null;
                    config.distributorCert = null;
                    config.password = null;
                    writeConfig(config);
                    wsConn.send(wsConn.Event(Events.DeleteConfiguration, null));
                    break;
                }
                case Events.ConnectToTV: {
                    try {
                        createAdbConnection(payload)
                            .then(client => {
                                adbClient = client;
                                const sysinfoCommand = adbClient.createStream('sysinfo:');
                                sysinfoCommand.on('data', (data) => {
                                    const INFOBUF_MAXLEN = 64;
                                    const model_name = data.slice(0, INFOBUF_MAXLEN).toString().replace(/\0/g, '');
                                    const platform_version = data.slice(INFOBUF_MAXLEN * 3, INFOBUF_MAXLEN * 4).toString().replace(/\0/g, '');
                                    isTizen7OrHigher = Number(platform_version.split('.')[0]) >= 7;
                                    wsConn.send(wsConn.Event(Events.ConnectToTV, {
                                        success: true,
                                        tvInfo: {
                                            model: model_name,
                                            tizenVersion: platform_version
                                        }
                                    }));
                                });
                            })
                            .catch(err => {
                                wsConn.send(wsConn.Event(Events.ConnectToTV, { success: false, error: err.message }));
                            });
                    } catch (e) {
                        wsConn.send(wsConn.Event(Events.ConnectToTV, { success: false, error: e.message }));
                    }
                    break;
                }
                default: {
                    wsConn.send(wsConn.Event(Events.Error, 'Invalid event type.'));
                    break;
                }
            }
        });
    });

    const appAccess = express();

    appAccess.use(express.urlencoded({ extended: false }));

    appAccess.use((request, response) => {
        if (request.method !== 'GET') {
            const body = JSON.parse(request.body.code);
            const accessInfo = {
                accessToken: body.access_token,
                userId: body.userId
            };

            // Randomly generate a password
            const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4);

            const authorInfo = {
                name: 'MoonlightInstaller',
                email: body.inputEmailID,
                password: password,
                privilegeLevel: 'Partner'
            };

            createSamsungCertificate(authorInfo, accessInfo, adbClient, false)
                .then(certificate => {
                    const currentConfig = readConfig();
                    currentConfig.authorCert = Buffer.from(certificate.authorCert, 'binary').toString('base64');
                    currentConfig.distributorCert = Buffer.from(certificate.distributorCert, 'binary').toString('base64');
                    currentConfig.password = password;
                    PushFile(adbClient, '/home/owner/share/tmp/sdk_tools/device-profile.xml', Buffer.from(certificate.distributorXML, 'utf8'), () => {
                        console.log('Device profile pushed to TV');
                    });
                    writeConfig(currentConfig);
                    if (wsClient) {
                        wsClient.send(wsClient.Event(Events.InstallPackage, { response: 1 }));
                    }
                    response.status(200).send('Certificate creation was successful. You can now close this window.');
                })
                .catch(err => {
                    response.status(500).json({ error: err.message });
                });
        } else {
            response.send(AccessInfoHTMLPage);
        }
    });

    appAccess.listen(4794);
}

module.exports.onStart();
