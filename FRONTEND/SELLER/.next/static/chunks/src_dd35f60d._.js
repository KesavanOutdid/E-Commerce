(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_dd35f60d._.js", {

"[project]/src/app/components/Layout/Header/Logo/index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
;
const Logo = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: "/",
        className: "text-white font-bold text-xl hover:opacity-90 transition-opacity",
        children: "OUTDID E-Seller"
    }, void 0, false, {
        fileName: "[project]/src/app/components/Layout/Header/Logo/index.tsx",
        lineNumber: 5,
        columnNumber: 9
    }, this);
};
_c = Logo;
const __TURBOPACK__default__export__ = Logo;
var _c;
__turbopack_context__.k.register(_c, "Logo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const HeaderLink = ({ item })=>{
    _s();
    const [submenuOpen, setSubmenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const handleMouseEnter = ()=>{
        if (item.submenu) {
            setSubmenuOpen(true);
        }
    };
    const handleMouseLeave = ()=>{
        setSubmenuOpen(false);
    };
    const isActive = ()=>{
        if (item.href.startsWith('/#')) {
            return path === '/' && "object" !== 'undefined' && window.location.hash === item.href.substring(1);
        }
        if (item.href === '/') {
            return path === '/';
        }
        return path.startsWith(item.href);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: item.href,
                className: `text-base flex font-medium hover:text-white/80 capitalized relative pb-1 ${isActive() ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' : 'text-white/90'}`,
                children: [
                    item.label,
                    item.submenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: "1.5em",
                        height: "1.5em",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            fill: "none",
                            stroke: "currentColor",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: "1.5",
                            d: "m7 10l5 5l5-5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
                            lineNumber: 48,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            submenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute py-2 left-0 mt-0.5 w-60 bg-white dark:bg-darklight dark:text-white shadow-lg rounded-lg `,
                "data-aos": "fade-up",
                "data-aos-duration": "500",
                children: item.submenu?.map((subItem, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: subItem.href,
                        className: `block px-4 py-2   ${path === subItem.href ? 'bg-primary text-white' : 'text-black dark:text-white hover:bg-primary'}`,
                        children: subItem.label
                    }, index, false, {
                        fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
                        lineNumber: 65,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
};
_s(HeaderLink, "IFtruYPelrIkmFLkGWAB5OCZPDs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = HeaderLink;
const __TURBOPACK__default__export__ = HeaderLink;
var _c;
__turbopack_context__.k.register(_c, "HeaderLink");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const MobileHeaderLink = ({ item })=>{
    _s();
    const [submenuOpen, setSubmenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const handleToggle = ()=>{
        setSubmenuOpen(!submenuOpen);
    };
    const isActive = ()=>{
        if (item.href.startsWith('/#')) {
            return path === '/' && "object" !== 'undefined' && window.location.hash === item.href.substring(1);
        }
        if (item.href === '/') {
            return path === '/';
        }
        return path.startsWith(item.href);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: item.href,
                onClick: item.submenu ? handleToggle : undefined,
                className: `flex items-center justify-between w-full py-2 px-3 rounded-lg focus:outline-hidden ${isActive() ? 'text-primary font-bold bg-primary/10' : 'text-black hover:bg-gray-100'}`,
                children: [
                    item.label,
                    item.submenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: "1.5em",
                        height: "1.5em",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            fill: "none",
                            stroke: "currentColor",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: "1.5",
                            d: "m7 10l5 5l5-5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            submenuOpen && item.submenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white p-2 w-full",
                children: item.submenu.map((subItem, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: subItem.href,
                        className: "block py-2 text-gray-500 hover:bg-gray-200",
                        children: subItem.label
                    }, index, false, {
                        fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
                lineNumber: 54,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
};
_s(MobileHeaderLink, "IFtruYPelrIkmFLkGWAB5OCZPDs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = MobileHeaderLink;
const __TURBOPACK__default__export__ = MobileHeaderLink;
var _c;
__turbopack_context__.k.register(_c, "MobileHeaderLink");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/utils/basePath.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "getBasePath": (()=>getBasePath),
    "withBasePath": (()=>withBasePath)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const getBasePath = ()=>{
    return ("TURBOPACK compile-time value", "") || '';
};
const withBasePath = (path)=>{
    const base = getBasePath();
    if (!path) return base;
    if (path.startsWith('/')) return `${base}${path}`;
    return `${base}/${path}`;
};
const __TURBOPACK__default__export__ = withBasePath;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/context/AuthContext.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const storedToken = localStorage.getItem('seller_token');
            const storedUser = localStorage.getItem('seller_user');
            if (storedToken && storedUser && storedUser !== 'undefined') {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    localStorage.removeItem('seller_token');
                    localStorage.removeItem('seller_user');
                }
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = (newToken, userData)=>{
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('seller_token', newToken);
        localStorage.setItem('seller_user', JSON.stringify(userData));
    };
    const logout = ()=>{
        setToken(null);
        setUser(null);
        localStorage.removeItem('seller_token');
        localStorage.removeItem('seller_user');
    };
    const updateUser = (userData)=>{
        const updatedUser = {
            ...user,
            ...userData
        };
        setUser(updatedUser);
        localStorage.setItem('seller_user', JSON.stringify(updatedUser));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            token,
            login,
            logout,
            updateUser,
            isAuthenticated: !!token,
            isLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 101,
        columnNumber: 9
    }, this);
};
_s(AuthProvider, "mX4/AXRUN66G8j/NKXHYWKblzjI=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Layout/Header/index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Logo$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Layout/Header/Logo/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Navigation$2f$HeaderLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Layout/Header/Navigation/HeaderLink.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Navigation$2f$MobileHeaderLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Layout/Header/Navigation/MobileHeaderLink.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@iconify/react/dist/iconify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/basePath.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const Header = ()=>{
    _s();
    const { user, logout, isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [headerData, setHeaderData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [navbarOpen, setNavbarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sticky, setSticky] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const mobileMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const accountDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Header.useEffect": ()=>{
            const fetchData = {
                "Header.useEffect.fetchData": async ()=>{
                    try {
                        const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('/data/data.json'));
                        if (!res.ok) throw new Error('Failed to fetch');
                        const data = await res.json();
                        setHeaderData(data.HeaderData);
                    } catch (error) {
                        console.error('Error fetching services:', error);
                    }
                }
            }["Header.useEffect.fetchData"];
            fetchData();
        }
    }["Header.useEffect"], []);
    const handleScroll = ()=>{
        setSticky(window.scrollY >= 10);
    };
    const handleClickOutside = (event)=>{
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && navbarOpen) {
            setNavbarOpen(false);
        }
        if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
            setIsAccountDropdownOpen(false);
        }
    };
    const handleLogout = ()=>{
        logout();
        setIsAccountDropdownOpen(false);
        router.push('/');
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Header.useEffect": ()=>{
            window.addEventListener('scroll', handleScroll);
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "Header.useEffect": ()=>{
                    window.removeEventListener('scroll', handleScroll);
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            })["Header.useEffect"];
        }
    }["Header.useEffect"], [
        navbarOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Header.useEffect": ()=>{
            if (navbarOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }["Header.useEffect"], [
        navbarOpen
    ]);
    const filteredHeaderData = headerData.filter((item)=>{
        if (!isAuthenticated && (item.label === 'Products' || item.label === 'Orders')) {
            return false;
        }
        return true;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: `fixed top-0 z-40 w-full transition-all duration-300 ${sticky ? ' shadow-lg bg-primary py-4' : 'shadow-none py-4 bg-primary'}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto max-w-7xl px-4 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Logo$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                            lineNumber: 96,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "hidden lg:flex grow items-center gap-8 justify-start ml-14",
                            children: filteredHeaderData.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Navigation$2f$HeaderLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    item: item
                                }, index, false, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 99,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                            lineNumber: 97,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                !isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "hidden lg:block bg-white text-primary border border-white hover:bg-transparent hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer font-medium",
                                            onClick: ()=>router.push('/signin'),
                                            children: "Sign In"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 105,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "hidden lg:block bg-white text-primary text-base font-medium hover:bg-transparent hover:text-white border border-white px-6 py-2 rounded-lg hover:cursor-pointer",
                                            onClick: ()=>router.push('/signup'),
                                            children: "Start Selling"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 110,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden lg:block relative",
                                    ref: accountDropdownRef,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsAccountDropdownOpen(!isAccountDropdownOpen),
                                            className: "flex items-center gap-2 bg-white text-primary border border-white hover:bg-transparent hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer font-medium",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    icon: "mdi:account-circle",
                                                    width: 24,
                                                    height: 24
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        user?.firstName,
                                                        " ",
                                                        user?.lastName
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 122,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    icon: "mdi:chevron-down",
                                                    width: 20,
                                                    height: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 118,
                                            columnNumber: 33
                                        }, this),
                                        isAccountDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setIsAccountDropdownOpen(false);
                                                        router.push('/profile');
                                                    },
                                                    className: `w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${pathname === '/profile' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:account",
                                                            width: 20,
                                                            height: 20
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                            lineNumber: 135,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Profile"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setIsAccountDropdownOpen(false);
                                                        router.push('/kyc');
                                                    },
                                                    className: `w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${pathname === '/kyc' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:file-document-check",
                                                            width: 20,
                                                            height: 20
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 45
                                                        }, this),
                                                        "KYC"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setIsAccountDropdownOpen(false);
                                                        router.push('/pickup-addresses');
                                                    },
                                                    className: `w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${pathname === '/pickup-addresses' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:map-marker-multiple",
                                                            width: 20,
                                                            height: 20
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Pickup Address"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                                    className: "my-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleLogout,
                                                    className: "w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:logout",
                                                            width: 20,
                                                            height: 20
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                            lineNumber: 164,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Logout"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 126,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 117,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setNavbarOpen(!navbarOpen),
                                    className: "block lg:hidden p-2 rounded-lg",
                                    "aria-label": "Toggle mobile menu",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block w-6 h-0.5 bg-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 175,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block w-6 h-0.5 bg-white mt-1.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 176,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block w-6 h-0.5 bg-white mt-1.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                            lineNumber: 177,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 171,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                            lineNumber: 102,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                    lineNumber: 95,
                    columnNumber: 17
                }, this),
                navbarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed top-0 left-0 w-full h-full bg-black/50 z-40"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                    lineNumber: 182,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: mobileMenuRef,
                    className: `lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? 'translate-x-0' : 'translate-x-full'} z-50`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-bold text-midnight_text",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Logo$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                        lineNumber: 190,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 189,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setNavbarOpen(false),
                                    className: "bg-black/30 rounded-full p-1 text-white",
                                    "aria-label": "Close menu Modal",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        icon: 'material-symbols:close-rounded',
                                        width: 24,
                                        height: 24
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                        lineNumber: 197,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 193,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                            lineNumber: 188,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex flex-col items-start p-4",
                            children: [
                                filteredHeaderData.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Layout$2f$Header$2f$Navigation$2f$MobileHeaderLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        item: item
                                    }, index, false, {
                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                        lineNumber: 206,
                                        columnNumber: 29
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 flex flex-col gap-4 w-full",
                                    children: !isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out",
                                                onClick: ()=>{
                                                    router.push('/signin');
                                                    setNavbarOpen(false);
                                                },
                                                children: "Sign In"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 211,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out",
                                                onClick: ()=>{
                                                    router.push('/signup');
                                                    setNavbarOpen(false);
                                                },
                                                children: "Start Selling"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 219,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-4 py-2 border-b border-gray-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Welcome,"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-semibold text-black",
                                                        children: [
                                                            user?.firstName,
                                                            " ",
                                                            user?.lastName
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 230,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${pathname === '/profile' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-transparent text-black border-gray-300'}`,
                                                onClick: ()=>{
                                                    router.push('/profile');
                                                    setNavbarOpen(false);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        icon: "mdi:account",
                                                        width: 20,
                                                        height: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Profile"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 234,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${pathname === '/kyc' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-transparent text-black border-gray-300'}`,
                                                onClick: ()=>{
                                                    router.push('/kyc');
                                                    setNavbarOpen(false);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        icon: "mdi:file-document-check",
                                                        width: 20,
                                                        height: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 41
                                                    }, this),
                                                    "KYC"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 247,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${pathname === '/pickup-addresses' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-transparent text-black border-gray-300'}`,
                                                onClick: ()=>{
                                                    router.push('/pickup-addresses');
                                                    setNavbarOpen(false);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        icon: "mdi:map-marker-multiple",
                                                        width: 20,
                                                        height: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Pickup Address"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 260,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "bg-red-600 text-white px-4 py-2 rounded-lg border border-red-600 hover:bg-red-700 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2",
                                                onClick: ()=>{
                                                    handleLogout();
                                                    setNavbarOpen(false);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        icon: "mdi:logout",
                                                        width: 20,
                                                        height: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Logout"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                                lineNumber: 273,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                                    lineNumber: 208,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                            lineNumber: 204,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Layout/Header/index.tsx",
                    lineNumber: 184,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Layout/Header/index.tsx",
            lineNumber: 94,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/Layout/Header/index.tsx",
        lineNumber: 91,
        columnNumber: 9
    }, this);
};
_s(Header, "48Il5tB5boGJtPYZBP6mqn7NGLA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Header;
const __TURBOPACK__default__export__ = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Layout/Footer/index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@iconify/react/dist/iconify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/basePath.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const Footer = ()=>{
    _s();
    const [footerlink, SetFooterlink] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Footer.useEffect": ()=>{
            const fetchData = {
                "Footer.useEffect.fetchData": async ()=>{
                    try {
                        const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('/data/data.json'));
                        if (!res.ok) throw new Error('Failed to fetch');
                        const data = await res.json();
                        SetFooterlink(data.FooterLinkData);
                    } catch (error) {
                        console.error('Error fetching services:', error);
                    }
                }
            }["Footer.useEffect.fetchData"];
            fetchData();
        }
    }["Footer.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-primary",
        id: "first-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container pt-60 pb-10",
                style: {
                    paddingTop: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 xl:gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-4 flex flex-col gap-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('/images/logo/logo2.svg'),
                                        alt: "Logo",
                                        width: 48,
                                        height: 64
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                        lineNumber: 33,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                    lineNumber: 32,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white text-lg font-medium leading-7",
                                    children: [
                                        ' ',
                                        "Level up your skills, and get dream ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 37,
                                            columnNumber: 65
                                        }, this),
                                        " job with passion.",
                                        ' '
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                    lineNumber: 35,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "#!",
                                            scroll: false,
                                            className: "bg-white/20 rounded-full p-2 text-white hover:bg-cream hover:text-primary duration-300",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "tabler:brand-instagram",
                                                className: "text-2xl inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 44,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 40,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/",
                                            scroll: false,
                                            className: "bg-white/20 rounded-full p-2 text-white hover:bg-cream hover:text-primary duration-300",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "tabler:brand-dribbble",
                                                className: "text-2xl inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 53,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 49,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/",
                                            scroll: false,
                                            className: "bg-white/20 rounded-full p-2 text-white hover:bg-cream hover:text-primary duration-300",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "tabler:brand-twitter-filled",
                                                className: "text-2xl inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 62,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 58,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/",
                                            scroll: false,
                                            className: "bg-white/20 rounded-full p-2 text-white hover:bg-cream hover:text-primary duration-300",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "tabler:brand-youtube-filled",
                                                className: "text-2xl inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 71,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 67,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                    lineNumber: 39,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-20",
                                children: footerlink.map((product, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "group relative col-span-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-white text-xl font-semibold mb-9",
                                                children: product.section
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 84,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                children: product.links.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "mb-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: item.href,
                                                            scroll: item.href !== "/",
                                                            className: "text-white/60 hover:text-white text-sm font-normal mb-6",
                                                            children: item.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                            lineNumber: 90,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, i, false, {
                                                        fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                        lineNumber: 89,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 87,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                        lineNumber: 83,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                lineNumber: 81,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                            lineNumber: 80,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-white text-xl font-semibold mb-6",
                                    children: "Stay up to date"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                    lineNumber: 106,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative text-white focus-within:text-white flex flex-row-reverse w-[50%] lg:w-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "Email address",
                                            name: "q",
                                            className: "py-4 text-sm w-full text-white bg-white/15 rounded-md pl-4 focus:outline-hidden bg-emailbg focus:text-white",
                                            placeholder: "Your email address",
                                            autoComplete: "off"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 110,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-y-0 right-0 flex items-center pr-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "p-1 focus:outline-hidden focus:shadow-outline",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    icon: "tabler:send",
                                                    className: "text-white text-2xl inline-block me-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                                lineNumber: 118,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                            lineNumber: 117,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                                    lineNumber: 109,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                            lineNumber: 105,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                    lineNumber: 30,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                lineNumber: 29,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-center text-white/60",
                    children: [
                        "@2026 - All Rights Reserved by",
                        ' ',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "http://outdidunified.com/",
                            target: "_blank",
                            className: "hover:text-white",
                            children: [
                                ' ',
                                "OUTDID UNIFIED PVT LTD ",
                                ' '
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                            lineNumber: 134,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                    lineNumber: 132,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
                lineNumber: 131,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Layout/Footer/index.tsx",
        lineNumber: 28,
        columnNumber: 9
    }, this);
};
_s(Footer, "Qjwmf7H/QblNkhWtFzQP3xn384Y=");
_c = Footer;
const __TURBOPACK__default__export__ = Footer;
var _c;
__turbopack_context__.k.register(_c, "Footer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/ScrollToTop/index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ScrollToTop)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function ScrollToTop() {
    _s();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Top: 0 takes us all the way back to the top of the page
    // Behavior: smooth keeps it smooth!
    const scrollToTop = ()=>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollToTop.useEffect": ()=>{
            // Button is displayed after scrolling for 500 pixels
            const toggleVisibility = {
                "ScrollToTop.useEffect.toggleVisibility": ()=>{
                    if (window.pageYOffset > 300) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                }
            }["ScrollToTop.useEffect.toggleVisibility"];
            window.addEventListener('scroll', toggleVisibility);
            return ({
                "ScrollToTop.useEffect": ()=>window.removeEventListener('scroll', toggleVisibility)
            })["ScrollToTop.useEffect"];
        }
    }["ScrollToTop.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-8 right-8 z-999",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2.5",
            children: isVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: scrollToTop,
                "aria-label": "scroll to top",
                className: "back-to-top flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#102C46] text-white shadow-md transition duration-300 ease-in-out hover:bg-dark",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-[6px] h-3 w-3 rotate-45 border-l border-t border-white"
                }, void 0, false, {
                    fileName: "[project]/src/app/components/ScrollToTop/index.tsx",
                    lineNumber: 48,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/ScrollToTop/index.tsx",
                lineNumber: 44,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/components/ScrollToTop/index.tsx",
            lineNumber: 34,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/ScrollToTop/index.tsx",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
_s(ScrollToTop, "J3yJOyGdBT4L7hs1p1XQYVGMdrY=");
_c = ScrollToTop;
var _c;
__turbopack_context__.k.register(_c, "ScrollToTop");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/utils/aos.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$aos$2f$dist$2f$aos$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/aos/dist/aos.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const Aoscompo = ({ children })=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Aoscompo.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$aos$2f$dist$2f$aos$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].init({
                duration: 800,
                once: false
            });
        }
    }["Aoscompo.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/utils/aos.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
};
_s(Aoscompo, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Aoscompo;
const __TURBOPACK__default__export__ = Aoscompo;
var _c;
__turbopack_context__.k.register(_c, "Aoscompo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/providers.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Providers": (()=>Providers)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                position: "top-right"
            }, void 0, false, {
                fileName: "[project]/src/app/providers.tsx",
                lineNumber: 8,
                columnNumber: 13
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/providers.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_dd35f60d._.js.map