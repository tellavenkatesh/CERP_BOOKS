
> client@0.0.0 build
> tsc -b && vite build

[36mvite v7.3.0 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 1109 modules transformed.
[31m✗[39m Build failed in 1.39s
[31merror during build:
[31m[vite]: Rollup failed to resolve import "src/components/ui/label" from "C:/TellaWA/Compreo_Books_ERP/Client/src/components/ui/form.tsx".
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
`build.rollupOptions.external`[31m
    at viteLog (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/vite/dist/node/chunks/config.js:33634:57)
    at file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/vite/dist/node/chunks/config.js:33668:73
    at onwarn (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/@vitejs/plugin-react/dist/index.js:76:7)
    at file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/vite/dist/node/chunks/config.js:33668:28
    at onRollupLog (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/vite/dist/node/chunks/config.js:33663:63)
    at onLog (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/vite/dist/node/chunks/config.js:33466:4)
    at file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/rollup/dist/es/shared/node-entry.js:21032:32
    at Object.logger [as onLog] (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/rollup/dist/es/shared/node-entry.js:22919:9)
    at ModuleLoader.handleInvalidResolvedId (file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/rollup/dist/es/shared/node-entry.js:21663:26)
    at file:///C:/TellaWA/Compreo_Books_ERP/Client/node_modules/rollup/dist/es/shared/node-entry.js:21621:26[39m
