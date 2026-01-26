import { ArrowDownIcon, TvIcon, Cog6ToothIcon, CheckCircleIcon } from '@heroicons/react/16/solid';
import { useContext, useState, useRef } from 'react';
import { GlobalStateContext } from '../components/ClientContext.jsx';
import { useTranslation } from 'react-i18next';
import { Events } from '../components/WebSocketClient.js';

export default function Desktop() {
    const context = useContext(GlobalStateContext);
    const { t } = useTranslation();
    const [ip, setIp] = useState('');
    const [customRepo, setCustomRepo] = useState('OneLiberty/moonlight-chrome-tizen');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const ipInputRef = useRef(null);

    const handleConnect = () => {
        if (ip) {
            context.state.client.send({
                type: Events.ConnectToTV,
                payload: ip
            });
        }
    };

    const handleInstall = () => {
        context.state.client.send({
            type: Events.InstallPackage,
            payload: {
                url: customRepo
            }
        });
    };

    const isConnected = context.state.sharedData.connectedToTV;

    return (
        <div className="relative isolate px-4 py-8 h-full">
            {/* Samsung Auth Modal */}
            {context.state.sharedData.qrCodeShow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg mx-4 border border-gray-700">
                        <h3 className="text-2xl font-bold mb-4 text-white">{t('resigning.resigningRequired')}</h3>
                        <p className="text-gray-300 mb-6 whitespace-pre-line text-sm">{t('resigning.resigningRequiredPCDesc')}</p>
                        <button
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            onClick={() => {
                                window.open('https://account.samsung.com/mobile/account/check.do?serviceID=v285zxnl3h&actionID=StartOAuth2&accessToken=Y&redirect_uri=http://localhost:4794/signin/callback', '_blank');
                            }}
                        >
                            {t('resigning.resigningRequiredOpenAuthButton')}
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-xl mx-auto space-y-6">
                {/* Step 1: Connect to TV */}
                <div className={`bg-gray-900 rounded-2xl p-6 border shadow-xl transition-all duration-300 ${isConnected ? 'border-green-700' : 'border-gray-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isConnected ? 'bg-green-600' : 'bg-indigo-600'}`}>
                            {isConnected ? <CheckCircleIcon className="h-5 w-5" /> : '1'}
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            {t('installer.connectToTV')}
                        </h3>
                        {isConnected && (
                            <span className="ml-auto text-green-400 text-sm font-medium">{t('installer.connected')}</span>
                        )}
                    </div>

                    {!isConnected ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('installer.tvIpAddress')}
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={ip}
                                        ref={ipInputRef}
                                        className="flex-1 p-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                        onChange={(e) => setIp(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleConnect();
                                            }
                                        }}
                                        placeholder="192.168.1.100"
                                    />
                                    <button
                                        onClick={handleConnect}
                                        disabled={!ip}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                                    >
                                        <TvIcon className="h-5 w-5" />
                                        {t('installer.connect')}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {t('installer.devModeHint')}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">
                            {t('installer.connectedSuccess')}
                        </p>
                    )}
                </div>

                {/* Step 2: Install Moonlight */}
                <div className={`bg-gray-900 rounded-2xl p-6 border shadow-xl transition-all duration-300 ${isConnected ? 'border-gray-800' : 'border-gray-800/50 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isConnected ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                            2
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            {t('installer.installTB')}
                        </h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                        {t('installer.streamDescription')}
                    </p>

                    <button
                        onClick={handleInstall}
                        disabled={!isConnected}
                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 disabled:shadow-none"
                    >
                        <ArrowDownIcon className="h-6 w-6" />
                        {t('installer.installTB')}
                    </button>

                    {/* Advanced Options Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        disabled={!isConnected}
                        className="w-full mt-4 py-2 text-gray-400 hover:text-gray-300 disabled:text-gray-600 text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <Cog6ToothIcon className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                        {showAdvanced ? t('installer.hideAdvancedOptions') : t('installer.advancedOptions')}
                    </button>

                    {/* Advanced Options */}
                    {showAdvanced && isConnected && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('installer.customRepository')}
                            </label>
                            <input
                                type="text"
                                value={customRepo}
                                className="w-full p-3 rounded-lg bg-gray-900 text-gray-200 text-sm border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                onChange={(e) => setCustomRepo(e.target.value)}
                                placeholder="owner/repo"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                {t('installer.repoFormatHint')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Footer */}
                <div className="text-center text-gray-500 text-xs">
                    <p>{t('installer.repository')}: {customRepo}</p>
                </div>
            </div>
        </div>
    );
}
