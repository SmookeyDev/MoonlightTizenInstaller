import { HomeIcon, InformationCircleIcon } from '@heroicons/react/16/solid';
import { useContext } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { GlobalStateContext } from './ClientContext.jsx';
import MoonlightLogo from '../assets/moonlight.png';
import { useTranslation } from 'react-i18next';

function NavButton({ children, route, isActive }) {
    const location = useLocation();

    return (
        <button
            className={`p-3 rounded-xl ${
                isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
            }`}
            onClick={() => location.route(route)}
        >
            {children}
        </button>
    );
}

export default function Header() {
    const { state } = useContext(GlobalStateContext);
    const { t } = useTranslation();
    const location = useLocation();

    const currentPath = location.path || window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
    const isAbout = currentPath.includes('/about');

    return (
        <header className="bg-gray-900 border-b border-gray-800 h-[8vh]">
            <nav className="flex items-center justify-between px-8 h-[8vh]">
                <div className="flex items-center">
                    <img
                        src={MoonlightLogo}
                        className="h-[6vh] w-auto"
                        alt="Moonlight"
                    />
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-gray-800 border border-gray-700">
                        <span className="text-sm text-gray-300">
                            {t(state?.sharedData?.state || '...')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <NavButton route="/" isActive={isHome}>
                        <HomeIcon className="h-6 w-6" />
                    </NavButton>
                    <NavButton route="/about" isActive={isAbout}>
                        <InformationCircleIcon className="h-6 w-6" />
                    </NavButton>
                </div>
            </nav>
        </header>
    );
}
