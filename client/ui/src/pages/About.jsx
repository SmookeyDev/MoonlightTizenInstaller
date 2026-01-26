import { useContext } from 'preact/hooks';
import { GlobalStateContext } from '../components/ClientContext.jsx';
import { useTranslation } from 'react-i18next';
import MoonlightLogo from '../assets/moonlight.png';

export default function About() {
    const { state } = useContext(GlobalStateContext);
    const { t } = useTranslation();
    const tvInfo = state?.sharedData?.tvInfo;

    return (
        <div className="relative isolate px-6 py-8 h-full">
            <div className="max-w-md mx-auto">
                {/* Main Card */}
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img src={MoonlightLogo} className="h-16 w-auto" alt="Moonlight" />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-1">{t('about.title')}</h1>
                        <p className="text-gray-400 text-sm">{t('about.description')}</p>
                    </div>

                    {/* Links */}
                    <div className="space-y-3 mb-6">
                        <a
                            href="https://github.com/OneLiberty/moonlight-chrome-tizen"
                            target="_blank"
                            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-gray-300 text-sm">{t('about.moonlightTizen')}</span>
                            <span className="text-indigo-400 text-sm">{t('about.github')} →</span>
                        </a>
                        <a
                            href="https://github.com/SmookeyDev/MoonlightTizenInstaller"
                            target="_blank"
                            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-gray-300 text-sm">{t('about.moonlightInstaller')}</span>
                            <span className="text-indigo-400 text-sm">{t('about.github')} →</span>
                        </a>
                    </div>

                    {/* TV Info (when connected) */}
                    {tvInfo && (
                        <div className="space-y-2 mb-6 pt-4 border-t border-gray-800">
                            {tvInfo.tizenVersion && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{t('about.tizen')}</span>
                                    <span className="text-gray-300">{tvInfo.tizenVersion}</span>
                                </div>
                            )}
                            {tvInfo.model && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{t('about.tvModel')}</span>
                                    <span className="text-gray-300">{tvInfo.model}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-800 text-center">
                        <a
                            href="https://github.com/reisxd/TizenBrewInstaller"
                            target="_blank"
                            className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
                        >
                            {t('about.basedOn')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
