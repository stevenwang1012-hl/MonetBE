/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_LINE_LIFF_ID: string
    readonly VITE_LINE_OA_ID: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
